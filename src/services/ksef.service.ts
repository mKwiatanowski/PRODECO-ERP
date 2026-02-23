import { AppDataSource } from "../core/db/data-source";
import { Invoice, KsefStatus } from "../database/entities/invoice.entity";

export class KsefService {
    /**
     * Czyści NIP z myślników i spacji.
     */
    private cleanNIP(nip: string): string {
        return nip.replace(/[- ]/g, "");
    }

    /**
     * Konwertuje grosze na format dziesiętny (string).
     */
    private toDecimal(cents: number): string {
        return (cents / 100).toFixed(2);
    }

    /**
     * Generuje strukturę JSON odpowiadającą schemie XML FA(2).
     */
    async generateKsefXml(invoiceId: string): Promise<any> {
        const invoiceRepo = AppDataSource.getRepository(Invoice);
        const invoice = await invoiceRepo.findOne({
            where: { id: invoiceId },
            relations: ["items"]
        });

        if (!invoice) {
            throw new Error(`Nie znaleziono faktury o ID: ${invoiceId}`);
        }

        const cleanNip = invoice.nip ? this.cleanNIP(invoice.nip) : "";

        // Mapowanie na strukturę FA(2)
        const ksefData = {
            Naglowek: {
                KodFormularza: {
                    value: "FA",
                    kodSystemowy: "FA (2)",
                    wersjaSchemy: "1-0E"
                },
                VariantFormularza: 2,
                DataWytworzeniaFa: new Date().toISOString()
            },
            Podmiot1: {
                DaneIdentyfikacyjne: {
                    NIP: "PL5260000000", // Przykładowy NIP sprzedawcy
                    Nazwa: "PRODECO SYSTEMS SP. Z O.O."
                },
                Adres: {
                    KodKraju: "PL",
                    AdresL1: "ul. Przykładowa 123",
                    AdresL2: "00-001 Warszawa"
                }
            },
            Podmiot2: {
                DaneIdentyfikacyjne: {
                    NIP: cleanNip,
                    Nazwa: "Kontrahent Mock" // W realnym systemie pobierane z encji klienta
                }
            },
            Fa: {
                KodWaluty: invoice.currency,
                P_1: new Date(invoice.issueDate).toISOString().split("T")[0],
                P_2: invoice.invoiceNumber,
                P_13_1: this.toDecimal(invoice.totalNetCents),
                P_14_1: this.toDecimal(invoice.totalVatCents),
                P_15: this.toDecimal(invoice.totalGrossCents),
                Adnotacje: {
                    P_16: 2, // Brak MPP
                    P_17: 2,
                    P_18: 2,
                    P_18A: 2,
                    P_19: 2,
                    P_22: 2,
                    P_23: 2
                },
                RodzajFaktury: "VAT",
                FaWiersze: invoice.items.map((item, index) => ({
                    NrWierszaFa: index + 1,
                    P_7: item.productId, // Opis towaru/usługi
                    P_8A: "szt.",
                    P_8B: item.quantity,
                    P_9A: this.toDecimal(item.priceNetCents),
                    P_11: this.toDecimal(item.priceNetCents * item.quantity),
                    P_12: item.vatRate.replace("%", "")
                }))
            }
        };

        console.log(`[KSeF] Generowanie struktury XML dla dokumentu: ${invoice.invoiceNumber}`);
        console.log(JSON.stringify(ksefData, null, 2));

        return ksefData;
    }

    /**
     * Aktualizuje status KSeF faktury.
     */
    async updateKsefStatus(invoiceId: string, status: KsefStatus, referenceNumber?: string): Promise<void> {
        const invoiceRepo = AppDataSource.getRepository(Invoice);
        await invoiceRepo.update(invoiceId, {
            ksefStatus: status,
            ksefReferenceNumber: referenceNumber || undefined
        });
        console.log(`[KSeF] Zaktualizowano status faktury ${invoiceId} na: ${status}`);
    }
}
