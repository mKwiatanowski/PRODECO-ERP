const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite');
const db = new Database(dbPath);
const columns = db.prepare("PRAGMA table_info(products)").all();
console.log(JSON.stringify(columns, null, 2));
db.close();
