import axios from 'axios';

export class WhiteListService {
    private readonly baseUrl = 'https://wl-api.mf.gov.pl/api/search/nip';

    async fetchWhiteListData(nip: string): Promise<any> {
        const today = new Date().toISOString().split('T')[0];
        const url = `${this.baseUrl}/${nip}?date=${today}`;

        try {
            console.log(`[WhiteList] Pobieranie danych dla NIP: ${nip} z datą: ${today}`);
            const response = await axios.get(url);
            console.log("[MF DEBUG] Surowa odpowiedź:", response.data);

            if (!response.data || !response.data.result || !response.data.result.subject) {
                throw new Error('NIP_NOT_FOUND');
            }

            const subject = response.data.result.subject;

            // Mapowanie adresu
            const fullAddress = subject.workingAddress || subject.residenceAddress || '';
            const { street, postalCode, city } = this.parseAddress(fullAddress);

            return {
                name: subject.name || '',
                nip: subject.nip || nip,
                regon: subject.regon || '',
                krs: subject.krs || '',
                street: street,
                postalCode: postalCode,
                city: city,
                bankAccountNumber: subject.accountNumbers?.[0] || '',
                type: 'FIRMA'
            };
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 404) {
                    throw new Error('NIP_NOT_FOUND');
                }
                if (error.response.status === 429) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                }
                throw new Error(`Błąd MF API (${error.response.status}): ${error.response.data?.message || error.message}`);
            }
            if (error.message === 'NIP_NOT_FOUND') throw error;
            throw new Error(`Błąd połączenia z MF: ${error.message}`);
        }
    }

    private parseAddress(address: string): { street: string, postalCode: string, city: string } {
        // Przykładowy format: "ul. Testowa 123, 00-001 Warszawa"
        // API MF często zwraca adres w jednej linii.

        let street = '';
        let postalCode = '';
        let city = '';

        if (!address) return { street, postalCode, city };

        // Prosta próba rozbicia po przecinku (jeśli występuje)
        const parts = address.split(',').map(p => p.trim());

        if (parts.length >= 2) {
            street = parts[0];
            const cityPart = parts[1];

            // Wyciąganie kodu pocztowego (format XX-XXX)
            const zipMatch = cityPart.match(/(\d{2}-\d{3})/);
            if (zipMatch) {
                postalCode = zipMatch[1];
                city = cityPart.replace(postalCode, '').trim();
            } else {
                city = cityPart;
            }
        } else {
            // Jeśli nie ma przecinka, szukamy kodu pocztowego
            const zipMatch = address.match(/(\d{2}-\d{3})/);
            if (zipMatch) {
                postalCode = zipMatch[1];
                const index = address.indexOf(postalCode);
                street = address.substring(0, index).trim().replace(/,$/, '');
                city = address.substring(index + postalCode.length).trim();
            } else {
                street = address;
            }
        }

        return { street, postalCode, city };
    }
}
