const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Path to DB for scripts in data-source.ts is:
// path.join(__dirname, '../../../../green_manager_dev.sqlite')
// If running from root: ./green_manager_dev.sqlite
let dbPath = path.join(__dirname, '../../green_manager_dev.sqlite');

// But the app might use a different path if running.
// Let's check common locations.
const pathsToTry = [
    dbPath,
    path.join(os.homedir(), 'AppData', 'Roaming', 'PRODECO', 'green_manager.sqlite'),
    path.join(__dirname, 'green_manager.sqlite')
];

let db = null;
for (const p of pathsToTry) {
    if (fs.existsSync(p)) {
        console.log(`Trying database at: ${p}`);
        try {
            db = new Database(p);
            break;
        } catch (e) {
            console.error(`Failed to open ${p}: ${e.message}`);
        }
    }
}

if (!db) {
    console.error("Could not find or open any database file.");
    process.exit(1);
}

try {
    const product = db.prepare('SELECT * FROM products WHERE name = ?').get('Kosiarka Spalinowa TEST');
    if (product) {
        console.log("SUCCESS: Product found in database:");
        console.log(JSON.stringify(product, null, 2));

        const pzDocs = db.prepare(`
            SELECT doc.documentNumber, doc.date 
            FROM inventory_documents doc
            JOIN inventory_document_items item ON item.documentId = doc.id
            WHERE item.productId = ?
        `).all(product.id);

        if (pzDocs.length > 0) {
            console.log(`SUCCESS: Found ${pzDocs.length} PZ documents for this product.`);
            pzDocs.forEach(d => {
                console.log(`- Doc Number: ${d.documentNumber}, Date: ${d.date}`);
            });
        } else {
            console.log("FAILURE: No PZ documents found for this product.");
        }
    } else {
        console.log("FAILURE: Product 'Kosiarka Spalinowa TEST' not found in database.");
        // List last 5 products to see what we have
        const lastProducts = db.prepare('SELECT name FROM products ORDER BY createdAt DESC LIMIT 5').all();
        console.log("Last 5 products created:");
        console.log(lastProducts);
    }
} catch (error) {
    console.error("Error during query:", error);
} finally {
    if (db) db.close();
}
