const assert = require('assert');
const { describe, it } = require('node:test');

const Calculator = require('../src/calculator');

describe('Calculator.main', () => {
    // === Input validation ===
    it('should throw error for invalid month1 < 1', () => {
        assert.throws(() => Calculator.main(0, 1, 2, 1, 2024), /invalid month1/);
    });

    it('should throw error for invalid month1 > 12', () => {
        assert.throws(() => Calculator.main(13, 1, 2, 1, 2024), /invalid month1/);
    });

    it('should throw error for invalid month2 < 1', () => {
        assert.throws(() => Calculator.main(1, 1, 0, 1, 2024), /invalid month2/);
    });

    it('should throw error for invalid month2 > 12', () => {
        assert.throws(() => Calculator.main(1, 1, 13, 1, 2024), /invalid month2/);
    });

    it('should throw error for invalid day1 < 1', () => {
        assert.throws(() => Calculator.main(1, 0, 2, 1, 2024), /invalid day1/);
    });

    it('should throw error for invalid day1 > 31', () => {
        assert.throws(() => Calculator.main(1, 32, 2, 1, 2024), /invalid day1/);
    });

    it('should throw error for invalid day2 < 1', () => {
        assert.throws(() => Calculator.main(1, 1, 2, 0, 2024), /invalid day2/);
    });

    it('should throw error for invalid day2 > 31', () => {
        assert.throws(() => Calculator.main(1, 1, 2, 32, 2024), /invalid day2/);
    });

    it('should throw error for invalid year < 1', () => {
        assert.throws(() => Calculator.main(1, 1, 2, 1, 0), /invalid year/);
    });

    it('should throw error for invalid year > 10000', () => {
        assert.throws(() => Calculator.main(1, 1, 2, 1, 10001), /invalid year/);
    });

    it('should throw error if month1 > month2', () => {
        assert.throws(() => Calculator.main(5, 10, 4, 20, 2024), /month1 must be less than month2/);
    });

    it('should throw error if same month and day1 > day2', () => {
        assert.throws(() => Calculator.main(5, 20, 5, 10, 2024), /day1 must be less than day2 if month1 is equal to month2/);
    });

    // === Normal computation ===
    it('should compute correct days for same month', () => {
        const days = Calculator.main(5, 10, 5, 20, 2024); // May 10 - May 20
        assert.strictEqual(days, 10);
    });

    it('should compute correct days for adjacent months (non-leap year)', () => {
        const days = Calculator.main(1, 31, 2, 5, 2023); // Jan 31 to Feb 5, 2023 (not leap year)
        assert.strictEqual(days, 5); // Jan 31 to Feb 5
    });

    it('should compute correct days across multiple months (non-leap year)', () => {
        const days = Calculator.main(1, 15, 3, 5, 2023);
        assert.strictEqual(days, 49); // 16 (Jan) + 28 (Feb) + 5 = 49
    });

    it('should compute correct days across multiple months (leap year)', () => {
        const days = Calculator.main(1, 15, 3, 5, 2024);
        assert.strictEqual(days, 50); // 16 (Jan) + 29 (Feb leap) + 5 = 50
    });

    it('should compute correct days for Feb in leap year', () => {
        const days = Calculator.main(2, 1, 2, 29, 2024);
        assert.strictEqual(days, 28);
    });

    it('should compute correct days for Feb in non-leap year', () => {
        const days = Calculator.main(2, 1, 2, 28, 2023);
        assert.strictEqual(days, 27);
    });

    it('should compute correct days across months with 30 and 31 days', () => {
        const days = Calculator.main(4, 25, 6, 5, 2023); // Apr 25 to Jun 5
        // (5 days in Apr) + 31 (May) + 5 (Jun)
        assert.strictEqual(days, 41);
    });
});
