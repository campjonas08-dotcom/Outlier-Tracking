import type { DashboardData } from '../shared/finance.js';

/** Entirely fictional snapshot. Never replace this fixture with personal financial records. */
export const demo: DashboardData = {
  mode: 'demo', asOf: '2026-11-10', availableCents: 428650, currentCents: 433450,
  earnings: [
    { id: 'e0', date: '2026-10-28', cents: 72000, reconciledCents: 72000 },
    { id: 'e1', date: '2026-11-02', cents: 84000, reconciledCents: 84000 },
    { id: 'e2', date: '2026-11-05', cents: 56000, reconciledCents: 56000 },
    { id: 'e3', date: '2026-11-08', cents: 67500, reconciledCents: 0 },
    { id: 'e4', date: '2026-11-10', cents: 42000, reconciledCents: 0 },
  ],
  transactions: [
    { id: 't1', date: '2026-11-10', description: 'Neighborhood market', category: 'Groceries', cents: -8642, kind: 'expense', pending: false },
    { id: 't2', date: '2026-11-10', description: 'Corner coffee', category: 'Food & drink', cents: -650, kind: 'expense', pending: false },
    { id: 't3', date: '2026-11-09', description: 'Outlier payout · sample', category: 'Income', cents: 140000, kind: 'income', pending: false },
    { id: 't4', date: '2026-11-09', description: 'Fuel stop', category: 'Transport', cents: -4800, kind: 'expense', pending: true },
    { id: 't5', date: '2026-11-08', description: 'Internet service', category: 'Bills & utilities', cents: -7500, kind: 'expense', pending: false },
    { id: 't6', date: '2026-11-07', description: 'Home essentials', category: 'Shopping', cents: -12900, kind: 'expense', pending: false },
    { id: 't7', date: '2026-11-06', description: 'Purchase refund', category: 'Shopping', cents: 2400, kind: 'refund', pending: false },
    { id: 't8', date: '2026-11-05', description: 'Rent', category: 'Housing', cents: -110000, kind: 'expense', pending: false },
    { id: 't9', date: '2026-11-04', description: 'Savings transfer', category: 'Transfer', cents: -20000, kind: 'transfer', pending: false },
    { id: 't10', date: '2026-11-03', description: 'Weekly groceries', category: 'Groceries', cents: -11260, kind: 'expense', pending: false },
    { id: 't11', date: '2026-11-01', description: 'Outlier payout · sample', category: 'Income', cents: 72000, kind: 'income', pending: false },
  ],
};
