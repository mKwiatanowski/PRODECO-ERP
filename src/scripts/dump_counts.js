const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

const runDump = () => {
    try {
        const dbPath = 'C:\\Users\\mateusz.kwiatanowski\\AppData\\Roaming\\green-manager-erp\\green_manager.sqlite';
        const db = new Database(dbPath);

        console.log('--- DB DUMP COUNTS ---');
        const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log('Tables found:', tables.map(t => t.name).join(', '));

        for (const table of tables) {
            try {
                const countResult = db.prepare(`SELECT COUNT(*) as c FROM "${table.name}"`).get();
                const count = countResult ? countResult.c : 0;
                console.log(`${table.name}: ${count}`);
                if (count > 0 && (table.name === 'invoices' || table.name === 'products' || table.name === 'inventory_documents')) {
                    const rows = db.prepare(`SELECT * FROM "${table.name}" LIMIT 2`).all();
                    console.log(`  Sample ${table.name}:`, JSON.stringify(rows, null, 2));
                }
            } catch (innerErr) {
                console.log(`Error counting table ${table.name}:`, innerErr.message);
            }
        }
        db.close();
    } catch (err) {
        console.error('Błąd podczas dumpingu:', err.message);
    } finally {
        app.quit();
    }
};

app.whenReady().then(runDump);
