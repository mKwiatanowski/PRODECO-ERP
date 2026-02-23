import "reflect-metadata";
import { app } from "electron";
import { AppDataSource } from "../core/db/data-source";
import { InvoiceService } from "../services/invoice.service";
import { InvoiceType } from "../database/entities/invoice.entity";
import { Product } from "../database/entities/product.entity";
import { InventoryDocument } from "../modules/inventory/domain/inventory-document.entity";
import { InventoryTransaction } from "../database/entities/inventory-transaction.entity";

// Ensure we are in the right environment
console.log('--- BACKEND PERSISTENCE TEST ---');

app.whenReady().then(async () => {
    try {
        await AppDataSource.initialize();
        console.log("Database initialized at:", AppDataSource.options.database);

        const invoiceService = new InvoiceService();

        const invoicePayload = {
            invoiceNumber: "TEST/SMOKE/001",
            type: InvoiceType.PURCHASE,
            vendorName: "Dostawca Testowy",
            issueDate: new Date(),
            totalNetCents: 100000,
            totalVatCents: 23000,
            totalGrossCents: 123000,
            isPaid: false
        };

        const itemsPayload = [{
            productName: "Kosiarka Spalinowa TEST",
            type: "TOWAR",
            quantity: 1,
            unit: "szt.",
            priceNetCents: 100000,
            vatRate: "23%",
            vatValueCents: 23000,
            priceGrossCents: 123000
        } as any];

        console.log("Creating invoice with manual product...");
        const result = await invoiceService.createInvoice(invoicePayload as any, itemsPayload);
        console.log("Invoice created with ID:", result.id);

        // Verification
        const db = AppDataSource.manager;
        const product = await db.findOne(Product, { where: { name: "Kosiarka Spalinowa TEST" } });
        console.log("Product persistence check:", product ? "OK" : "FAILED");
        if (product) console.log("Product ID:", product.id);

        const doc = await db.findOne(InventoryDocument, { where: { referenceId: "TEST/SMOKE/001" } });
        console.log("PZ Document persistence check:", doc ? "OK" : "FAILED");

        const transaction = await db.findOne(InventoryTransaction, { where: { invoiceId: result.id } });
        console.log("Inventory Transaction check:", transaction ? "OK" : "FAILED");

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        app.quit();
    }
});
