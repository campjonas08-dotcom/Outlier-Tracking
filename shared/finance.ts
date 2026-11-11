/** USD integer cents throughout. Reporting dates are YYYY-MM-DD in the source's reporting zone. */
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  /** Signed cash movement: positive inflow, negative outflow. */
  cents: number;
  kind: 'income' | 'expense' | 'refund' | 'transfer';
  pending: boolean;
}

export interface Earning {
  id: string;
  date: string;
  cents: number;
  /** Portion reconciled to received bank deposits; not merely marked paid by the provider. */
  reconciledCents: number;
}

export interface DashboardData {
  mode: 'demo';
  asOf: string;
  availableCents: number | null;
  currentCents: number;
  transactions: Transaction[];
  earnings: Earning[];
}

export function sumCents(values: number[]): number {
  let total = 0;
  for (const value of values) {
    if (!Number.isSafeInteger(value) || !Number.isSafeInteger(total + value)) {
      throw new Error('Amounts must remain safe integer cents');
    }
    total += value;
  }
  return total;
}

export function summarize(data: DashboardData, start: string, end: string) {
  const inside = (date: string) => date >= start && date <= end;
  const posted = data.transactions.filter(t => !t.pending && inside(t.date));
  const earnedCents = sumCents(data.earnings.filter(e => inside(e.date)).map(e => e.cents));
  const depositedCents = sumCents(posted.filter(t => t.kind === 'income').map(t => t.cents));
  const expenseCents = -sumCents(posted.filter(t => t.kind === 'expense' || t.kind === 'refund').map(t => t.cents));
  // Outstanding is an all-time stock as of the snapshot, independent of the selected flow period.
  const awaitingCents = sumCents(data.earnings.filter(e => e.date <= data.asOf).map(e => e.cents - e.reconciledCents));
  return {
    earnedCents, depositedCents, expenseCents, awaitingCents,
    netCents: sumCents([depositedCents, -expenseCents]),
    surplusCents: sumCents([earnedCents, -expenseCents]),
    projectedCents: data.availableCents === null ? null : sumCents([data.availableCents, awaitingCents]),
  };
}

export function money(cents: number | null): string {
  return cents === null ? 'Unavailable' : new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
  }).format(cents / 100);
}
