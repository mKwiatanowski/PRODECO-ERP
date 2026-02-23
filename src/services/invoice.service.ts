import { AppDataSource } from "../core/db/data-source";
import { Invoice, InvoiceType } from "../database/entities/invoice.entity";
import { InvoiceItem } from "../database/entities/invoice-item.entity";
import { Product, ProductType } from "../database/entities/product.entity";
import { InventoryTransaction, InventoryTransactionType } from "../database/entities/inventory-transaction.entity";
import { EntityManager } from "typeorm";
import { InventoryDocument, DocumentType } from "../modules/inventory/domain/inventory-document.entity";
import { InventoryDocumentItem } from "../modules/inventory/domain/inventory-document-item.entity";
import { InventoryBatch } from "../modules/inventory/domain/inventory-batch.entity";
import { InventoryService } from "../modules/inventory/inventory.service";

export class KSeFCalculator {
    /**
     * Weryfikuje czy Netto + VAT = Brutto w groszach.
     */
    static validate(netCents: number, vatCents: number, grossCents: number): boolean {
        return netCents + vatCents === grossCents;
    }

    /**
     * Oblicza wartość VAT i Brutto na podstawie Netto i stawki procentowej.
     * Uwaga: stawka VAT jako string np. "23%".
     */
    static calculateFromNet(netCents: number, vatRateStr: string): { vatCents: number, grossCents: number } {
        const rate = parseInt(vatRateStr.replace("%", ""), 10) / 100;
        const vatCents = Math.round(netCents * rate);
        return {
            vatCents,
            grossCents: netCents + vatCents
        };
    }
}


export class InvoiceService {
    /**
     * Tworzy fakturę wraz z pozycjami i ruchami magazynowymi w jednej transakcji.
     */
    async createInvoice(invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
        console.log(`[InvoiceService] createInvoice called. Items count: ${items.length}`);
        return await AppDataSource.transaction(async (manager: EntityManager) => {
            // 1. Walidacja matematyczna całości
            const totals = this.validateAndCalculateTotals(items);

            // 2. Sprawdzenie typu faktury i logiki magazynowej
            await this.processInventoryTransactions(invoiceData, items, manager);

            // 3. Zapis nagłówka faktury
            const invoice = manager.create(Invoice, {
                ...invoiceData,
                totalNetCents: totals.totalNet,
                totalVatCents: totals.totalVat,
                totalGrossCents: totals.totalGross
            });

            const savedInvoice = await manager.save(invoice);

            // 4. Zapis pozycji faktury
            await this.saveInvoiceItems(savedInvoice.id, items, manager);

            console.log(`[InvoiceService] Pomyślnie utworzono fakturę ${savedInvoice.invoiceNumber} wraz z pozycjami.`);
            return savedInvoice;
        });
    }

    /**
     * Aktualizuje fakturę wraz z pozycjami i koryguje ruchy magazynowe.
     */
    async updateInvoice(id: string, invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
        return await AppDataSource.transaction(async (manager: EntityManager) => {
            const existingInvoice = await manager.findOne(Invoice, { where: { id } });
            if (!existingInvoice) throw new Error("Faktura nie istnieje.");

            // 1. Walidacja matematyczna
            const totals = this.validateAndCalculateTotals(items);

            // 2. Usunięcie starych pozycji (ruchów magazynowych zajmie się processInventoryTransactions)
            await manager.delete(InvoiceItem, { invoiceId: id });

            // 3. Sprawdzenie typu faktury i logiki magazynowej (nowe ruchy i dokumenty)
            await this.processInventoryTransactions(invoiceData, items, manager);

            // 4. Aktualizacja nagłówka
            const updatedInvoice = manager.merge(Invoice, existingInvoice, {
                invoiceNumber: invoiceData.invoiceNumber ?? existingInvoice.invoiceNumber,
                type: invoiceData.type ?? existingInvoice.type,
                issueDate: invoiceData.issueDate ?? existingInvoice.issueDate,
                dueDate: invoiceData.dueDate ?? existingInvoice.dueDate,
                nip: invoiceData.nip ?? existingInvoice.nip,
                currency: invoiceData.currency ?? existingInvoice.currency,
                isPaid: invoiceData.isPaid ?? existingInvoice.isPaid,
                clientId: invoiceData.clientId ?? existingInvoice.clientId,
                totalNetCents: totals.totalNet,
                totalVatCents: totals.totalVat,
                totalGrossCents: totals.totalGross
            });

            const savedInvoice = await manager.save(updatedInvoice);

            // 5. Zapis nowych pozycji
            await this.saveInvoiceItems(savedInvoice.id, items, manager);

            console.log(`[InvoiceService] Pomyślnie zaktualizowano fakturę ${savedInvoice.invoiceNumber}.`);
            return savedInvoice;
        });
    }

    private validateAndCalculateTotals(items: Partial<InvoiceItem>[]) {
        let totalNet = 0;
        let totalVat = 0;
        let totalGross = 0;

        for (const item of items) {
            if (!item.priceNetCents || !item.vatValueCents || !item.priceGrossCents) {
                throw new Error("Brakujące dane finansowe w pozycji faktury.");
            }

            if (!KSeFCalculator.validate(item.priceNetCents, item.vatValueCents, item.priceGrossCents)) {
                throw new Error(`Błąd matematyczny w pozycji dla produktu ID: ${item.productId}`);
            }

            totalNet += item.priceNetCents;
            totalVat += item.vatValueCents;
            totalGross += item.priceGrossCents;
        }
        return { totalNet, totalVat, totalGross };
    }

    private async processInventoryTransactions(invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[], manager: EntityManager) {
        const isSale = invoiceData.type === InvoiceType.SALE;
        const currentInvoiceNumber = invoiceData.invoiceNumber;
        if (!currentInvoiceNumber) throw new Error("Numer faktury jest wymagany do procesowania magazynu.");

        console.log(`[InvoiceService] Processing ${items.length} items for inventory transactions. isSale: ${isSale}`);

        // --- TICKET 10.2: Identyfikacja i czyszczenie istniejącego dokumentu ---
        let invDoc = await manager.findOne(InventoryDocument, {
            where: { referenceId: currentInvoiceNumber }
        });

        const inventoryService = new InventoryService(manager);

        if (invDoc) {
            console.log(`[InvoiceService] Znaleziono istniejący dokument: ${invDoc.documentNumber}. Cofanie FIFO i czyszczenie...`);

            // TICKET 10.2: Musimy cofnąć konsumpcję FIFO przed usunięciem pozycji
            const oldItems = await manager.find(InventoryDocumentItem, { where: { documentId: invDoc.id } });
            for (const oldItem of oldItems) {
                await inventoryService.revertConsumption(oldItem.id, manager);
            }

            // Usuwamy stare pozycje dokumentu
            await manager.delete(InventoryDocumentItem, { documentId: invDoc.id });
            // Usuwamy stare transakcje
            await manager.delete(InventoryTransaction, { invoiceId: currentInvoiceNumber });

            invDoc.date = new Date();
            invDoc.contractor = invoiceData.client?.name || invoiceData.nip || undefined;
            invDoc = await manager.save(invDoc);
        }

        // TICKET 10.2: Aby FIFO działało, potrzebujemy najpierw nagłówka dokumentu, by stworzyć pozycje z ID
        if (!invDoc && items.some(i => i.type === 'TOWAR')) {
            const docType = isSale ? DocumentType.WZ : DocumentType.PZ;
            const docNumber = await this.generateInventoryDocNumber(docType, manager);

            invDoc = new InventoryDocument();
            invDoc.documentNumber = docNumber;
            invDoc.type = docType;
            invDoc.date = new Date();
            invDoc.referenceId = currentInvoiceNumber;
            invDoc.contractor = invoiceData.client?.name || invoiceData.nip || undefined;

            invDoc = await manager.save(invDoc);
            console.log(`[Magazyn] Wygenerowano NOWY dokument: ${docNumber}`);
        }

        const transactions: InventoryTransaction[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            // Szukanie/Tworzenie produktu (Virtual Product logic)
            if (!item.productId && item.type === 'TOWAR') {
                const { Raw } = require("typeorm");
                const normalizedName = item.productName!.trim();
                const normalizedUnit = (item.unit || 'szt.').trim();

                let product = await manager.findOne(Product, {
                    where: {
                        name: Raw((alias: string) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:name))`, { name: normalizedName }),
                        unit: Raw((alias: string) => `LOWER(TRIM(${alias})) = LOWER(TRIM(:unit))`, { unit: normalizedUnit })
                    }
                });

                if (!product) {
                    product = manager.create(Product, {
                        name: normalizedName,
                        type: ProductType.TOWAR,
                        unit: normalizedUnit,
                        vatRate: item.vatRate || '23%',
                        isActive: true
                    });
                    product = await manager.save(product);
                }
                item.productId = product.id;
            }

            if (!item.productId) continue;

            const product = await manager.findOne(Product, { where: { id: item.productId } });
            if (!product) throw new Error(`Produkt o ID ${item.productId} nie istnieje.`);

            if (product.type === ProductType.TOWAR) {
                // TICKET 10.2: Tworzymy pozycję dokumentu magazynowego OD RAZU, aby mieć jej ID dla FIFO
                const docItem = new InventoryDocumentItem();
                docItem.documentId = invDoc!.id;
                docItem.productId = item.productId;
                docItem.quantity = item.quantity!;
                docItem.price = item.priceNetCents ? item.priceNetCents / 100 : 0;
                const savedDocItem = await manager.save(docItem);

                const transaction = new InventoryTransaction();
                transaction.productId = item.productId;
                transaction.quantity = item.quantity!;
                transaction.invoiceId = currentInvoiceNumber;

                if (isSale) {
                    // TICKET 10.2: Walidacja stanu (możemy użyć calculateStock lub polegać na FIFO exception)
                    // Ale FIFO calculateFIFOCostAndConsume rzuci InsufficientStockException jeśli braknie.

                    console.log(`[FIFO] Rozpoczynam konsumpcję dla: ${product.name}`);
                    const fifoResult = await inventoryService.calculateFIFOCostAndConsume(
                        item.productId,
                        item.quantity!,
                        savedDocItem.id,
                        manager
                    );

                    transaction.type = InventoryTransactionType.WZ;
                    transaction.costPrice = fifoResult.averagePrice; // Zapisujemy średni koszt zakupu
                    console.log(`[FIFO] Konsumpcja zakończona. Średnia cena zakupu: ${fifoResult.averagePrice}`);
                } else {
                    transaction.type = InventoryTransactionType.PZ;

                    // Rejestracja Partii (PZ)
                    console.log(`[FIFO] Tworzenie partii dla produktu: ${product.name}`);
                    const batch = new InventoryBatch();
                    batch.productId = item.productId;
                    batch.batchNumber = currentInvoiceNumber;
                    batch.purchasePrice = item.priceNetCents ? item.priceNetCents / 100 : 0;
                    batch.originalQuantity = item.quantity!;
                    batch.remainingQuantity = item.quantity!;
                    await manager.save(InventoryBatch, batch);
                }

                transactions.push(transaction);
            }
        }

        if (transactions.length > 0) {
            await manager.save(InventoryTransaction, transactions);
            console.log(`[InvoiceService] Zapisano ${transactions.length} transakcji magazynowych.`);
        } else {
            if (invDoc) {
                console.log(`[InvoiceService] Brak pozycji TOWAR. Usuwanie dokumentu.`);
                await manager.delete(InventoryDocument, { id: invDoc.id });
            }
        }
    }

    /**
     * Pomocnicza metoda do generowania numeru dokumentu magazynowego bezpośrednio w transakcji.
     * Unika circular dependency z InventoryService.
     */
    private async generateInventoryDocNumber(type: DocumentType, manager: EntityManager): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `${type}/${year}/${month}/`;

        const latestDoc = await manager.createQueryBuilder(InventoryDocument, "doc")
            .where("doc.documentNumber LIKE :prefix", { prefix: `${prefix}%` })
            .orderBy("doc.documentNumber", "DESC")
            .getOne();

        let sequence = 1;
        if (latestDoc) {
            const parts = latestDoc.documentNumber.split('/');
            const lastNum = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastNum)) {
                sequence = lastNum + 1;
            }
        }

        return `${prefix}${String(sequence).padStart(3, '0')}`;
    }

    private async saveInvoiceItems(invoiceId: string, items: Partial<InvoiceItem>[], manager: EntityManager) {
        for (const item of items) {
            const invoiceItem = manager.create(InvoiceItem, {
                ...item,
                invoiceId: invoiceId
            });
            await manager.save(invoiceItem);
        }
    }

    /**
     * Oblicza aktualny stan magazynowy na podstawie ruchów (PZ - WZ).
     */
    async calculateStock(productId: string, manager: EntityManager = AppDataSource.manager): Promise<number> {
        const transactions = await manager.find(InventoryTransaction, { where: { productId } });
        return transactions.reduce((acc, t) => {
            if (t.type === InventoryTransactionType.PZ) return acc + Number(t.quantity);
            if (t.type === InventoryTransactionType.WZ) return acc - Number(t.quantity);
            return acc;
        }, 0);
    }
}
