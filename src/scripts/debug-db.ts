import { AppDataSource } from "../core/db/data-source";
import { Product } from "../database/entities/product.entity";
import { InventoryTransaction } from "../database/entities/inventory-transaction.entity";
import { Invoice } from "../database/entities/invoice.entity";

async function debugDb() {
    console.log("Initializing Data Source for debugging...");
    try {
        await AppDataSource.initialize();
        console.log("Data Source initialized.");

        // 1. Check Products
        const products = await AppDataSource.getRepository(Product).find();
        console.log("\n--- PRODUCTS ---");
        products.forEach(p => {
            console.log(`[${p.id}] ${p.name} | Type: ${p.type} | Active: ${p.isActive}`);
        });

        // 2. Check Invoices
        const invoices = await AppDataSource.getRepository(Invoice).find({
            relations: ["items"]
        });
        console.log("\n--- INVOICES ---");
        invoices.forEach(inv => {
            console.log(`[${inv.id}] ${inv.invoiceNumber} | Type: ${inv.type} | Total Gross: ${inv.totalGrossCents}`);
            inv.items?.forEach(item => {
                console.log(`  - Item: ${item.productName} | ProductID: ${item.productId} | Qty: ${item.quantity}`);
            });
        });

        // 3. Check Inventory Transactions
        const transactions = await AppDataSource.getRepository(InventoryTransaction).find();
        console.log("\n--- INVENTORY TRANSACTIONS ---");
        if (transactions.length === 0) {
            console.log("No transactions found.");
        } else {
            transactions.forEach(t => {
                console.log(`[${t.id}] ProductID: ${t.productId} | Type: ${t.type} | Qty: ${t.quantity} | InvoiceID: ${t.invoiceId}`);
            });
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error("Error during debug:", error);
        process.exit(1);
    }
}

debugDb();
