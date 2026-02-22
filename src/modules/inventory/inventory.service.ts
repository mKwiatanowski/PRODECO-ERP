import { Repository, DataSource, EntityManager } from "typeorm"
import { InventoryBatch } from "./domain/inventory-batch.entity"
import { InventoryDocument, DocumentType } from "./domain/inventory-document.entity"
import { InventoryDocumentItem } from "./domain/inventory-document-item.entity"
import { AppDataSource } from "../../core/db/data-source"
import { InsufficientStockException } from "./exceptions/insufficient-stock.exception"

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

    async addStock(productId: string, batchNumber: string, quantity: number, price: number, categoryId?: string): Promise<InventoryBatch> {
        if (price <= 0) {
            throw new Error("Price must be positive")
        }
        if (quantity <= 0) {
            throw new Error("Quantity must be positive")
        }

        const batch = new InventoryBatch()
        batch.productId = productId
        batch.batchNumber = batchNumber
        batch.originalQuantity = quantity
        batch.remainingQuantity = quantity
        batch.purchasePrice = price
        batch.categoryId = categoryId

        return await this.batchRepository.save(batch)
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
        // Re-fetch to ensure latest state inside transaction (if wrapped)
        const batches = await this.batchRepository.find({
            where: { productId },
            order: { createdAt: "ASC" }
        })

        const activeBatches = batches.filter(b => b.remainingQuantity > 0)

        const totalAvailable = activeBatches.reduce((sum, b) => sum + b.remainingQuantity, 0)
        if (totalAvailable < quantityRequired) {
            throw new InsufficientStockException(productId, quantityRequired, totalAvailable)
        }

        let remainingNeeded = quantityRequired

        for (const batch of activeBatches) {
            if (remainingNeeded <= 0) break

            const takeFromBatch = Math.min(remainingNeeded, batch.remainingQuantity)

            batch.remainingQuantity -= takeFromBatch
            remainingNeeded -= takeFromBatch

            await this.batchRepository.save(batch)
        }
    }
    async getTotalInventoryValue(): Promise<number> {
        const batches = await this.batchRepository.find()

        const totalValue = batches.reduce((sum, batch) => {
            return sum + (batch.remainingQuantity * batch.purchasePrice)
        }, 0)

        // Return rounded to 2 decimal places
        return Math.round(totalValue * 100) / 100
    }
}
