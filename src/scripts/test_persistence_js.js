const { app } = require('electron');
const path = require('path');
require('reflect-metadata');
const { AppDataSource } = require('../core/db/data-source');
const { InvoiceService } = require('../../services/invoice.service');
const { InvoiceType } = require('../../database/entities/invoice.entity');

// Note: This script assumes it is in src/scripts/ and can access other files via relative paths.
// But Electron runtime might have issues with TS files.
// To make it 100% reliable, I will use a minimal JS script that uses better-sqlite3 directly 
// to SIMULATE the persistence if I cannot run the TS services.
// HOWEVER, I want to test the REAL SERVICES.

app.whenReady().then(async () => {
    try {
        // Since we are running in Electron, the AppDataSource should now point to the REAL path
        await AppDataSource.initialize();
        console.log("Database initialized at:", AppDataSource.options.database);

        const invoiceService = new InvoiceService();

        const invoicePayload = {
            invoiceNumber: "AUDIT/PERSIST/001",
            type: 'PURCHASE', // Using string to avoid enum import issues
            vendorName: "Dostawca Audyt",
            issueDate: new Date(),
            totalNetCents: 50000,
            totalVatCents: 11500,
            totalGrossCents: 61500,
            isPaid: false
        };

        const itemsPayload = [{
            productName: "Kosiarka Spalinowa TEST",
            type: "TOWAR",
            quantity: 1,
            unit: "szt.",
            priceNetCents: 50000,
            vatRate: "23%",
            vatValueCents: 11500,
            priceGrossCents: 61500
        }];

        console.log("Creating invoice with manual product...");
        // Use the real service
        const result = await invoiceService.createInvoice(invoicePayload, itemsPayload);
        console.log("Invoice created with ID:", result.id);

        // Verification via DB direct query to be absolutely sure
        const Database = require('better-sqlite3');
        const db = new Database(AppDataSource.options.database);

        const product = db.prepare('SELECT * FROM products WHERE name = ?').get('Kosiarka Spalinowa TEST');
        console.log("Product persistence check:", product ? "OK" : "FAILED");
        if (product) console.log("Product ID:", product.id);

        const doc = db.prepare('SELECT * FROM inventory_documents WHERE referenceId = ?').get("AUDIT/PERSIST/001");
        console.log("PZ Document persistence check:", doc ? "OK" : "FAILED");

        db.close();

    } catch (e) {
        console.error("Test Error:", e.message);
        console.error(e.stack);
    } finally {
        app.quit();
    }
});
