const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'green-manager-erp', 'green_manager.sqlite');
const db = new Database(dbPath);

console.log("Seeding products...");

// Add a TOWAR product
const productId = 'test-product-id-123';
const productName = 'TESTOWY TOWAR';

db.prepare(`
    INSERT INTO products (id, name, type, vatRate, unit, isActive, createdAt, updatedAt)
    VALUES (?, ?, 'TOWAR', '23%', 'szt', 1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, type=excluded.type
`).run(productId, productName, new Date().toISOString(), new Date().toISOString());

console.log(`Product seeded: ${productName} (${productId})`);

db.close();
