const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite');

if (!fs.existsSync(dbPath)) {
    console.error("Database not found at:", dbPath);
    process.exit(1);
}

const db = new Database(dbPath);

console.log("\n--- PRODUCTS ---");
const products = db.prepare('SELECT id, name, type FROM products').all();
products.forEach(p => {
    console.log(`[${p.id}] ${p.name} | Type: ${p.type}`);
});

console.log("\n--- INVOICES ---");
const invoices = db.prepare('SELECT id, invoiceNumber, type, totalGrossCents FROM invoices').all();
invoices.forEach(inv => {
    console.log(`[${inv.id}] ${inv.invoiceNumber} | Type: ${inv.type} | Gross: ${inv.totalGrossCents}`);
    const items = db.prepare('SELECT productName, productId, quantity FROM invoice_items WHERE invoiceId = ?').all(inv.id);
    items.forEach(item => {
        console.log(`  - Item: ${item.productName} | ProductID: ${item.productId} | Qty: ${item.quantity}`);
    });
});

console.log("\n--- INVENTORY TRANSACTIONS ---");
const transactions = db.prepare('SELECT id, productId, type, quantity, invoiceId FROM inventory_transactions').all();
if (transactions.length === 0) {
    console.log("No transactions found.");
} else {
    transactions.forEach(t => {
        console.log(`[${t.id}] ProductID: ${t.productId} | Type: ${t.type} | Qty: ${t.quantity} | InvoiceID: ${t.invoiceId}`);
    });
}

db.close();
