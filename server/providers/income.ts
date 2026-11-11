import type { Earning } from '../../shared/finance.js';

export interface IncomeSnapshot {
  earnings: Earning[];
  asOf: string;
  unpaidEarningsSupported: boolean;
  limitations: string[];
}

/** Providers must use documented, explicitly authorized access only. */
export interface IncomeProvider {
  readonly id: string;
  fetchEarnings(): Promise<IncomeSnapshot>;
}

export class OutlierProvider implements IncomeProvider {
  readonly id = 'outlier';
  async fetchEarnings(): Promise<IncomeSnapshot> {
    throw new Error('Outlier access is not configured: no authorized earnings integration has been verified.');
  }
}
