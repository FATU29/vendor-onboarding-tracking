import { describe, expect, it } from '@jest/globals';
import { isVendorStuck } from '../src/common/vendor-workflow';

describe('isVendorStuck', () => {
  const now = new Date('2026-08-10T12:00:00Z');

  it('uses the supplied database threshold and marks only after full days', () => {
    expect(isVendorStuck(new Date('2026-08-03T11:59:59Z'), 7, now)).toBe(true);
    expect(isVendorStuck(new Date('2026-08-03T12:00:00Z'), 7, now)).toBe(false);
    expect(isVendorStuck(new Date('2026-08-03T11:59:59Z'), 10, now)).toBe(false);
  });
});
