import { describe, it, expect } from 'vitest';
import { parseLapTimeToMs, formatMsToLapTime } from './lapTime';

describe('Lap Time Parser & Formatter', () => {

  describe('parseLapTimeToMs', () => {
    it('should correctly parse M:SS.mmm format', () => {
      expect(parseLapTimeToMs("1:32.554")).toBe(92554);
      expect(parseLapTimeToMs("0:32.554")).toBe(32554);
      expect(parseLapTimeToMs("10:00.000")).toBe(600000);
    });

    it('should handle leading zeros', () => {
      expect(parseLapTimeToMs("01:32.554")).toBe(92554);
      expect(parseLapTimeToMs("00:00.000")).toBe(0);
    });

    it('should correctly parse SS.mmm format', () => {
      expect(parseLapTimeToMs("92.554")).toBe(92554);
      expect(parseLapTimeToMs("0.123")).toBe(123);
    });

    it('should trim whitespace', () => {
      expect(parseLapTimeToMs("  1:32.554  ")).toBe(92554);
      expect(parseLapTimeToMs("\t1:32.554\n")).toBe(92554);
    });

    it('should throw error for invalid formats', () => {
      expect(() => parseLapTimeToMs("")).toThrow();
      expect(() => parseLapTimeToMs("foo")).toThrow();
      expect(() => parseLapTimeToMs("1:32")).toThrow(/3 decimal places/); // Missing ms
      expect(() => parseLapTimeToMs("1:32.5")).toThrow(/3 decimal places/);
    });

    it('should throw error for invalid seconds range', () => {
      expect(() => parseLapTimeToMs("1:60.000")).toThrow(/Seconds must be less than 60/);
    });

    it('should throw error for negative values', () => {
      expect(() => parseLapTimeToMs("-1:32.554")).toThrow();
    });
  });

  describe('formatMsToLapTime', () => {
    it('should format correctly', () => {
      expect(formatMsToLapTime(92554)).toBe("1:32.554");
      expect(formatMsToLapTime(32554)).toBe("0:32.554");
      expect(formatMsToLapTime(600000)).toBe("10:00.000");
    });

    it('should format zero correctly', () => {
      expect(formatMsToLapTime(0)).toBe("0:00.000");
    });

    it('should handle small millisecond values', () => {
      expect(formatMsToLapTime(1)).toBe("0:00.001");
      expect(formatMsToLapTime(50)).toBe("0:00.050");
    });
  });

});
