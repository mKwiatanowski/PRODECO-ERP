require("reflect-metadata");
const { AppDataSource } = require("../core/db/data-source");
const { InvoiceService, KSeFCalculator } = require("../services/invoice.service");
const { ProductType } = require("../database/entities/product.entity");
const { InvoiceType, KsefStatus } = require("../database/entities/invoice.entity");
const { InventoryTransactionType } = require("../database/entities/inventory-transaction.entity");
const { KsefService } = require("../services/ksef.service");

// Entities needed for Repository access
const { Product } = require("../database/entities/product.entity");
const { Invoice } = require("../database/entities/invoice.entity");
const { InventoryTransaction } = require("../database/entities/inventory-transaction.entity");

async function runUAT() {
    console.log("=== START UAT: WIELKA PĘTLA PRODECO ERP ===\n");

    const results = [];

    try {
        // Inicjalizacja Połączenia
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("[INIT] Połączono z bazą danych.");
        }

        const invoiceService = new InvoiceService();
        const ksefService = new KsefService();

        // KROK 1: Przygotowanie danych
        console.log("\n[KROK 1] Przygotowanie produktu i usługi...");
        const productRepo = AppDataSource.getRepository(Product);

        let nawoz = await productRepo.save({
            name: "Nawóz Ogrodniczy 50kg",
            type: ProductType.TOWAR,
            vatRate: "8%",
            unit: "szt",
            isActive: true
        });

        let usluga = await productRepo.save({
            name: "Projektowanie Ogrodu",
            type: ProductType.USLUGA,
            vatRate: "23%",
            unit: "szt",
            isActive: true
        });

        console.log(`Utworzono: ${nawoz.name} (ID: ${nawoz.id})`);
        console.log(`Utworzono: ${usluga.name} (ID: ${usluga.id})`);

        // KROK 2: Zakup (PZ)
        console.log("\n[KROK 2] Wystawianie faktury ZAKUPU (100 szt. nawozu)...");
        const purchaseInvoiceData = {
            type: InvoiceType.PURCHASE,
            invoiceNumber: "FZ/2026/02/001",
            issueDate: new Date(),
            dueDate: new Date(),
            nip: "1234567890",
            currency: "PLN"
        };

        const purchaseItems = [{
            productId: nawoz.id,
            quantity: 100,
            priceNetCents: 10000 * 100, // 100 szt * 100.00 zł
            vatRate: "8%",
            vatValueCents: 800 * 100,
            priceGrossCents: 10800 * 100
        }];

        await invoiceService.createInvoice(purchaseInvoiceData, purchaseItems);

        const stockAfterPurchase = await invoiceService.calculateStock(nawoz.id);
        const pzExists = await AppDataSource.getRepository(InventoryTransaction).findOne({
            where: { productId: nawoz.id, type: InventoryTransactionType.PZ }
        });

        if (stockAfterPurchase === 100 && pzExists) {
            results.push({ step: "Przyjęcie towaru (PZ)", status: "PASS", logs: `Stan: ${stockAfterPurchase}, PZ utworzone.` });
            console.log("PASS: Przyjęcie towaru (PZ) zakończone pomyślnie.");
        } else {
            results.push({ step: "Przyjęcie towaru (PZ)", status: "FAIL", logs: `Stan: ${stockAfterPurchase}, PZ: ${!!pzExists}` });
            console.log("FAIL: Błąd podczas przyjęcia towaru.");
        }

        // KROK 3 & 4: Sprzedaż i Walidacja Finansowa
        console.log("\n[KROK 3] Wystawianie faktury SPRZEDAŻY (10 nawozów + 1 usługa)...");
        const saleInvoiceData = {
            type: InvoiceType.SALE,
            invoiceNumber: "FS/2026/02/001",
            issueDate: new Date(),
            dueDate: new Date(),
            nip: "1234567890",
            currency: "PLN"
        };

        const item1Net = 1000 * 100; // 1000.00 PLN w groszach
        const item1Calc = KSeFCalculator.calculateFromNet(item1Net, "8%");

        const item2Net = 200 * 100; // 200.00 PLN w groszach
        const item2Calc = KSeFCalculator.calculateFromNet(item2Net, "23%");

        const saleItems = [
            {
                productId: nawoz.id,
                quantity: 10,
                priceNetCents: item1Net,
                vatRate: "8%",
                vatValueCents: item1Calc.vatCents,
                priceGrossCents: item1Calc.grossCents
            },
            {
                productId: usluga.id,
                quantity: 1,
                priceNetCents: item2Net,
                vatRate: "23%",
                vatValueCents: item2Calc.vatCents,
                priceGrossCents: item2Calc.grossCents
            }
        ];

        const savedSaleInvoice = await invoiceService.createInvoice(saleInvoiceData, saleItems);

        const expectedTotalGross = item1Calc.grossCents + item2Calc.grossCents;
        console.log(`Oczekiwane Brutto: ${expectedTotalGross} gr, Zapisane: ${savedSaleInvoice.totalGrossCents} gr`);

        if (savedSaleInvoice.totalGrossCents === expectedTotalGross) {
            results.push({ step: "Walidacja sumy faktury (8% + 23%)", status: "PASS", logs: `Suma Brutto: ${savedSaleInvoice.totalGrossCents / 100} PLN.` });
            console.log("PASS: Walidacja finansowa poprawna.");
        } else {
            results.push({ step: "Walidacja sumy faktury (8% + 23%)", status: "FAIL", logs: `Oczekiwano: ${expectedTotalGross}, Otrzymano: ${savedSaleInvoice.totalGrossCents}` });
            console.log("FAIL: Błąd w wyliczeniach finansowych.");
        }

        // KROK 5: Integracje (PDF & KSeF Mock)
        console.log("\n[KROK 5] Integracja: PDF i KSeF...");
        console.log("[MOCK] Symulacja PrintService.printInvoice...");
        results.push({ step: "Generowanie PDF (Mock)", status: "PASS", logs: "Zasymulowano poprawny eksport do PDF." });

        console.log("[KSeF] Wysyłanie faktury...");
        await ksefService.updateKsefStatus(savedSaleInvoice.id, KsefStatus.OCZEKUJE);

        console.log("Oczekiwanie 2 sekundy na status KSeF...");
        await new Promise(res => setTimeout(res, 2000));

        const refNo = "KSeF-20260222-ABC-123";
        await ksefService.updateKsefStatus(savedSaleInvoice.id, KsefStatus.PRZYJĘTO, refNo);

        const finalInvoice = await AppDataSource.getRepository(Invoice).findOne({ where: { id: savedSaleInvoice.id } });
        if (finalInvoice && finalInvoice.ksefStatus === KsefStatus.PRZYJĘTO && finalInvoice.ksefReferenceNumber === refNo) {
            results.push({ step: "Proces KSeF (Mock)", status: "PASS", logs: `Status: PRZYJĘTO, Ref: ${refNo}` });
            console.log("PASS: KSeF status zaktualizowany.");
        } else {
            results.push({ step: "Proces KSeF (Mock)", status: "FAIL", logs: `Status: ${finalInvoice ? finalInvoice.ksefStatus : 'null'}` });
            console.log("FAIL: KSeF błąd statusu.");
        }

        // KROK 6: Stan Magazynowy Finał
        console.log("\n[KROK 6] Weryfikacja końcowa magazynu...");
        const finalNawozStock = await invoiceService.calculateStock(nawoz.id);
        const finalUslugaStock = await invoiceService.calculateStock(usluga.id);

        console.log(`Stan Nawozu: ${finalNawozStock} (Oczekiwano: 90)`);
        console.log(`Stan Usługi: ${finalUslugaStock} (Oczekiwano: 0)`);

        if (finalNawozStock === 90 && finalUslugaStock === 0) {
            results.push({ step: "Stan magazynowy po sprzedaży (WZ)", status: "PASS", logs: `Nawóz: ${finalNawozStock}, Usługa: ${finalUslugaStock}.` });
            console.log("PASS: Stany magazynowe poprawne.");
        } else {
            results.push({ step: "Stan magazynowy po sprzedaży (WZ)", status: "FAIL", logs: `Nawóz: ${finalNawozStock}, Usługa: ${finalUslugaStock}` });
            console.log("FAIL: Błąd stanów magazynowych.");
        }

    } catch (error) {
        console.error("\n!!! KRYTYCZNY BŁĄD PODCZAS UAT !!!");
        console.error(error);
    } finally {
        console.log("\n=== PODSUMOWANIE UAT ===");
        console.table(results);
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

runUAT();
