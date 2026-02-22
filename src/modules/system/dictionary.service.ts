import { DataSource, Repository } from "typeorm"
import { Dictionary } from "./domain/dictionary.entity"

export class DictionaryService {
    private repo: Repository<Dictionary>;

    constructor(private dataSource: DataSource) {
        this.repo = this.dataSource.getRepository(Dictionary);
    }

    async seedDefaults(): Promise<void> {
        const count = await this.repo.count();
        if (count > 0) {
            console.log("Dictionaries already seeded.");
            return;
        }

        console.log("Seeding default dictionaries...");

        const defaults = [
            // Jednostki Miary (UNIT)
            { category: 'UNIT', code: 'SZT', value: 'szt.', isSystem: true },
            { category: 'UNIT', code: 'M2', value: 'm2', isSystem: true },
            { category: 'UNIT', code: 'MB', value: 'mb', isSystem: true },
            { category: 'UNIT', code: 'L', value: 'litr', isSystem: true },
            { category: 'UNIT', code: 'KG', value: 'kg', isSystem: true },
            { category: 'UNIT', code: 'RBH', value: 'rbh', isSystem: true },

            // Kategorie Asortymentu (MATERIAL_CATEGORY)
            { category: 'MATERIAL_CATEGORY', code: 'PLANT', value: 'Rośliny', isSystem: true },
            { category: 'MATERIAL_CATEGORY', code: 'FERTILIZER', value: 'Nawozy i Środki Ochrony', isSystem: true },
            { category: 'MATERIAL_CATEGORY', code: 'SOIL', value: 'Kruszywa i Ziemia', isSystem: true },
            { category: 'MATERIAL_CATEGORY', code: 'ARCHITECTURE', value: 'Elementy Architektury', isSystem: true },
            { category: 'MATERIAL_CATEGORY', code: 'TOOL', value: 'Narzędzia', isSystem: true },
            { category: 'MATERIAL_CATEGORY', code: 'SERVICE', value: 'Usługi', isSystem: true },

            // Typy Usług (SERVICE_TYPE)
            { category: 'SERVICE_TYPE', code: 'DESIGN', value: 'Projektowanie', isSystem: true },
            { category: 'SERVICE_TYPE', code: 'EARTHWORK', value: 'Prace Ziemne', isSystem: true },
            { category: 'SERVICE_TYPE', code: 'PLANTING', value: 'Nasadzenia', isSystem: true },
            { category: 'SERVICE_TYPE', code: 'MAINTENANCE', value: 'Pielęgnacja', isSystem: true },
            { category: 'SERVICE_TYPE', code: 'IRRIGATION', value: 'Systemy Nawadniające', isSystem: true },

            // Stawki VAT (TAX_RATE)
            { category: 'TAX_RATE', code: '23', value: '23%', isSystem: true },
            { category: 'TAX_RATE', code: '8', value: '8%', isSystem: true },
            { category: 'TAX_RATE', code: '0', value: '0%', isSystem: true },
            { category: 'TAX_RATE', code: 'ZW', value: 'ZW', isSystem: true },
        ];

        for (const item of defaults) {
            const entry = new Dictionary();
            entry.category = item.category;
            entry.code = item.code;
            entry.value = item.value;
            entry.isSystem = item.isSystem;
            await this.repo.save(entry);
        }
        console.log("Default dictionaries seeded successfully.");
    }

    async getDictionaries(): Promise<{ [category: string]: Dictionary[] }> {
        const all = await this.repo.find({
            order: { category: 'ASC', value: 'ASC' }
        });

        // Group by category
        const grouped: { [category: string]: Dictionary[] } = {};
        for (const item of all) {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        }
        return grouped;
    }

    async addDictionary(category: string, value: string, code?: string): Promise<Dictionary> {
        const entry = new Dictionary();
        entry.category = category;
        entry.value = value;
        entry.code = code || value.toUpperCase().replace(/\s+/g, '_');
        entry.isSystem = false;

        return await this.repo.save(entry);
    }

    async updateDictionary(id: string, value: string, code?: string): Promise<Dictionary> {
        const entry = await this.repo.findOneBy({ id });
        if (!entry) throw new Error("Słownik nie został znaleziony.");
        if (entry.isSystem) throw new Error("Nie można edytować wartości systemowych.");

        entry.value = value;
        if (code !== undefined) {
            entry.code = code;
        }
        return await this.repo.save(entry);
    }

    async deleteDictionary(id: string): Promise<void> {
        const entry = await this.repo.findOneBy({ id });
        if (!entry) throw new Error("Słownik nie został znaleziony.");
        if (entry.isSystem) throw new Error("Nie można usunąć wartości systemowej.");

        await this.repo.remove(entry);
    }
}
