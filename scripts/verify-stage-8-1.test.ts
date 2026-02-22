import { describe, it, expect, beforeAll } from 'vitest';
import { AppDataSource } from '../src/core/db/data-source';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { ProjectService } from '../src/modules/projects/project.service';
import { FinanceService } from '../src/modules/finance/finance.service';
import { DocumentType } from '../src/modules/inventory/domain/inventory-document.entity';

describe('Stage 8.1: Inventory Circulation End-to-End', () => {
    let inventoryService: InventoryService;
    let projectService: ProjectService;
    let financeService: FinanceService;

    beforeAll(async () => {
        await AppDataSource.initialize();
        inventoryService = new InventoryService(AppDataSource);
        projectService = new ProjectService(AppDataSource);
        financeService = new FinanceService(AppDataSource);
    });

    it('should generate PZ document on purchase invoice and RW on material consumption', async () => {
        // 1. Create Purchase Invoice (Should generate PZ)
        const invoice = await financeService.createPurchaseInvoice({
            invoiceNumber: "FV/TEST/8.1",
            vendorName: "Test Supplier",
            supplierNip: "1234567890",
            supplierAddress: "Test Address",
            invoiceDate: new Date().toISOString(),
            isMpp: false,
            items: [
                { productId: "PROD-1", quantity: 10, netPrice: 50, vatRate: "23%", vatAmount: 11.5, grossPrice: 61.5, batchNumber: "B-001" }
            ]
        });
        expect(invoice.id).toBeDefined();

        // 2. Create Project and Consume Material (Should generate RW)
        const project = await projectService.createProject({
            name: "Test Project 8.1",
            clientName: "Test Client",
            assignedEmployeeId: "EMP-1",
            materialsToConsume: [
                { productId: "PROD-1", quantity: 2 }
            ]
        });
        expect(project.id).toBeDefined();
        expect(project.totalMaterialCost).toBe(100);

        // 3. Verify Documents
        const docs = await inventoryService.getDocuments();

        const pzFound = docs.find(doc => doc.type === DocumentType.PZ && doc.referenceId === "FV/TEST/8.1");
        const rwFound = docs.find(doc => doc.type === DocumentType.RW && doc.referenceId === String(project.id));

        expect(pzFound).toBeDefined();
        expect(pzFound?.items.length).toBe(1);
        expect(pzFound?.items[0].quantity).toBe(10);

        expect(rwFound).toBeDefined();
        expect(rwFound?.items.length).toBe(1);
        expect(rwFound?.items[0].quantity).toBe(2);

        console.log("Documents generated:", { PZ: pzFound?.documentNumber, RW: rwFound?.documentNumber });
    });
});
