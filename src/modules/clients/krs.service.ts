import axios from 'axios';

export interface KrsData {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    krs: string;
}

export class KrsService {
    private readonly baseUrl = 'https://api-krs.ms.gov.pl/api/krs/OdpisAktualny';

    /**
     * Pobiera dane z KRS po numerze (rejestr Przedsiębiorców - P)
     */
    async fetchKrsData(krs: string): Promise<KrsData | null> {
        if (!krs) return null;

        // KRS musi mieć 10 cyfr (uzupełniamy zerami z lewej jeśli trzeba)
        const formattedKrs = krs.padStart(10, '0');
        const url = `${this.baseUrl}/${formattedKrs}?rejestr=P&form=json`;

        try {
            console.log(`[KRS] Pobieranie danych dla KRS: ${formattedKrs}`);
            const response = await axios.get(url);

            if (!response.data || !response.data.odpis || !response.data.odpis.dane) {
                console.log(`[KRS] Nie znaleziono danych dla KRS: ${formattedKrs}`);
                return null;
            }

            const dane = response.data.odpis.dane;
            const dzial1 = dane.dzial1;

            // Nazwa spółki
            const nazwa = dzial1.danePodmiotu?.nazwa || '';

            // Adres siedziby
            const siedziba = dzial1.siedzibaIAdres?.adres || {};

            return {
                name: nazwa,
                street: siedziba.ulica ? `${siedziba.ulica} ${siedziba.nrDomu || ''}${siedziba.nrLokalu ? '/' + siedziba.nrLokalu : ''}`.trim() : (siedziba.miejscowosc || ''),
                postalCode: siedziba.kodPocztowy || '',
                city: siedziba.miejscowosc || '',
                krs: formattedKrs
            };
        } catch (error: any) {
            console.error('[KRS] Błąd API:', error.message);
            if (error.response) {
                console.error('[KRS] Status:', error.response.status);
            }
            return null;
        }
    }
}
