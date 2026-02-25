import { DataSource } from "typeorm"
import { Client } from "../../database/entities/client.entity"
import { WhiteListService } from "./whiteList.service"
import { CeidgService } from "./ceidg.service"
import { KrsService } from "./krs.service"
import { NumberingService } from "../system/numbering.service"

export class ClientService {
    private whiteListService: WhiteListService;
    private ceidgService: CeidgService;
    private krsService: KrsService;
    private numberingService: NumberingService;

    constructor(private dataSource: DataSource) {
        this.whiteListService = new WhiteListService();
        this.ceidgService = new CeidgService();
        this.krsService = new KrsService();
        this.numberingService = new NumberingService(this.dataSource);
    }

    async createClient(dto: Partial<Client> & { name: string, type: string }): Promise<Client> {
        const client = new Client()
        client.name = dto.name
        client.nip = dto.nip || ''
        client.shortName = dto.shortName || ''
        client.phone = dto.phone || ''
        client.phoneNumber = dto.phoneNumber || ''
        client.address = dto.address || ''
        client.street = dto.street || ''
        client.postalCode = dto.postalCode || ''
        client.city = dto.city || ''
        client.email = dto.email || ''
        client.type = dto.type
        client.paymentTermsDays = dto.paymentTermsDays || 0
        client.creditLimit = dto.creditLimit || 0
        client.bankAccountNumber = dto.bankAccountNumber || ''
        client.defaultDiscount = dto.defaultDiscount || 0
        client.currency = dto.currency || 'PLN'
        client.shippingAddress = dto.shippingAddress || ''

        if (dto.isActive !== undefined) {
            client.isActive = dto.isActive
        }

        // Automatyczne nadawanie numeru klienta
        if (!client.clientNumber) {
            client.clientNumber = await this.numberingService.generateNextNumber('CLIENT');
        }

        return await this.dataSource.getRepository(Client).save(client)
    }

    async updateClient(id: string, dto: Partial<Client>): Promise<Client> {
        const repo = this.dataSource.getRepository(Client);
        const client = await repo.findOneByOrFail({ id });

        if (dto.name) client.name = dto.name;
        if (dto.nip !== undefined) client.nip = dto.nip;
        if (dto.shortName !== undefined) client.shortName = dto.shortName;
        if (dto.phone !== undefined) client.phone = dto.phone;
        if (dto.phoneNumber !== undefined) client.phoneNumber = dto.phoneNumber;
        if (dto.address !== undefined) client.address = dto.address;
        if (dto.street !== undefined) client.street = dto.street;
        if (dto.postalCode !== undefined) client.postalCode = dto.postalCode;
        if (dto.city !== undefined) client.city = dto.city;
        if (dto.email !== undefined) client.email = dto.email;
        if (dto.type !== undefined) client.type = dto.type;
        if (dto.isActive !== undefined) client.isActive = dto.isActive;

        if (dto.paymentTermsDays !== undefined) client.paymentTermsDays = dto.paymentTermsDays;
        if (dto.creditLimit !== undefined) client.creditLimit = dto.creditLimit;
        if (dto.bankAccountNumber !== undefined) client.bankAccountNumber = dto.bankAccountNumber;
        if (dto.defaultDiscount !== undefined) client.defaultDiscount = dto.defaultDiscount;
        if (dto.currency !== undefined) client.currency = dto.currency;
        if (dto.shippingAddress !== undefined) client.shippingAddress = dto.shippingAddress;

        return await repo.save(client);
    }

    async getClients(): Promise<Client[]> {
        return await this.dataSource.getRepository(Client).find({
            order: {
                createdAt: 'DESC'
            }
        })
    }

    async fetchExternalData(nip: string): Promise<Partial<Client>> {
        console.log(`[EXTERNAL_DATA] Rozpoczynanie pobierania danych dla NIP: ${nip}`);

        // KROK 1: Pobierz dane z Białej Listy MF (Konta bankowe + Podstawa do KRS/JDG)
        let mfData: any = {};
        try {
            mfData = await this.whiteListService.fetchWhiteListData(nip);
        } catch (error: any) {
            console.warn('[EXTERNAL_DATA] Biała Lista MF nie zwróciła danych lub błąd:', error.message);
        }

        // KROK 2: Próba pobrania z CEIDG (dla JDG)
        let ceidgData = await this.ceidgService.fetchCeidgData(nip);
        let finalData: Partial<Client> = {};

        if (ceidgData) {
            console.log('[EXTERNAL_DATA] Znaleziono podmiot w CEIDG (JDG).');
            finalData = {
                ...mfData,
                ...ceidgData,
            };
        } else if (mfData.krs) {
            // KROK 3: Jeśli brak w CEIDG, a mamy numer KRS z MF -> odpytaj KrsService
            console.log(`[EXTERNAL_DATA] Brak w CEIDG, ale znaleziono KRS: ${mfData.krs}. Pobieranie z KRS...`);
            const krsData = await this.krsService.fetchKrsData(mfData.krs);
            if (krsData) {
                finalData = {
                    ...mfData,
                    ...krsData,
                    bankAccountNumber: mfData.bankAccountNumber // Zachowaj konto z MF
                };
            }
        }

        // Jeśli nadal nie mamy danych z CEIDG/KRS, używamy tego co mamy z MF
        if (Object.keys(finalData).length === 0) {
            console.log('[EXTERNAL_DATA] Brak szczegółowych danych w CEIDG/KRS. Zwracam dane z MF.');
            finalData = { ...mfData };
        }

        // KROK 4: Zapewnienie priorytetu danych finansowych z Białej Listy i uzupełnienie brakujących pól
        const result: Partial<Client> = {
            ...finalData,
            nip: nip,
            type: 'FIRMA'
        };

        // WYMUSZENIE numeru konta z MF (obsługa tablicy i jawne przypisanie)
        const rawBankAccount = mfData.bankAccountNumber;
        const bankAccount = Array.isArray(rawBankAccount)
            ? rawBankAccount[0]
            : rawBankAccount;

        if (bankAccount) {
            result.bankAccountNumber = bankAccount;
            console.log(`[EXTERNAL_DATA] Przypisano numer konta: ${bankAccount}`);
        }

        // KROK 5: Implementacja Nazwy Skróconej
        if (!result.shortName && result.name) {
            result.shortName = result.name.split(' ')[0];
            console.log(`[EXTERNAL_DATA] Wygenerowano nazwę skróconą: ${result.shortName}`);
        }

        return result;
    }

    /**
     * Migruje istniejących klientów, nadając im numery wg aktualnego schematu NUMBERING.
     */
    async migrateExistingClients(): Promise<number> {
        console.log('[MIGRATION] Rozpoczynanie migracji numerów klientów...');
        const repo = this.dataSource.getRepository(Client);
        const clientsWithoutNumber = await repo.find({
            where: {
                clientNumber: null as any // TypeORM issue with null on some versions, but this is safe for now
            }
        });

        // Alternate way if clientNumber: IsNull() is needed
        // But for SQLite clientNumber: null often works or we check empty string

        let migratedCount = 0;
        for (const client of clientsWithoutNumber) {
            try {
                client.clientNumber = await this.numberingService.generateNextNumber('CLIENT');
                await repo.save(client);
                migratedCount++;
            } catch (error: any) {
                console.error(`[MIGRATION] Błąd podczas nadawania numeru dla klienta ${client.id}:`, error.message);
            }
        }

        console.log(`[MIGRATION] Zakończono migrację. Zaktualizowano ${migratedCount} klientów.`);
        return migratedCount;
    }
}

