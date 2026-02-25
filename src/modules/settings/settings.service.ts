import { DataSource } from "typeorm"
import { CompanyProfile } from "../../database/entities/company-profile.entity"

export class SettingsService {
    constructor(private dataSource: DataSource) { }

    async getCompanyProfile(): Promise<CompanyProfile> {
        return await this.ensureCompanyProfileExists();
    }

    async ensureCompanyProfileExists(): Promise<CompanyProfile> {
        const repo = this.dataSource.getRepository(CompanyProfile);

        // BEZWZGLĘDNE czyszczenie starych profili (nie-singletonów)
        await repo.createQueryBuilder()
            .delete()
            .where("id != :id", { id: "1" })
            .execute();

        let profile = await repo.findOne({ where: { id: "1" } });

        if (!profile) {
            profile = new CompanyProfile();
            profile.id = "1";
            profile.name = "Moja Firma"; // Default placeholder
            profile = await repo.save(profile);
        }

        return profile;
    }

    async updateCompanyProfile(dto: Partial<CompanyProfile>): Promise<CompanyProfile> {
        const repo = this.dataSource.getRepository(CompanyProfile);
        let profile = await repo.findOne({ where: { id: "1" } });

        if (!profile) {
            profile = new CompanyProfile();
            profile.id = "1";
        }

        // Nadpisujemy pola
        if (dto.name !== undefined) profile.name = dto.name;
        if (dto.nip !== undefined) profile.nip = dto.nip;
        if (dto.address !== undefined) profile.address = dto.address;
        if (dto.postalCode !== undefined) profile.postalCode = dto.postalCode;
        if (dto.city !== undefined) profile.city = dto.city;
        if (dto.bankAccountNumber !== undefined) profile.bankAccountNumber = dto.bankAccountNumber;
        if (dto.email !== undefined) profile.email = dto.email;
        if (dto.phone !== undefined) profile.phone = dto.phone;

        return await repo.save(profile);
    }
}
