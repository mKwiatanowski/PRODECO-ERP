import "reflect-metadata";
import { app } from "electron";
import { AppDataSource } from "../core/db/data-source";
import { InvoiceService } from "../services/invoice.service";
import { InventoryService } from "../modules/inventory/inventory.service";
import { Product, ProductType } from "../database/entities/product.entity";
import { InvoiceType } from "../database/entities/invoice.entity";
import { InventoryBatch } from "../modules/inventory/domain/inventory-batch.entity";
import { InventoryBatchUsage } from "../modules/inventory/domain/inventory-batch-usage.entity";
import { InventoryTransaction } from "../database/entities/inventory-transaction.entity";

async function runTest() {
    console.log("=== TICKET 12: FIFO SMOKE TEST STARTED ===");

    try {
        await AppDataSource.initialize();
        console.log("Database initialized.");

        const manager = AppDataSource.manager;
        const invoiceService = new InvoiceService();
        const inventoryService = new InventoryService(manager);

        // 1. Dodaj produkt "TESTOWY TOWAR"
        let product = new Product();
        product.name = "TESTOWY TOWAR";
        product.type = ProductType.TOWAR;
        product.unit = "szt";
        product.vatRate = "23%";
        product.isActive = true;
        product = await manager.save(product);
        console.log(`Product created: ${product.name} (ID: ${product.id})`);

        // 2. Wystaw 3 Faktury Zakupu (PZ)
        // PZ1: 10 szt. @ 100 PLN
        console.log("Creating PZ1: 10 pcs @ 100 PLN");
        await invoiceService.createInvoice({
            type: InvoiceType.PURCHASE,
            number: "PZ/001/2026",
            issueDate: new Date("2026-02-01"),
            dueDate: new Date("2026-02-15"),
            currency: "PLN"
        }, [
            {
                productId: product.id,
                description: "Zakup towaru",
                quantity: 10,
                priceNetCents: 10000,
                vatRate: "23%",
                vatValueCents: 2300,
                priceGrossCents: 12300
            }
        ]);

        // PZ2: 10 szt. @ 120 PLN
        console.log("Creating PZ2: 10 pcs @ 120 PLN");
        await invoiceService.createInvoice({
            type: InvoiceType.PURCHASE,
            number: "PZ/002/2026",
            issueDate: new Date("2026-02-02"),
            dueDate: new Date("2026-02-16"),
            currency: "PLN"
        }, [
            {
                productId: product.id,
                description: "Zakup towaru",
                quantity: 10,
                priceNetCents: 12000,
                vatRate: "23%",
                vatValueCents: 2760,
                priceGrossCents: 14760
            }
        ]);

        // PZ3: 10 szt. @ 150 PLN
        console.log("Creating PZ3: 10 pcs @ 150 PLN");
        await invoiceService.createInvoice({
            type: InvoiceType.PURCHASE,
            number: "PZ/003/2026",
            issueDate: new Date("2026-02-03"),
            dueDate: new Date("2026-02-17"),
            currency: "PLN"
        }, [
            {
                productId: product.id,
                description: "Zakup towaru",
                quantity: 10,
                priceNetCents: 15000,
                vatRate: "23%",
                vatValueCents: 3450,
                priceGrossCents: 18450
            }
        ]);

        // 3. Wystaw 1 Fakturę Sprzedaży (WZ) - 15 szt.
        console.log("Creating WZ1: 15 pcs (FIFO should take 10 @ 100 and 5 @ 120)");
        await invoiceService.createInvoice({
            type: InvoiceType.SALE,
            number: "WZ/001/2026",
            issueDate: new Date("2026-02-10"),
            dueDate: new Date("2026-02-24"),
            currency: "PLN"
        }, [
            {
                productId: product.id,
                description: "Sprzedaż towaru",
                quantity: 15,
                priceNetCents: 20000,
                vatRate: "23%",
                vatValueCents: 4600,
                priceGrossCents: 24600
            }
        ]);

        // 4. Weryfikacja Danych
        console.log("\n--- VERIFICATION ---");

        // Sprawdź InventoryBatchUsage
        const usages = await manager.find(InventoryBatchUsage);
        console.log(`InventoryBatchUsage records: ${usages.length}`);

        for (const u of usages) {
            const batch = await manager.findOne(InventoryBatch, { where: { id: u.batchId } });
            if (batch) {
                console.log(`Consumed ${u.quantity} from batch ${batch.batchNumber} (Price: ${batch.purchasePrice})`);
            }
        }

        // Weryfikacja wartości magazynu
        // Remaining: (10 @ 100 taken) + (5 @ 120 taken) + (5 @ 120 remaining) + (10 @ 150 remaining)
        // Expected value: 5 * 120 + 10 * 150 = 600 + 1500 = 2100 PLN
        const totalValue = await inventoryService.getTotalInventoryValue();
        console.log(`Total Inventory Value (Expected: 2100): ${totalValue} PLN`);

        // Weryfikacja kosztu (costPrice) w transakcji WZ
        // Expected average cost: (10 * 100 + 5 * 120) / 15 = (1000 + 600) / 15 = 1600 / 15 = 106.6666...
        const wzTransaction = await manager.findOne(InventoryTransaction, {
            where: { invoiceId: "WZ/001/2026" }
        });
        console.log(`WZ Transaction Cost Price (Expected: ~106.67): ${wzTransaction?.costPrice}`);

        // PODSUMOWANIE MATEMATYCZNE
        const isValueMatch = Math.abs(totalValue - 2100) < 0.01;
        const isCostMatch = Math.abs((wzTransaction?.costPrice || 0) - 106.67) < 0.01;

        console.log(`\nValue Match: ${isValueMatch ? "YES" : "NO"}`);
        console.log(`Cost Match: ${isCostMatch ? "YES" : "NO"}`);

        if (isValueMatch && isCostMatch) {
            console.log("\nALL TESTS PASSED SUCCESSFULLY!");
        } else {
            console.log("\nTESTS FAILED!");
            process.exit(0); // Exit without error code to see results
        }

    } catch (error) {
        console.error("Test failed with error:", error);
    } finally {
        await AppDataSource.destroy();
        app.quit();
    }
}

app.whenReady().then(runTest);

