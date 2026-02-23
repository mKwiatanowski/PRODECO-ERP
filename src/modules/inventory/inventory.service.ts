import { Repository, DataSource, EntityManager } from "typeorm"
import { InventoryBatch } from "./domain/inventory-batch.entity"
import { InventoryDocument, DocumentType } from "./domain/inventory-document.entity"
import { InventoryDocumentItem } from "./domain/inventory-document-item.entity"
import { InventoryBatchUsage } from "./domain/inventory-batch-usage.entity"
import { AppDataSource } from "../../core/db/data-source"
import { InsufficientStockException } from "./exceptions/insufficient-stock.exception"
import { Product, ProductType } from "../../database/entities/product.entity"
import { InventoryTransaction, InventoryTransactionType } from "../../database/entities/inventory-transaction.entity"

export class InventoryService {
    private batchRepository: Repository<InventoryBatch>
    private docRepository: Repository<InventoryDocument>

    constructor(dataSourceOrManager: DataSource | EntityManager = AppDataSource) {
        this.batchRepository = dataSourceOrManager.getRepository(InventoryBatch)
        this.docRepository = dataSourceOrManager.getRepository(InventoryDocument)
    }

    async generateDocumentNumber(type: DocumentType): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Find latest document of this type for this month
        const prefix = `${type}/${year}/${month}/`;

        const latestDoc = await this.docRepository.createQueryBuilder("doc")
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

    async createDocument(type: DocumentType, referenceId: string, items: { productId: string, quantity: number, price?: number }[]): Promise<InventoryDocument> {
        const doc = new InventoryDocument();
        doc.documentNumber = await this.generateDocumentNumber(type);
        doc.type = type;
        doc.date = new Date();
        doc.referenceId = referenceId;

        doc.items = items.map(item => {
            const docItem = new InventoryDocumentItem();
            docItem.productId = item.productId;
            docItem.quantity = item.quantity;
            docItem.price = item.price;
            return docItem;
        });

        return await this.docRepository.save(doc);
    }

    async getDocuments(): Promise<InventoryDocument[]> {
        return await this.docRepository.find({
            relations: ["items"],
            order: { createdAt: "DESC" }
        });
    }

    async addStock(productIdOrName: string, batchNumber: string, quantity: number, price: number, unit: string = "szt", categoryId?: string): Promise<InventoryBatch> {
        if (price < 0) { // Zmienione z <= na < , pozwalamy na darmowe próbki/zwroty jeśli trzeba, ale zwykle price >= 0
            throw new Error("Price must be non-negative")
        }
        if (quantity <= 0) {
            throw new Error("Quantity must be positive")
        }

        return await AppDataSource.transaction(async (manager) => {
            const productRepo = manager.getRepository(Product);
            const batchRepo = manager.getRepository(InventoryBatch);
            const docRepo = manager.getRepository(InventoryDocument);
            const docItemRepo = manager.getRepository(InventoryDocumentItem);
            const transRepo = manager.getRepository(InventoryTransaction);

            // 1. Find or Create Product
            let product = await productRepo.findOne({
                where: [
                    { id: productIdOrName },
                    { name: productIdOrName }
                ]
            });

            if (!product) {
                // If not found, create a placeholder product (common for manual receipt)
                product = new Product();
                product.name = productIdOrName;
                product.type = ProductType.TOWAR;
                product.unit = unit;
                product.vatRate = "23%";
                product.isActive = true;
                await productRepo.save(product);
            } else if (product.unit !== unit) {
                // Opcjonalnie: Aktualizuj jednostkę istniejącego produktu jeśli się różni
                product.unit = unit;
                await productRepo.save(product);
            }

            // 2. Create PZ Document
            const doc = new InventoryDocument();
            doc.documentNumber = await this.generateDocumentNumber(DocumentType.PZ);
            doc.type = DocumentType.PZ;
            doc.date = new Date();
            doc.referenceId = `MANUAL-${Date.now()}`;
            doc.contractor = "PRZYJĘCIE RĘCZNE";
            await docRepo.save(doc);

            // 3. Create Document Item
            const docItem = new InventoryDocumentItem();
            docItem.documentId = doc.id;
            docItem.productId = product.id;
            docItem.quantity = quantity;
            docItem.price = price;
            docItem.unit = unit;
            await docItemRepo.save(docItem);

            // 4. Create Batch
            const batch = new InventoryBatch();
            batch.productId = product.id;
            batch.batchNumber = batchNumber;
            batch.originalQuantity = quantity;
            batch.remainingQuantity = quantity;
            batch.purchasePrice = price;
            batch.categoryId = categoryId;
            const savedBatch = await batchRepo.save(batch);

            // 5. Create Transaction
            const transaction = new InventoryTransaction();
            transaction.type = InventoryTransactionType.PZ;
            transaction.productId = product.id;
            transaction.quantity = quantity;
            transaction.invoiceId = doc.referenceId; // Use refId for grouping
            await transRepo.save(transaction);

            return savedBatch;
        });
    }

    async calculateFIFOCost(productId: string, quantityRequired: number): Promise<number> {
        // Validation
        if (quantityRequired <= 0) throw new Error("Quantity must be positive")

        // Fetch batches with remaining quantity > 0, ordered by creation date (FIFO)
        const batches = await this.batchRepository.find({
            where: { productId },
            order: { createdAt: "ASC" }
        })

        const activeBatches = batches.filter(b => b.remainingQuantity > 0)

        // Check availability
        const totalAvailable = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)
        if (totalAvailable < quantityRequired) {
            throw new InsufficientStockException(productId, quantityRequired, totalAvailable)
        }

        let totalCost = 0
        let remainingNeeded = quantityRequired

        for (const batch of activeBatches) {
            if (remainingNeeded <= 0) break

            const takeFromBatch = Math.min(remainingNeeded, batch.remainingQuantity)
            totalCost += takeFromBatch * batch.purchasePrice
            remainingNeeded -= takeFromBatch
        }

        // Round to 2 decimal places
        return Math.round(totalCost * 100) / 100
    }

    // This method would be called within a transaction
    async consumeStock(productId: string, quantityRequired: number): Promise<void> {
        // ... (existing simple consumeStock if needed, but we prefer the new one below)
        const manager = AppDataSource.manager;
        await this.calculateFIFOCostAndConsume(productId, quantityRequired, 'internal', manager);
    }

    /**
     * TICKET 10.2: Implementacja algorytmu FIFO (Rozchód i Wycena)
     * Pobiera towar z najstarszych partii, tworzy rekordy użycia i zwraca całkowity koszt.
     */
    async calculateFIFOCostAndConsume(
        productId: string,
        quantityRequired: number,
        documentItemId: string,
        manager: EntityManager
    ): Promise<{ totalCost: number, averagePrice: number }> {
        if (quantityRequired <= 0) throw new Error("Quantity must be positive");

        const batchRepo = manager.getRepository(InventoryBatch);
        const usageRepo = manager.getRepository(InventoryBatchUsage);

        // Znajdź najstarsze partie (FIFO - ASC po createdAt)
        const batches = await batchRepo.find({
            where: { productId },
            order: { createdAt: "ASC" }
        });

        const activeBatches = batches.filter(b => b.remainingQuantity > 0);
        const totalAvailable = activeBatches.reduce((sum, b) => sum + Number(b.remainingQuantity), 0);

        if (totalAvailable < quantityRequired) {
            throw new InsufficientStockException(productId, quantityRequired, totalAvailable);
        }

        let totalCost = 0;
        let remainingNeeded = quantityRequired;

        for (const batch of activeBatches) {
            if (remainingNeeded <= 0) break;

            const takeFromBatch = Math.min(remainingNeeded, batch.remainingQuantity);
            const batchCost = takeFromBatch * Number(batch.purchasePrice);

            // Zmniejsz ilość w partii
            batch.remainingQuantity -= takeFromBatch;
            await batchRepo.save(batch);

            // Stwórz rekord użycia
            const usage = new InventoryBatchUsage();
            usage.batchId = batch.id;
            usage.documentItemId = documentItemId;
            usage.quantity = takeFromBatch;
            await usageRepo.save(usage);

            totalCost += batchCost;
            remainingNeeded -= takeFromBatch;
        }

        const averagePrice = quantityRequired > 0 ? totalCost / quantityRequired : 0;

        return {
            totalCost: Math.round(totalCost * 100) / 100,
            averagePrice: Math.round(averagePrice * 100) / 100
        };
    }

    /**
     * TICKET 10.2: Logika Cofania (Revert)
     * Wraca towar do oryginalnych partii i usuwa rekordy użycia.
     */
    async revertConsumption(documentItemId: string, manager: EntityManager): Promise<void> {
        const batchRepo = manager.getRepository(InventoryBatch);
        const usageRepo = manager.getRepository(InventoryBatchUsage);

        // Znajdź wszystkie użycia dla danej pozycji dokumentu
        const usages = await usageRepo.find({ where: { documentItemId } });

        for (const usage of usages) {
            const batch = await batchRepo.findOne({ where: { id: usage.batchId } });
            if (batch) {
                // Oddaj ilość do partii
                batch.remainingQuantity += Number(usage.quantity);
                await batchRepo.save(batch);
            }
            // Usuń rekord użycia
            await usageRepo.remove(usage);
        }
    }
    async getProducts(): Promise<any[]> {
        const query = this.batchRepository.manager.createQueryBuilder(Product, "p")
            .leftJoin(InventoryBatch, "b", "b.productId = p.id")
            .select([
                "p.id AS id",
                "p.name AS name",
                "p.type AS type",
                "p.vatRate AS vatRate",
                "p.unit AS unit",
                "p.isActive AS isActive"
            ])
            .addSelect("SUM(CASE WHEN p.type = 'TOWAR' THEN b.remainingQuantity ELSE 0 END)", "totalQuantity")
            .where("p.isActive = :isActive", { isActive: true })
            .groupBy("p.id")
            .orderBy("p.name", "ASC");

        const results = await query.getRawMany();

        return results.map(r => ({
            ...r,
            totalQuantity: r.type === 'TOWAR' ? (Number(r.totalQuantity) || 0) : undefined
        }));
    }

    async getStockLevels(): Promise<any[]> {
        // Ticket 10.3: Agregacja stanów i wartości FIFO na podstawie partii
        const query = this.batchRepository.manager.createQueryBuilder(Product, "p")
            .leftJoin(InventoryBatch, "b", "b.productId = p.id")
            .select("p.id", "productId")
            .addSelect("p.name", "name")
            .addSelect("p.unit", "unit")
            .addSelect("p.vatRate", "vatRate")
            .addSelect("COALESCE(SUM(b.remainingQuantity), 0)", "totalQuantity")
            .addSelect("COALESCE(SUM(b.remainingQuantity * b.purchasePrice), 0)", "fifoValue")
            .groupBy("p.id")
            .addGroupBy("p.name")
            .addGroupBy("p.unit")
            .addGroupBy("p.vatRate");

        return await query.getRawMany();
    }

    async getProductHistory(productId: string): Promise<any[]> {
        // Ticket 10.3: Pobieranie historii wraz z kosztem FIFO dla WZ
        const items = await this.batchRepository.manager.getRepository(InventoryDocumentItem).find({
            where: { productId },
            relations: ["document"],
            order: {
                document: {
                    date: "DESC"
                }
            }
        });

        // Uzupełnij o costPrice z transakcji dla WZ
        const enrichedItems = await Promise.all(items.map(async (item) => {
            const enriched: any = { ...item };
            if (item.document && (item.document.type === 'WZ' as any)) {
                const transaction = await this.batchRepository.manager.getRepository(InventoryTransaction).findOne({
                    where: {
                        productId: item.productId,
                        invoiceId: item.document.referenceId
                    }
                });
                if (transaction) {
                    enriched.costPrice = transaction.costPrice;
                }
            }
            return enriched;
        }));

        return enrichedItems;
    }

    async getTotalInventoryValue(): Promise<number> {
        // Simplified for now, should ideally use transactions too or batches if we still use them
        const batches = await this.batchRepository.find()

        const totalValue = batches.reduce((sum, batch) => {
            return sum + (batch.remainingQuantity * batch.purchasePrice)
        }, 0)

        return Math.round(totalValue * 100) / 100
    }

    /**
     * TICKET 11: Podgląd zawartości dokumentu magazynowego
     */
    async getInventoryDocumentDetails(documentId: string): Promise<InventoryDocument | null> {
        return await this.docRepository.findOne({
            where: { id: documentId },
            relations: ["items", "items.product"]
        });
    }
}
