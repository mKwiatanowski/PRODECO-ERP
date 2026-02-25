import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { Invoice } from "../../database/entities/invoice.entity"
import { CompanyProfile } from "../../database/entities/company-profile.entity"
import { DataSource } from "typeorm"

export class PdfGeneratorService {
    constructor(private dataSource: DataSource) { }

    private formatIBAN(iban: string): string {
        if (!iban) return "";
        const clean = iban.replace(/\s+/g, '');

        // Fail-safe: jeśli numer jest za krótki (nie jest pełnym polskim IBANem), zwróć go bez zmian
        if (clean.length < 26) return iban;

        // Format: PL XX XXXX XXXX XXXX XXXX XXXX XXXX
        let result = clean.startsWith('PL') ? "PL " : "PL ";
        const numbers = clean.startsWith('PL') ? clean.substring(2) : clean;

        for (let i = 0; i < numbers.length; i++) {
            if (i > 0 && i % 4 === 0) result += " ";
            result += numbers[i];
        }
        return result;
    }

    async generateInvoicePdf(invoiceId: string): Promise<Uint8Array> {
        const invoiceRepo = this.dataSource.getRepository(Invoice);
        const companyRepo = this.dataSource.getRepository(CompanyProfile);

        const invoice = await invoiceRepo.findOne({
            where: { id: invoiceId },
            relations: ["items", "client", "seller"]
        });

        if (!invoice) throw new Error("Invoice not found");

        const seller = (await companyRepo.findOne({ where: {} })) || {
            name: "Brak danych sprzedawcy",
            nip: "",
            address: "",
            postalCode: "",
            city: "",
            bankAccountNumber: ""
        };

        const doc = new jsPDF();

        // --- 1. LOGO & HEADER ---
        doc.setTextColor(63, 81, 181); // Indigo color
        doc.setFont("helvetica", "bold");
        doc.setFontSize(26);
        doc.text("PRODECO", 20, 25);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.text("FAKTURA VAT", 200, 25, { align: "right" });
        doc.setFontSize(12);
        doc.text(`Nr: ${invoice.number}`, 200, 32, { align: "right" });

        // --- 2. DATES ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const issueDate = invoice.issueDate || new Date();
        const saleDate = invoice.saleDate || issueDate;
        let dueDate = invoice.dueDate;

        if (!dueDate) {
            dueDate = new Date(issueDate);
            dueDate.setDate(dueDate.getDate() + 7);
        }

        doc.text(`Data wystawienia: ${issueDate.toLocaleDateString('pl-PL')}`, 200, 45, { align: "right" });
        doc.text(`Data sprzedaży: ${saleDate.toLocaleDateString('pl-PL')}`, 200, 50, { align: "right" });
        doc.text(`Termin płatności: ${dueDate.toLocaleDateString('pl-PL')}`, 200, 55, { align: "right" });

        // --- 3. SELLER & BUYER (COLUMNS) ---
        doc.setDrawColor(230, 230, 230);
        doc.line(20, 65, 190, 65);

        // Seller column
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("SPRZEDAWCA", 20, 75);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text(seller?.name || "", 20, 80);
        doc.text(`NIP: ${seller?.nip || ""}`, 20, 84);
        doc.text(seller?.address || "", 20, 88);
        doc.text(`${seller?.postalCode || ""} ${seller?.city || ""}`, 20, 92);
        if (seller?.bankAccountNumber) {
            doc.setFont("helvetica", "bold");
            doc.text("Nr konta (IBAN):", 20, 100);
            doc.setFont("helvetica", "normal");
            doc.text(this.formatIBAN(seller.bankAccountNumber), 20, 104);
        }

        // Buyer column
        doc.setFont("helvetica", "bold");
        doc.text("NABYWCA", 110, 75);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.client?.name || "", 110, 80);
        doc.text(`NIP: ${invoice.client?.nip || ""}`, 110, 84);
        doc.text(invoice.client?.address || "", 110, 88);
        doc.text(`${invoice.client?.postalCode || ""} ${invoice.client?.city || ""}`, 110, 92);

        // --- 4. ITEMS TABLE ---
        if (!invoice.items || invoice.items.length === 0) {
            doc.setFontSize(10);
            doc.text("Brak pozycji na fakturze.", 20, 115);
            return new Uint8Array(doc.output("arraybuffer"));
        }

        const tableRows = invoice.items.map((item, index) => [
            { content: (index + 1).toString(), styles: { halign: 'center' as const } },
            item.description,
            { content: item.quantity.toString(), styles: { halign: 'center' as const } },
            { content: item.unit, styles: { halign: 'center' as const } },
            { content: item.netPrice.toFixed(2), styles: { halign: 'right' as const } },
            { content: `${item.vatRate}%`, styles: { halign: 'center' as const } },
            { content: item.netValue.toFixed(2), styles: { halign: 'right' as const } },
            { content: item.grossValue.toFixed(2), styles: { halign: 'right' as const } }
        ]);

        autoTable(doc, {
            startY: 115,
            head: [["Lp.", "Nazwa towaru lub usługi", "Ilość", "Jm", "Cena netto", "Stawka", "Wartość netto", "Wartość brutto"]],
            body: tableRows,
            theme: 'plain',
            headStyles: {
                fillColor: [245, 245, 245],
                textColor: [50, 50, 50],
                fontStyle: 'bold',
                lineWidth: 0.1,
                lineColor: [200, 200, 200]
            },
            styles: { fontSize: 8, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 10 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 25 },
                5: { cellWidth: 15 },
                6: { cellWidth: 25 },
                7: { cellWidth: 25 }
            }
        });

        const tableY = (doc as any).lastAutoTable.finalY + 10;

        // --- 5. VAT SUMMARY TABLE ---
        const vatGroups: Record<string, { net: number, vat: number, gross: number }> = {};
        invoice.items.forEach(item => {
            const rate = item.vatRate.toString();
            if (!vatGroups[rate]) vatGroups[rate] = { net: 0, vat: 0, gross: 0 };
            vatGroups[rate].net = Math.round((vatGroups[rate].net + item.netValue) * 100) / 100;
            vatGroups[rate].vat = Math.round((vatGroups[rate].vat + (item.grossValue - item.netValue)) * 100) / 100;
            vatGroups[rate].gross = Math.round((vatGroups[rate].gross + item.grossValue) * 100) / 100;
        });

        const vatTableRows = Object.entries(vatGroups).map(([rate, totals]) => [
            `${rate}%`,
            totals.net.toFixed(2),
            totals.vat.toFixed(2),
            totals.gross.toFixed(2)
        ]);

        autoTable(doc, {
            startY: tableY,
            margin: { left: 110 },
            head: [["Stawka VAT", "Netto", "VAT", "Brutto"]],
            body: vatTableRows,
            theme: 'grid',
            headStyles: { fillColor: [245, 245, 245], textColor: [50, 50, 50], fontStyle: 'bold' },
            styles: { fontSize: 8, halign: 'right' },
            columnStyles: { 0: { halign: 'center' } }
        });

        // --- 6. TOTAL SUMMARY ---
        const finalY = (doc as any).lastAutoTable.finalY + 15;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("DO ZAPŁATY:", 130, finalY + 5);
        doc.setFontSize(18);
        doc.setTextColor(63, 81, 181);
        doc.text(`${invoice.totalGross.toFixed(2)} PLN`, 200, finalY + 5, { align: "right" });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Metoda płatności: ${invoice.paymentType || 'Przelew'}`, 20, finalY);
        doc.text(`Status płatności: ${invoice.paymentStatus || 'Nieopłacona'}`, 20, finalY + 5);

        return new Uint8Array(doc.output("arraybuffer"));
    }
}
