import type { Transaction } from './finance.js';

export interface TransactionDelta {
  added: (Transaction & { pendingTransactionId?: string })[];
  modified: Transaction[];
  removed: string[];
  nextCursor: string;
}

/** Pure staging operation. Persist records AND cursor in one transaction after ALL pages succeed. */
export function stageDelta(existing: Transaction[], delta: TransactionDelta) {
  const records = new Map(existing.map(t => [t.id, t]));
  for (const id of delta.removed) records.delete(id);
  for (const item of delta.added) {
    const { pendingTransactionId, ...record } = item;
    if (pendingTransactionId) records.delete(pendingTransactionId);
    records.set(record.id, record);
  }
  for (const item of delta.modified) records.set(item.id, item);
  return { transactions: [...records.values()], cursor: delta.nextCursor };
}
