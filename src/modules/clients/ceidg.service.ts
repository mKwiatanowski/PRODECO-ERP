import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface CeidgData {
    name: string;
    street: string;
    postalCode: string;
    city: string;
    nip: string;
}

export class CeidgService {
    private readonly baseUrl = 'https://dane.biznes.gov.pl/api/ceidg/v3/firma';
    private token: string | null = null;

    constructor() {
        this.loadToken();
    }

    private loadToken() {
        try {
            // Lokalizacja tokena zgodnie z wytycznymi: główny katalog projektu
            // Sprawdzamy plik CEIDG_API_TOKEN.env w głównym katalogu
            const rootDir = process.cwd();
            const tokenFilePath = path.join(rootDir, 'CEIDG_API_TOKEN.env');

            if (fs.existsSync(tokenFilePath)) {
                const content = fs.readFileSync(tokenFilePath, 'utf8');
                const match = content.match(/CEIDG_API_TOKEN=(.*)/);
                if (match && match[1]) {
                    this.token = match[1].trim();
                    console.log('[CEIDG] Token załadowany pomyślnie.');
                }
            } else {
                console.warn('[CEIDG] Nie znaleziono pliku tokena w:', tokenFilePath);
            }
        } catch (error) {
            console.error('[CEIDG] Błąd podczas ładowania tokena:', error);
        }
    }

    async fetchCeidgData(nip: string): Promise<CeidgData | null> {
        if (!this.token) {
            console.warn('[CEIDG] Brak tokena API. Pomijanie CEIDG.');
            return null;
        }

        try {
            console.log(`[CEIDG] Pobieranie danych dla NIP: ${nip}`);
            const response = await axios.get(this.baseUrl, {
                params: { nip },
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            // Dodanie logowania surowej odpowiedzi dla celów debugowania
            console.log("[CEIDG RAW RESPONSE]", response.data);

            // Zakładamy strukturę v3: result.firma
            if (!response.data || !response.data.firma || response.data.firma.length === 0) {
                console.log(`[CEIDG] Nie znaleziono danych dla NIP: ${nip}`);
                return null;
            }

            const firma = response.data.firma[0];

            // Nazwa handlowa ma priorytet (często w polu "nazwa")
            const name = firma.nazwa || '';

            // Adres korespondencyjny (najbardziej kompletny dla JDG w v3)
            const adres = firma.adresKorespondencyjny || firma.adresDoreczen || {};

            return {
                name: name,
                street: adres.ulica ? `${adres.ulica} ${adres.budynek || ''}${adres.lokal ? '/' + adres.lokal : ''}`.trim() : (adres.budynek || ''),
                postalCode: adres.kod || adres.kodPocztowy || '',
                city: adres.miasto || '',
                nip: nip
            };
        } catch (error: any) {
            console.error('[CEIDG] Błąd API:', error.message);
            if (error.response) {
                console.error('[CEIDG] Status:', error.response.status);
            }
            return null;
        }
    }
}
