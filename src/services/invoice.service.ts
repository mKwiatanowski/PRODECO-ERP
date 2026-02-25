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
     * Weryfikuje czy Netto + VAT = Brutto.
     */
    static validate(net: number, vat: number, gross: number): boolean {
        return Math.abs((Number(net) + Number(vat)) - Number(gross)) < 0.01;
    }

    /**
     * Oblicza wartość VAT i Brutto na podstawie Netto i stawki procentowej.
     */
    static calculateFromNet(net: number, vatRateStr: string): { vat: number, gross: number } {
        const rate = parseInt(vatRateStr.replace("%", ""), 10) / 100;
        const vat = Math.round(net * rate * 100) / 100;
        return {
            vat,
            gross: Math.round((net + vat) * 100) / 100
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
                totalNet: totals.totalNet,
                totalVat: totals.totalVat,
                totalGross: totals.totalGross,
                totalNetCents: Math.round(totals.totalNet * 100),
                totalVatCents: Math.round(totals.totalVat * 100),
                totalGrossCents: Math.round(totals.totalGross * 100)
            });

            const savedInvoice = await manager.save(invoice);

            // 4. Zapis pozycji faktury
            await this.saveInvoiceItems(savedInvoice.id, items, manager);

            console.log(`[InvoiceService] Pomyślnie utworzono fakturę ${savedInvoice.number} wraz z pozycjami.`);
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
                number: invoiceData.number ?? existingInvoice.number,
                type: invoiceData.type ?? existingInvoice.type,
                issueDate: invoiceData.issueDate ?? existingInvoice.issueDate,
                saleDate: invoiceData.saleDate ?? existingInvoice.saleDate,
                dueDate: invoiceData.dueDate ?? existingInvoice.dueDate,
                paymentType: invoiceData.paymentType ?? existingInvoice.paymentType,
                paymentStatus: invoiceData.paymentStatus ?? existingInvoice.paymentStatus,
                nip: invoiceData.nip ?? existingInvoice.nip,
                currency: invoiceData.currency ?? existingInvoice.currency,
                clientId: invoiceData.clientId ?? existingInvoice.clientId,
                totalNet: totals.totalNet,
                totalVat: totals.totalVat,
                totalGross: totals.totalGross,
                totalNetCents: Math.round(totals.totalNet * 100),
                totalVatCents: Math.round(totals.totalVat * 100),
                totalGrossCents: Math.round(totals.totalGross * 100)
            });

            const savedInvoice = await manager.save(updatedInvoice);

            // 5. Zapis nowych pozycji
            await this.saveInvoiceItems(savedInvoice.id, items, manager);

            console.log(`[InvoiceService] Pomyślnie zaktualizowano fakturę ${savedInvoice.number}.`);
            return savedInvoice;
        });
    }

    private validateAndCalculateTotals(items: Partial<InvoiceItem>[]) {
        let totalNet = 0;
        let totalVat = 0;
        let totalGross = 0;

        for (const item of items) {
            console.log("[InvoiceService] Validating item:", JSON.stringify(item));
            if (item.netPrice === undefined || item.vatValue === undefined || item.grossValue === undefined) {
                throw new Error("Brakujące dane finansowe w pozycji faktury.");
            }

            if (!KSeFCalculator.validate(item.netValue as number, item.vatValue as number, item.grossValue as number)) {
                throw new Error(`Błąd matematyczny w pozycji: ${item.description}`);
            }

            totalNet += Number(item.netValue);
            totalVat += Number(item.vatValue);
            totalGross += Number(item.grossValue);
        }
        return {
            totalNet: Math.round(totalNet * 100) / 100,
            totalVat: Math.round(totalVat * 100) / 100,
            totalGross: Math.round(totalGross * 100) / 100
        };
    }

    private async processInventoryTransactions(invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[], manager: EntityManager) {
        const isSale = invoiceData.type === InvoiceType.SALE;
        const currentInvoiceNumber = invoiceData.number;
        if (!currentInvoiceNumber) throw new Error("Numer faktury jest wymagany do procesowania magazynu.");

        console.log(`[InvoiceService] Processing ${items.length} items for inventory transactions. isSale: ${isSale}`);

        // --- TICKET 10.2: Identyfikacja i czyszczenie istniejącego dokumentu ---
        let invDoc = await manager.findOne(InventoryDocument, {
            where: { referenceId: currentInvoiceNumber }
        });

        const inventoryService = new InventoryService(manager);

        if (invDoc) {
            console.log(`[InvoiceService] Znaleziono istniejący dokument: ${invDoc.documentNumber}. Cofanie FIFO i czyszczenie...`);

            const oldItems = await manager.find(InventoryDocumentItem, { where: { documentId: invDoc.id } });
            for (const oldItem of oldItems) {
                await inventoryService.revertConsumption(oldItem.id, manager);
            }

            await manager.delete(InventoryDocumentItem, { documentId: invDoc.id });
            await manager.delete(InventoryTransaction, { invoiceId: currentInvoiceNumber });

            invDoc.date = new Date();
            invDoc.contractor = invoiceData.client?.name || invoiceData.nip || undefined;
            invDoc = await manager.save(invDoc);
        }

        if (!invDoc && items.some(i => i.productId)) {
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

            if (!item.productId) continue;

            const product = await manager.findOne(Product, { where: { id: item.productId } });
            if (!product) throw new Error(`Produkt o ID ${item.productId} nie istnieje.`);

            if (product.type === ProductType.TOWAR) {
                const docItem = new InventoryDocumentItem();
                docItem.documentId = invDoc!.id;
                docItem.productId = item.productId;
                docItem.quantity = item.quantity!;
                docItem.price = Number(item.netPrice);
                const savedDocItem = await manager.save(docItem);

                const transaction = new InventoryTransaction();
                transaction.productId = item.productId;
                transaction.quantity = item.quantity!;
                transaction.invoiceId = currentInvoiceNumber;

                if (isSale) {
                    console.log(`[FIFO] Rozpoczynam konsumpcję dla: ${product.name}`);
                    const fifoResult = await inventoryService.calculateFIFOCostAndConsume(
                        item.productId,
                        item.quantity!,
                        savedDocItem.id,
                        manager
                    );

                    transaction.type = InventoryTransactionType.WZ;
                    transaction.costPrice = fifoResult.averagePrice;
                } else {
                    transaction.type = InventoryTransactionType.PZ;

                    console.log(`[FIFO] Tworzenie partii dla produktu: ${product.name}`);
                    const batch = new InventoryBatch();
                    batch.productId = item.productId;
                    batch.batchNumber = currentInvoiceNumber;
                    batch.purchasePrice = Number(item.netPrice);
                    batch.originalQuantity = item.quantity!;
                    batch.remainingQuantity = item.quantity!;
                    await manager.save(InventoryBatch, batch);
                }

                transactions.push(transaction);
            }
        }

        if (transactions.length > 0) {
            await manager.save(InventoryTransaction, transactions);
        } else if (invDoc) {
            await manager.delete(InventoryDocument, { id: invDoc.id });
        }
    }

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

    async calculateStock(productId: string, manager: EntityManager = AppDataSource.manager): Promise<number> {
        const transactions = await manager.find(InventoryTransaction, { where: { productId } });
        return transactions.reduce((acc, t) => {
            if (t.type === InventoryTransactionType.PZ) return acc + Number(t.quantity);
            if (t.type === InventoryTransactionType.WZ) return acc - Number(t.quantity);
            return acc;
        }, 0);
    }
}
