
import "reflect-metadata"
import { AppDataSource } from "../src/core/db/data-source"
import { InventoryService } from "../src/modules/inventory/inventory.service"
import { FinanceService } from "../src/modules/finance/finance.service"
import { ProjectService } from "../src/modules/projects/project.service"
import { InventoryBatch } from "../src/modules/inventory/domain/inventory-batch.entity"

async function runSmokeTest() {
    console.log("🚀 Starting Smoke Test...")

    try {
        await AppDataSource.initialize()
        console.log("✅ Database initialized successfully.")

        const inventoryService = new InventoryService(AppDataSource)
        const financeService = new FinanceService(AppDataSource, inventoryService)
        const projectService = new ProjectService(AppDataSource, inventoryService)

        // --- TEST 1: Finance (Create Invoice -> Add Stock) ---
        console.log("\n🧪 Test 1: Finance - Creating Purchase Invoice...")
        const invoiceDto = {
            invoiceNumber: `TEST-FV-${Date.now()}`,
            vendorName: "Smoke Test Vendor",
            invoiceDate: "2026-05-20",
            items: [
                { productId: "TEST-PROD-001", batchNumber: `BATCH-${Date.now()}`, quantity: 100, price: 10.50 }
            ]
        }

        await financeService.createPurchaseInvoice(invoiceDto)
        console.log("✅ Invoice created.")

        // Verify Stock
        const batches = await AppDataSource.getRepository(InventoryBatch).find({ where: { productId: "TEST-PROD-001" } })
        const totalQty = batches.reduce((sum, b) => sum + b.remainingQuantity, 0)

        if (totalQty === 100) {
            console.log("✅ Stock verification PASSED: Quantity is 100.")
        } else {
            throw new Error(`❌ Stock verification FAILED: Expected 100, got ${totalQty}`)
        }

        // --- TEST 2: Projects (Create Project -> Consume Stock) ---
        console.log("\n🧪 Test 2: Projects - Creating Project & Consuming Materials...")
        const projectDto = {
            name: "Smoke Test Project",
            clientName: "Test Client",
            assignedEmployeeId: "EMP-TEST",
            materialsToConsume: [
                { productId: "TEST-PROD-001", quantity: 30 }
            ]
        }

        await projectService.createProject(projectDto)
        console.log("✅ Project created.")

        // Verify Stock consumption
        const batchesAfter = await AppDataSource.getRepository(InventoryBatch).find({ where: { productId: "TEST-PROD-001" } })
        const totalQtyAfter = batchesAfter.reduce((sum, b) => sum + b.remainingQuantity, 0)

        if (totalQtyAfter === 70) {
            console.log("✅ Stock consumption verified PASSED: Quantity reduced to 70.")
        } else {
            throw new Error(`❌ Stock consumption FAILED: Expected 70, got ${totalQtyAfter}`)
        }

        console.log("\n🎉 ALL SMOKE TESTS PASSED!")
        process.exit(0)

    } catch (error) {
        console.error("\n❌ SMOKE TEST FAILED:", error)
        process.exit(1)
    }
}

runSmokeTest()
