import { describe, it, expect } from 'vitest';
import { KSeFCalculator } from './invoice.service';

describe('KSeFCalculator', () => {
    it('powinien poprawnie walidować sumę brutto w groszach', () => {
        expect(KSeFCalculator.validate(10000, 2300, 12300)).toBe(true);
        expect(KSeFCalculator.validate(10000, 2301, 12300)).toBe(false);
    });

    it('powinien poprawnie liczyć VAT i Brutto z Netto dla 23%', () => {
        const result = KSeFCalculator.calculateFromNet(10000, "23%");
        expect(result.vat).toBe(2300);
        expect(result.gross).toBe(12300);
    });

    it('powinien poprawnie liczyć VAT z zaokrągleniem w górę', () => {
        // 100 * 0.23 = 23.0 -> 23
        // 101 * 0.23 = 23.23 -> 23
        // 108 * 0.23 = 24.84 -> 24.84 (zaokrąglone do 0.01)
        const result = KSeFCalculator.calculateFromNet(108, "23%");
        expect(result.vat).toBe(24.84);
        expect(result.gross).toBe(132.84);
    });
});
