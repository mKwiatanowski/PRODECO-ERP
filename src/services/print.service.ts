import { AppDataSource } from "../core/db/data-source";
import { Invoice } from "../database/entities/invoice.entity";
import { Product } from "../database/entities/product.entity";
import { dialog } from "electron";
import * as fs from "fs";

export class PrintService {
    /**
     * Główna metoda generująca PDF dla faktury.
     */
    async printInvoice(invoiceId: string): Promise<void> {
        try {
            // 1. Pobierz fakturę wraz z pozycjami
            const invoiceRepo = AppDataSource.getRepository(Invoice);
            const invoice = await invoiceRepo.findOne({
                where: { id: invoiceId },
                relations: ["items"]
            });

            if (!invoice) {
                throw new Error(`Nie znaleziono faktury o ID: ${invoiceId}`);
            }

            // 2. Pobierz produkty dla pozycji (jeśli relacja nie jest zdefiniowana w encji)
            const productRepo = AppDataSource.getRepository(Product);
            const enrichedItems = await Promise.all(invoice.items.map(async (item) => {
                let productName = item.productName || "Nieznany produkt";

                if (item.productId) {
                    const product = await productRepo.findOne({ where: { id: item.productId } });
                    if (product) productName = product.name;
                }

                return {
                    ...item,
                    productName,
                    priceNet: (item.priceNetCents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 }),
                    vatValue: (item.vatValueCents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 }),
                    priceGross: (item.priceGrossCents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 }),
                    totalGross: ((item.priceGrossCents * item.quantity) / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 })
                };
            }));

            // 3. Przygotuj payload JSON
            const payload = {
                template: "invoice_template.docx", // Domyślny szablon
                output_format: "pdf",
                data: {
                    invoice_number: invoice.invoiceNumber,
                    issue_date: new Date(invoice.issueDate).toLocaleDateString("pl-PL"),
                    due_date: new Date(invoice.dueDate).toLocaleDateString("pl-PL"),
                    client_nip: invoice.nip || "",
                    currency: invoice.currency,
                    total_net: (invoice.totalNetCents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + " " + invoice.currency,
                    total_vat: (invoice.totalVatCents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + " " + invoice.currency,
                    total_gross: (invoice.totalGrossCents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + " " + invoice.currency,
                    items: enrichedItems.map((item, index) => ({
                        no: index + 1,
                        name: item.productName,
                        quantity: item.quantity,
                        unit: "szt.", // Uproszczenie dla mocka
                        net_price: item.priceNet,
                        vat_rate: item.vatRate,
                        gross_price: item.priceGross,
                        total_gross: item.totalGross
                    }))
                }
            };

            // 4. Wyślij żądanie do mikroserwisu Python
            console.log("[PrintService] Wysyłanie żądania do mikroserwisu...");
            const response = await fetch("http://localhost:5000/PrintDocument", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Błąd mikroserwisu (${response.status}): ${errorText}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // 5. Okno zapisu pliku
            const { filePath, canceled } = await dialog.showSaveDialog({
                title: "Zapisz fakturę jako PDF",
                defaultPath: `Faktura_${invoice.invoiceNumber.replace(/\//g, "_")}.pdf`,
                filters: [{ name: "Pliki PDF", extensions: ["pdf"] }]
            });

            if (canceled || !filePath) {
                console.log("[PrintService] Zapisywanie anulowane przez użytkownika.");
                return;
            }

            // 6. Zapisz plik na dysku
            fs.writeFileSync(filePath, buffer);
            console.log(`[PrintService] Faktura zapisana pomyślnie: ${filePath}`);

        } catch (error) {
            console.error("[PrintService] Błąd podczas generowania faktury:", error);
            throw error; // Przekaż błąd dalej do frontendu
        }
    }
}
