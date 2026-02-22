
import 'reflect-metadata';
import { describe, it, expect, beforeEach } from 'vitest';
import { DataSource } from 'typeorm';
import { FinanceService } from './finance.service';
import { InventoryService } from '../inventory/inventory.service';
import { PurchaseInvoice } from './domain/purchase-invoice.entity';
import { PurchaseInvoiceItem } from './domain/purchase-invoice-item.entity';
import { InventoryDocument } from '../inventory/domain/inventory-document.entity';
import { InventoryDocumentItem } from '../inventory/domain/inventory-document-item.entity';
import { InventoryBatch } from '../inventory/domain/inventory-batch.entity';

describe('Finance & Inventory Integration', () => {
    let dataSource: DataSource;
    let financeService: FinanceService;
    let inventoryService: InventoryService;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'better-sqlite3',
            database: ':memory:',
            dropSchema: true,
            entities: [PurchaseInvoice, PurchaseInvoiceItem, InventoryBatch, InventoryDocument, InventoryDocumentItem],
            synchronize: true,
            logging: true,
        });

        await dataSource.initialize();
        financeService = new FinanceService(dataSource);
        inventoryService = new InventoryService(dataSource);
    });

    it('should increase inventory value when a purchase invoice is created', async () => {
        // 1. Initial State: Value is 0
        const initialValue = await inventoryService.getTotalInventoryValue();
        expect(initialValue).toBe(0);

        // 2. Create Purchase Invoice with 2 items
        // Item 1: 10 units * 50 PLN = 500 PLN
        // Item 2: 5 units * 20 PLN = 100 PLN
        // Total Invoice Value: 600 PLN
        const invoiceData = {
            invoiceNumber: 'FV/TEST/001',
            vendorName: 'Test Vendor',
            supplierNip: '1234567890',
            supplierAddress: 'Test Address 1',
            invoiceDate: '2026-02-19',
            isMpp: false,
            items: [
                { productId: 'PROD-A', batchNumber: 'BATCH-A1', quantity: 10, netPrice: 50, vatRate: '23%', vatAmount: 11.5, grossPrice: 61.5 },
                { productId: 'PROD-B', batchNumber: 'BATCH-B1', quantity: 5, netPrice: 20, vatRate: '23%', vatAmount: 4.6, grossPrice: 24.6 }
            ]
        };

        await financeService.createPurchaseInvoice(invoiceData);

        // 3. Verify Inventory Value
        // Should catch the 600 PLN worth of stock
        const newValue = await inventoryService.getTotalInventoryValue();
        expect(newValue).toBe(600.00);

        // 4. Verify Individual Batches are created
        const batches = await dataSource.getRepository(InventoryBatch).find();
        expect(batches).toHaveLength(2);

        const batchA = batches.find(b => b.productId === 'PROD-A');
        expect(batchA?.remainingQuantity).toBe(10);
        expect(batchA?.purchasePrice).toBe(50);
    });
});
