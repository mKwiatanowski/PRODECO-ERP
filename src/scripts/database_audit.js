const { app } = require('electron');
const Database = require('better-sqlite3');
const path = require('path');

const runAudit = () => {
    const dbPath = 'C:\\Users\\mateusz.kwiatanowski\\AppData\\Roaming\\green-manager-erp\\green_manager.sqlite';
    const db = new Database(dbPath);

    console.log('--- AUDYT BAZY DANYCH (Virtual Product) ---');

    try {
        // 1. Weryfikacja Produktu
        const product = db.prepare('SELECT * FROM products WHERE name = ?').get('Kosiarka Spalinowa TEST');
        if (!product) {
            // Spróbujmy też nazwy z mojego testu E2E na wszelki wypadek
            const productFinal = db.prepare('SELECT * FROM products WHERE name = ?').get('Kosiarka Spalinowa FINAL');
            if (productFinal) {
                console.log('1. Produkt [OK]: "Kosiarka Spalinowa FINAL" znaleziony.');
                console.log('   - ID:', productFinal.id);
                console.log('   - Jednostka:', productFinal.unit);
                console.log('   - Typ:', productFinal.type);
            } else {
                console.log('1. Produkt [BŁĄD]: Nie znaleziono "Kosiarka Spalinowa TEST" ani "Kosiarka Spalinowa FINAL".');
                const lastProducts = db.prepare('SELECT name FROM products ORDER BY id DESC LIMIT 3').all();
                console.log('   Ostatnie produkty w bazie:', lastProducts);
            }
        } else {
            console.log('1. Produkt [OK]: "Kosiarka Spalinowa TEST" znaleziony.');
            console.log('   - ID:', product.id);
            console.log('   - Jednostka:', product.unit);
            console.log('   - Typ:', product.type);
        }

        // 2. Weryfikacja Dokumentu PZ
        const targetInvoice = 'TEST/SMOKE/001';
        const invoiceAlt = 'SMOKE/FINAL/003';

        const doc = db.prepare('SELECT * FROM inventory_documents WHERE referenceId = ? OR referenceId = ?').get(targetInvoice, invoiceAlt);
        if (doc) {
            console.log(`2. Dokument PZ [OK]: Znaleziono dokument dla faktury ${doc.referenceId}.`);
            console.log('   - Numer dokumentu:', doc.documentNumber);
            console.log('   - Typ:', doc.type);
        } else {
            console.log('2. Dokument PZ [BŁĄD]: Nie znaleziono dokumentu PZ powiązanego z TEST/SMOKE/001 ani SMOKE/FINAL/003.');
        }

        // 3. Weryfikacja Ruchu Magazynowego
        const targetProduct = product || db.prepare('SELECT * FROM products WHERE name = ?').get('Kosiarka Spalinowa FINAL');
        if (targetProduct) {
            const transaction = db.prepare('SELECT * FROM inventory_transactions WHERE productId = ?').get(targetProduct.id);
            if (transaction) {
                console.log('3. Ruch Magazynowy [OK]: Znaleziono rekord w inventory_transactions.');
                console.log('   - Ilość:', transaction.quantity);
                console.log('   - Typ:', transaction.type);
            } else {
                console.log('3. Ruch Magazynowy [BŁĄD]: Brak rekordów w inventory_transactions dla tego produktu.');
            }
        }

        // 4. Weryfikacja Relacji InvoiceItem -> Product
        const item = db.prepare('SELECT * FROM invoice_items WHERE productName LIKE ?').get('%Kosiarka Spalinowa%');
        if (item) {
            console.log('4. Relacja InvoiceItem [OK]: Znaleziono pozycję faktury.');
            console.log('   - Przypisane productId:', item.productId);
            if (targetProduct && item.productId === targetProduct.id) {
                console.log('   - Powiązanie z produktem: POPRAWNE (ID zgodne)');
            } else {
                console.log('   - Powiązanie z produktem: BŁĘDNE lub brak (ID niezgodne)');
            }
        } else {
            console.log('4. Relacja InvoiceItem [BŁĄD]: Nie znaleziono pozycji faktury dla kosiarki.');
        }

    } catch (err) {
        console.error('Błąd podczas wykonywania audytu:', err.message);
    } finally {
        db.close();
        app.quit();
    }
};

app.whenReady().then(runAudit);
