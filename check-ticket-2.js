const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite');

console.log('=== DEBUG DB (TICKET 2 VERIFICATION) ===');
const db = new Database(dbPath);

try {
    const product = db.prepare('SELECT * FROM products WHERE name = ?').get('TESTOWY TOWAR');
    console.log('\n--- PRODUCT ---');
    console.log(product);

    const transactions = db.prepare('SELECT * FROM inventory_transactions WHERE productId = ?').all(product?.id);
    console.log('\n--- TRANSACTIONS ---');
    console.log(transactions);

} catch (err) {
    console.error('Error:', err.message);
} finally {
    db.close();
}
if (process.versions.electron) require('electron').app.quit();
