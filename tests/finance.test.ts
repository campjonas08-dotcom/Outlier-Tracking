import { describe, expect, it } from 'vitest';
import { money, sumCents, summarize, type DashboardData } from '../shared/finance';
import { demo } from '../server/demo';

describe('USD accounting', () => {
  it('separates earned income from deposits, preventing payout double counting', () => {
    const result = summarize(demo, '2026-11-01', '2026-11-10');
    expect(result.earnedCents).toBe(249500);
    expect(result.depositedCents).toBe(212000);
    expect(result.awaitingCents).toBe(109500);
  });
  it('nets refunds and excludes transfers and pending expenses', () => {
    const result = summarize(demo, '2026-11-01', '2026-11-10');
    expect(result.expenseCents).toBe(148552);
    expect(result.netCents).toBe(63448);
    expect(result.surplusCents).toBe(100948);
    expect(result.projectedCents).toBe(538150);
  });
  it('uses inclusive reporting boundaries without resetting outstanding earnings', () => {
    const result = summarize(demo, '2026-11-10', '2026-11-10');
    expect(result.earnedCents).toBe(42000);
    expect(result.expenseCents).toBe(9292);
    expect(result.awaitingCents).toBe(109500);
  });
  it('does not substitute current balance when available balance is missing', () => {
    expect(summarize({ ...demo, availableCents: null }, '2026-11-01', demo.asOf).projectedCents).toBeNull();
    expect(money(null)).toBe('Unavailable');
  });
  it('handles earnings reversals and reconciled adjustments without clamping', () => {
    const data: DashboardData = { ...demo, earnings: [
      { id: 'a', date: '2026-11-01', cents: 10000, reconciledCents: 4000 },
      { id: 'b', date: '2026-11-02', cents: -2000, reconciledCents: 0 },
    ] };
    expect(summarize(data, '2026-11-01', data.asOf).awaitingCents).toBe(4000);
    expect(summarize(data, '2026-11-01', data.asOf).earnedCents).toBe(8000);
  });
  it('handles deposit reversals as negative deposited income', () => {
    const data: DashboardData = { ...demo, transactions: [
      { id: 'reversal', date: demo.asOf, description: 'Reversal', category: 'Income', cents: -1000, kind: 'income', pending: false },
    ] };
    expect(summarize(data, demo.asOf, demo.asOf).netCents).toBe(-1000);
  });
  it('does not include future earnings in outstanding balance', () => {
    const data = { ...demo, earnings: [...demo.earnings, { id: 'future', date: '2026-12-01', cents: 500, reconciledCents: 0 }] };
    expect(summarize(data, '2026-11-01', demo.asOf).awaitingCents).toBe(109500);
  });
  it('rejects fractional cents and unsafe integer arithmetic', () => {
    expect(() => sumCents([0.1])).toThrow();
    expect(() => sumCents([Number.MAX_SAFE_INTEGER, 1])).toThrow();
    expect(sumCents([10, 20, -5])).toBe(25);
  });
});
