const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite');

console.log('=== RESET BAZY DANYCH (JS VERSION) ===');
console.log('Connecting to database:', dbPath);

try {
    const db = new Database(dbPath);

    console.log('Cleaning transaction and warehouse tables...');

    const tables = [
        'invoice_items',
        'inventory_transactions',
        'inventory_document_items',
        'inventory_documents',
        'inventory_batches',
        'purchase_invoice_items',
        'purchase_invoices',
        'invoices'
    ];

    const reset = db.transaction(() => {
        db.pragma('foreign_keys = OFF');
        const seqTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'").get();

        for (const table of tables) {
            console.log(`Clearing ${table}...`);
            db.prepare(`DELETE FROM ${table}`).run();
            if (seqTableExists) {
                db.prepare(`DELETE FROM sqlite_sequence WHERE name = '${table}'`).run();
            }
        }
        db.pragma('foreign_keys = ON');
    });

    reset();

    console.log('Zeroing product stock...');
    db.prepare('UPDATE products SET stock = 0').run();

    console.log('SUCCESS: Transactional data cleared.');

    // Verification
    console.log('\n[WERYFIKACJA] Sprawdzanie stanów magazynowych...');
    const products = db.prepare('SELECT id, name FROM products').all();
    console.log(`Znaleziono produktów: ${products.length}`);

    for (const product of products) {
        // Mocking InvoiceService.calculateStock logic: 
        // SUM(quantity) where type=PZ - SUM(quantity) where type=WZ
        const stockData = db.prepare(`
            SELECT 
                SUM(CASE WHEN type = 'PZ' THEN quantity ELSE -quantity END) as balance
            FROM inventory_transactions 
            WHERE productId = ?
        `).get(product.id);

        const stock = stockData.balance || 0;
        console.log(`Produkt: ${product.name.padEnd(30)} | Stan (Calculated): ${stock}`);
    }

    const inventoryValue = db.prepare('SELECT SUM(remainingQuantity * purchasePrice) as total FROM inventory_batches').get();
    console.log(`Całkowita wartość magazynu: ${inventoryValue.total || 0} PLN`);

    db.close();
    console.log('\nGotowy do Ticketa 2.');

    if (process.versions.electron) {
        const { app } = require('electron');
        app.quit();
    }
} catch (err) {
    console.error('ERROR during reset:', err.message);
    if (process.versions.electron) {
        const { app } = require('electron');
        app.quit();
    }
    process.exit(1);
}
