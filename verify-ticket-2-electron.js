require("reflect-metadata");
const { AppDataSource } = require("./src/core/db/data-source");
const { InvoiceService } = require("./src/services/invoice.service");
const { Product } = require("./src/database/entities/product.entity");
const { InvoiceType } = require("./src/database/entities/invoice.entity");
const { InventoryTransaction } = require("./src/database/entities/inventory-transaction.entity");

async function verify() {
    console.log("=== WERYFIKACJA TICKET 2 ===");
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const invoiceService = new InvoiceService();
        const productRepo = AppDataSource.getRepository(Product);

        // 1. Znajdź lub utwórz produkt
        let product = await productRepo.findOne({ where: { name: "TESTOWY TOWAR" } });
        if (!product) {
            product = await productRepo.save({
                name: "TESTOWY TOWAR",
                type: "TOWAR",
                vatRate: "23%",
                unit: "szt",
                isActive: true,
                stock: 0
            });
            console.log("Product seeded: TESTOWY TOWAR");
        } else {
            console.log(`Product found: ${product.name}, Current stock: ${product.stock}`);
        }

        // 2. Utwórz fakturę zakupu (PZ)
        console.log("\nTworzenie faktury zakupu (10 szt)...");
        const invoiceData = {
            type: InvoiceType.PURCHASE,
            invoiceNumber: "TEST/FZ/001",
            issueDate: new Date(),
            dueDate: new Date(),
            nip: "1234567890",
            currency: "PLN"
        };
        const items = [{
            productId: product.id,
            quantity: 10,
            priceNetCents: 10000,
            vatRate: "23%",
            vatValueCents: 2300,
            priceGrossCents: 12300
        }];

        await invoiceService.createInvoice(invoiceData, items);

        // 3. Sprawdź stan po zakupie
        const productAfter = await productRepo.findOne({ where: { id: product.id } });
        const transactions = await AppDataSource.getRepository(InventoryTransaction).find({
            where: { productId: product.id }
        });

        console.log("\n--- WYNIKI ---");
        console.log(`Stan w encji Product (stock): ${productAfter.stock} (Oczekiwano: 10)`);
        console.log(`Liczba transakcji w bazie: ${transactions.length} (Oczekiwano: 1)`);

        if (Number(productAfter.stock) === 10 && transactions.length === 1) {
            console.log("\nSUKCES: TICKET 2 zweryfikowany pomyślnie.");
        } else {
            console.error("\nBŁĄD: Oczekiwano innych wyników.");
        }

        await AppDataSource.destroy();
        process.exit(0);
    } catch (err) {
        console.error("BŁĄD weryfikacji:", err);
        process.exit(1);
    }
}

verify();
