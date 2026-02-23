const { app } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

app.whenReady().then(() => {
    const userData = app.getPath('userData');
    const dbPath = path.join(userData, 'green_manager.sqlite');
    console.log('--- DB PATH DISCOVERY ---');
    console.log('User Data Path:', userData);
    console.log('Database Path:', dbPath);
    console.log('File Exists:', fs.existsSync(dbPath));

    if (fs.existsSync(dbPath)) {
        try {
            const db = new Database(dbPath);
            const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
            console.log('Tables:', tables.map(t => t.name).join(', '));

            if (tables.some(t => t.name === 'invoices')) {
                const invoices = db.prepare('SELECT invoiceNumber, type FROM invoices').all();
                console.log('Invoices found:', invoices);
            } else {
                console.log('Table "invoices" not found!');
            }
            db.close();
        } catch (e) {
            console.log('Error opening DB:', e.message);
        }
    }
    app.quit();
});
