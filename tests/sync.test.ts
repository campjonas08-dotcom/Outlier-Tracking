import { describe, expect, it } from 'vitest';
import { stageDelta } from '../shared/sync';
import type { Transaction } from '../shared/finance';

const pending: Transaction = { id: 'pending', date: '2026-11-01', description: 'Shop', category: 'Shopping', cents: -500, kind: 'expense', pending: true };
const posted: Transaction = { ...pending, id: 'posted', cents: -550, pending: false };
describe('incremental synchronization staging', () => {
  it('replaces a pending transaction with the posted transaction', () => {
    const result = stageDelta([pending], { added: [{ ...posted, pendingTransactionId: 'pending' }], modified: [], removed: [], nextCursor: 'next' });
    expect(result).toEqual({ transactions: [posted], cursor: 'next' });
  });
  it('is idempotent when the provider replays a page', () => {
    const delta = { added: [posted], modified: [], removed: [], nextCursor: 'next' };
    const first = stageDelta([], delta);
    expect(stageDelta(first.transactions, delta)).toEqual(first);
  });
  it('applies modifications and removals without mutating committed state', () => {
    const original = [pending, posted];
    const result = stageDelta(original, { added: [], modified: [{ ...posted, cents: -600 }], removed: ['pending'], nextCursor: 'v2' });
    expect(result.transactions).toEqual([{ ...posted, cents: -600 }]);
    expect(original).toEqual([pending, posted]);
  });
  it('can discard staged pages if a later fetch fails', () => {
    const committed = { transactions: [pending], cursor: 'old' };
    stageDelta(committed.transactions, { added: [posted], modified: [], removed: [], nextCursor: 'intermediate' });
    expect(committed).toEqual({ transactions: [pending], cursor: 'old' });
  });
});
