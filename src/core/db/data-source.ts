import "reflect-metadata"
import { DataSource } from "typeorm"
import { app } from "electron"
import path from "path"
import { PurchaseInvoice } from "../../modules/finance/domain/purchase-invoice.entity"
import { PurchaseInvoiceItem } from "../../modules/finance/domain/purchase-invoice-item.entity"
import { Project } from "../../modules/projects/domain/project.entity"
import { InventoryBatch } from "../../modules/inventory/domain/inventory-batch.entity"
import { InventoryBatchUsage } from "../../modules/inventory/domain/inventory-batch-usage.entity"
import { InventoryDocument } from "../../modules/inventory/domain/inventory-document.entity"
import { InventoryDocumentItem } from "../../modules/inventory/domain/inventory-document-item.entity"
import { Client } from "../../database/entities/client.entity"
import { Dictionary } from "../../modules/system/domain/dictionary.entity"
import { Invoice } from "../../database/entities/invoice.entity"
import { Expense } from "../../database/entities/expense.entity"
import { Product } from "../../database/entities/product.entity"
import { InvoiceItem } from "../../database/entities/invoice-item.entity"
import { InventoryTransaction } from "../../database/entities/inventory-transaction.entity"

// Database path handling for Electron
let dbPath = ':memory:'

try {
    if (process.env.NODE_ENV !== 'test') {
        // Use a more reliable way to get the path if app is not yet fully ready but we are in Electron
        const userDataPath = app ? app.getPath('userData') : null;
        if (userDataPath) {
            dbPath = path.join(userDataPath, 'green_manager.sqlite');
        } else if (!app) {
            // Fallback for TypeORM CLI or Scripts
            dbPath = path.join(__dirname, '../../../../green_manager_dev.sqlite');
        }
    }
} catch (e) {
    console.warn('[DB] Could not resolve userData path yet, using :memory: or default.');
}

export const AppDataSource = new DataSource({
    type: "better-sqlite3",
    database: dbPath,
    synchronize: true, // Auto-create tables for dev only
    logging: true,
    entities: [
        PurchaseInvoice,
        PurchaseInvoiceItem,
        Project,
        InventoryBatch,
        InventoryBatchUsage,
        InventoryDocument,
        InventoryDocumentItem,
        Client,
        Dictionary,
        Invoice,
        Expense,
        Product,
        InvoiceItem,
        InventoryTransaction
    ],
    migrations: [],
    subscribers: [],
})
