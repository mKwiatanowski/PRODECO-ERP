const { app } = require('electron');
const Database = require('better-sqlite3');

app.whenReady().then(() => {
    const dbPath = 'C:\\Users\\mateusz.kwiatanowski\\AppData\\Roaming\\green-manager-erp\\green_manager.sqlite';
    const db = new Database(dbPath);

    console.log('--- ALL INVOICES IN PERSISTENT DB ---');
    try {
        const invoices = db.prepare('SELECT id, invoiceNumber, createdAt FROM invoices').all();
        console.log(JSON.stringify(invoices, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    }
    db.close();
    app.quit();
});
