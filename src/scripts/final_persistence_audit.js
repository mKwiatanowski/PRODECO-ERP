const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

const runAudit = () => {
    const dbPath = 'C:\\Users\\mateusz.kwiatanowski\\AppData\\Roaming\\green-manager-erp\\green_manager.sqlite';
    const db = new Database(dbPath);

    console.log('--- FINAL PERSISTENCE AUDIT ---');

    try {
        // 1. Weryfikacja Produktu
        const product = db.prepare('SELECT * FROM products WHERE name = ?').get('Produkt Trwały TEST');
        if (product) {
            console.log('1. Produkt [OK]: "Produkt Trwały TEST" znaleziony w pliku.');
            console.log('   - ID:', product.id);
        } else {
            console.log('1. Produkt [BŁĄD]: Nie znaleziono produktu w pliku.');
        }

        // 2. Weryfikacja Faktury
        const invoice = db.prepare('SELECT * FROM invoices WHERE invoiceNumber = ?').get('PERSISTENCE/TEST/001');
        if (invoice) {
            console.log('2. Faktura [OK]: "PERSISTENCE/TEST/001" znaleziona w pliku.');
            console.log('   - ID:', invoice.id);
            console.log('   - Kwota Brutto:', invoice.totalGrossCents / 100);
        } else {
            console.log('2. Faktura [BŁĄD]: Nie znaleziono faktury w pliku.');
        }

        // 3. Weryfikacja Dokumentu PZ
        const doc = db.prepare('SELECT * FROM inventory_documents WHERE referenceId = ?').get('PERSISTENCE/TEST/001');
        if (doc) {
            console.log('3. Dokument PZ [OK]: Znaleziono dokument dla faktury PERSISTENCE/TEST/001.');
            console.log('   - Numer dokumentu:', doc.documentNumber);
        } else {
            console.log('3. Dokument PZ [BŁĄD]: Nie znaleziono dokumentu PZ.');
        }

    } catch (err) {
        console.error('Błąd audytu:', err.message);
    } finally {
        db.close();
        app.quit();
    }
};

app.whenReady().then(runAudit);
