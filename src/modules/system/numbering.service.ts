import { DataSource, Repository } from "typeorm";
import { NumberingScheme } from "./domain/numbering-scheme.entity";
import { NumberingCounter } from "./domain/numbering-counter.entity";

export class NumberingService {
    private schemeRepo: Repository<NumberingScheme>;
    private counterRepo: Repository<NumberingCounter>;

    constructor(private dataSource: DataSource) {
        this.schemeRepo = this.dataSource.getRepository(NumberingScheme);
        this.counterRepo = this.dataSource.getRepository(NumberingCounter);
    }

    async getSchemes(target?: string) {
        if (target) {
            return await this.schemeRepo.find({ where: { target } });
        }
        return await this.schemeRepo.find();
    }

    async updateScheme(id: string, data: Partial<NumberingScheme>) {
        await this.schemeRepo.update(id, data);
        return await this.schemeRepo.findOne({ where: { id } });
    }

    async generateNextNumber(target: string): Promise<string> {
        const { scheme, counter } = await this.getSchemeAndCounter(target, true);
        return this.formatNumber(scheme, counter.lastValue);
    }

    async previewNextNumber(target: string): Promise<string> {
        const { scheme, counter } = await this.getSchemeAndCounter(target, false);
        return this.formatNumber(scheme, counter.lastValue + 1);
    }

    /**
     * Fizycznie inkrementuje licznik w bazie danych bez generowania numeru.
     * Używane po pomyślnym zapisie dokumentu, którego numer pochodzi z podglądu (previewNextNumber).
     */
    async consumeNumber(target: string): Promise<void> {
        await this.getSchemeAndCounter(target, true);
    }

    private async getSchemeAndCounter(target: string, increment: boolean): Promise<{ scheme: NumberingScheme, counter: NumberingCounter }> {
        const scheme = await this.schemeRepo.findOne({
            where: { target, isDefault: true }
        });

        if (!scheme) {
            throw new Error(`No default numbering scheme found for target: ${target}`);
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const isMonthly = scheme.mask.includes('[MM]');

        let counter = await this.counterRepo.findOne({
            where: {
                schemeId: scheme.id,
                year: currentYear,
                ...(isMonthly ? { month: currentMonth } : {})
            }
        });

        if (!counter) {
            counter = this.counterRepo.create({
                schemeId: scheme.id,
                year: currentYear,
                month: isMonthly ? currentMonth : undefined,
                lastValue: 0
            });
        }

        if (increment) {
            counter.lastValue += 1;
            await this.counterRepo.save(counter);
        }

        return { scheme, counter };
    }

    private formatNumber(scheme: NumberingScheme, value: number): string {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        let result = scheme.mask;
        result = result.replace('[PREFIX]', scheme.prefix || '');
        result = result.replace('[YYYY]', currentYear.toString());
        result = result.replace('[MM]', currentMonth.toString().padStart(2, '0'));

        const nrRegex = /\[NR(?::(\d+))?\]/;
        const match = result.match(nrRegex);

        if (match) {
            const padding = match[1] ? parseInt(match[1]) : 3;
            const nrString = value.toString().padStart(padding, '0');
            result = result.replace(nrRegex, nrString);
        }

        return result;
    }

    async seedInitialSchemes() {
        const count = await this.schemeRepo.count();
        if (count === 0) {
            await this.schemeRepo.save([
                { target: 'CLIENT', prefix: 'KLI', mask: '[PREFIX]/[YYYY]/[NR:4]', isDefault: true },
                { target: 'INVOICE', prefix: 'FV', mask: '[PREFIX]/[YYYY]/[MM]/[NR]', isDefault: true }
            ]);
        }
    }
}
