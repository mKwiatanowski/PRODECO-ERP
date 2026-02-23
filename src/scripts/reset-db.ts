import { AppDataSource } from "../core/db/data-source";
import { Product } from "../database/entities/product.entity";
import { InventoryService } from "../modules/inventory/inventory.service";
import { InvoiceService } from "../services/invoice.service";

async function resetDb() {
    console.log("=== RESET BAZY DANYCH: TICKET 1 ===");
    console.log("Inicjalizacja Data Source...");

    try {
        await AppDataSource.initialize();
        console.log("Data Source zainicjalizowany.");

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();

        console.log("Rozpoczynanie czyszczenia tabel transakcyjnych...");

        // Kolejność ważna ze względu na klucze obce w bazie
        const tables = [
            'invoice_items',
            'inventory_transactions',
            'inventory_document_items',
            'inventory_documents',
            'inventory_batches',
            'purchase_invoice_items',
            'purchase_invoices',
            'invoices'
        ];

        await queryRunner.query("PRAGMA foreign_keys = OFF;");

        for (const table of tables) {
            console.log(`Czyszczenie tabeli: ${table}...`);
            await queryRunner.query(`DELETE FROM ${table};`);
            // Reset autoincrement ONLY if sqlite_sequence exists
            const seqExists = await queryRunner.query(`SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence';`);
            if (seqExists.length > 0) {
                await queryRunner.query(`DELETE FROM sqlite_sequence WHERE name = '${table}';`);
            }
        }

        await queryRunner.query("PRAGMA foreign_keys = ON;");
        console.log("SUKCES: Dane transakcyjne usunięte.");

        // Weryfikacja stanów
        console.log("\n[WERYFIKACJA] Sprawdzanie stanów magazynowych...");
        const inventoryService = new InventoryService(AppDataSource);
        const invoiceService = new InvoiceService();

        const products = await AppDataSource.getRepository(Product).find();
        console.log(`Znaleziono produktów: ${products.length}`);

        for (const product of products) {
            const stock = await invoiceService.calculateStock(product.id);
            console.log(`Produkt: ${product.name.padEnd(30)} | Stan (InvoiceService): ${stock}`);
        }

        const totalValue = await inventoryService.getTotalInventoryValue();
        console.log(`Całkowita wartość magazynu (InventoryService): ${totalValue} PLN`);

        await queryRunner.release();
        await AppDataSource.destroy();
        console.log("\nGotowy do Ticketa 2.");
    } catch (error) {
        console.error("BŁĄD podczas zerowania bazy:", error);
        process.exit(1);
    }
}

resetDb();
