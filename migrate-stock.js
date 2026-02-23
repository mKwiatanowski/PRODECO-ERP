const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite');

console.log('Migrating database: adding stock to products...');

try {
    const db = new Database(dbPath);
    db.prepare('ALTER TABLE products ADD COLUMN stock DECIMAL(10,2) DEFAULT 0').run();
    console.log('Success: stock column added.');
    db.close();
} catch (err) {
    console.log('Note:', err.message);
}

if (process.versions.electron) {
    require('electron').app.quit();
}
