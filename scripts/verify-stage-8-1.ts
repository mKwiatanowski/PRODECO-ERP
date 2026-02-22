import { AppDataSource } from '../src/core/db/data-source';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { ProjectService } from '../src/modules/projects/project.service';
import { FinanceService } from '../src/modules/finance/finance.service';
import { DocumentType } from '../src/modules/inventory/domain/inventory-document.entity';

async function runTest() {
    await AppDataSource.initialize();
    console.log("Database connected.");

    const inventoryService = new InventoryService(AppDataSource);
    const projectService = new ProjectService(AppDataSource);
    const financeService = new FinanceService(AppDataSource);

    // 1. Create Purchase Invoice (Should generate PZ)
    console.log("1. Creating Purchase Invoice...");
    const invoice = await financeService.createPurchaseInvoice({
        invoiceNumber: "FV/TEST/8.1",
        vendorName: "Test Supplier",
        invoiceDate: new Date().toISOString(),
        items: [
            { productId: "PROD-1", quantity: 10, price: 50, batchNumber: "B-001" }
        ]
    });
    console.log("Invoice created with ID:", invoice.id);

    // 2. Create Project and Consume Material (Should generate RW)
    console.log("2. Creating Project and consuming material...");
    const project = await projectService.createProject({
        name: "Test Project 8.1",
        clientName: "Test Client",
        assignedEmployeeId: "EMP-1",
        materialsToConsume: [
            { productId: "PROD-1", quantity: 2 }
        ]
    });
    console.log("Project created with ID:", project.id, "Total Material Cost:", project.totalMaterialCost);

    // 3. Verify Documents
    console.log("3. Verifying Inventory Documents...");
    const docs = await inventoryService.getDocuments();

    let pzFound = false;
    let rwFound = false;

    for (const doc of docs) {
        console.log(`- Document: ${doc.documentNumber} | Type: ${doc.type} | Ref: ${doc.referenceId} | Items: ${doc.items.length}`);
        if (doc.type === DocumentType.PZ && doc.referenceId === "FV/TEST/8.1") {
            pzFound = true;
        }
        if (doc.type === DocumentType.RW && doc.referenceId === String(project.id)) {
            rwFound = true;
        }
    }

    if (pzFound && rwFound) {
        console.log("SUCCESS: Both PZ and RW documents were correctly generated in the background.");
        process.exit(0);
    } else {
        console.error("FAILED: Missing expected documents.", { pzFound, rwFound });
        process.exit(1);
    }
}

runTest().catch(console.error);
