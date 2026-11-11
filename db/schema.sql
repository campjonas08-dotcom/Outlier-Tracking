-- Proposed SQLite schema. Not loaded by the demo runtime.
-- Amounts are signed USD integer cents; timestamps are UTC ISO-8601 strings.
-- Enable foreign keys on EVERY connection. Migrations, authorization and storage remain future work.
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  auth_subject TEXT NOT NULL UNIQUE,
  reporting_timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  created_at TEXT NOT NULL
);
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  source_id TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK(currency = 'USD'),
  available_cents INTEGER,
  current_cents INTEGER,
  source_timestamp TEXT NOT NULL,
  sync_status TEXT NOT NULL,
  UNIQUE(user_id, provider, source_id),
  UNIQUE(id, user_id)
);
CREATE TABLE income_sources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  source_id TEXT NOT NULL,
  unpaid_supported INTEGER NOT NULL DEFAULT 0 CHECK(unpaid_supported IN (0,1)),
  source_timestamp TEXT NOT NULL,
  sync_status TEXT NOT NULL,
  UNIQUE(user_id, provider, source_id),
  UNIQUE(id, user_id)
);
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(user_id, name),
  UNIQUE(id, user_id)
);
CREATE TABLE bank_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  source_id TEXT NOT NULL,
  pending_source_id TEXT,
  category_id TEXT,
  description TEXT NOT NULL,
  cents INTEGER NOT NULL CHECK(typeof(cents) = 'integer'),
  reporting_date TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('income','expense','refund','transfer')),
  pending INTEGER NOT NULL CHECK(pending IN (0,1)),
  source_timestamp TEXT NOT NULL,
  sync_status TEXT NOT NULL,
  removed_at TEXT,
  UNIQUE(user_id, provider, source_id),
  UNIQUE(id, user_id),
  FOREIGN KEY(account_id, user_id) REFERENCES accounts(id, user_id) ON DELETE CASCADE,
  FOREIGN KEY(category_id, user_id) REFERENCES categories(id, user_id)
);
CREATE TABLE earnings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  income_source_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  reporting_date TEXT NOT NULL,
  cents INTEGER NOT NULL CHECK(typeof(cents) = 'integer'),
  source_timestamp TEXT NOT NULL,
  sync_status TEXT NOT NULL,
  UNIQUE(income_source_id, source_id),
  UNIQUE(id, user_id),
  FOREIGN KEY(income_source_id, user_id) REFERENCES income_sources(id, user_id) ON DELETE CASCADE
);
CREATE TABLE payouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  income_source_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  cents INTEGER NOT NULL CHECK(typeof(cents) = 'integer'),
  paid_at TEXT,
  source_timestamp TEXT NOT NULL,
  sync_status TEXT NOT NULL,
  UNIQUE(income_source_id, source_id),
  UNIQUE(id, user_id),
  FOREIGN KEY(income_source_id, user_id) REFERENCES income_sources(id, user_id) ON DELETE CASCADE
);
-- Allocations connect an earning through a payout to an actual bank deposit.
-- Application transactions must validate allocation totals and support reversals/audit history.
CREATE TABLE payout_matches (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payout_id TEXT NOT NULL,
  earning_id TEXT NOT NULL,
  bank_transaction_id TEXT NOT NULL,
  allocated_cents INTEGER NOT NULL CHECK(typeof(allocated_cents) = 'integer'),
  created_at TEXT NOT NULL,
  UNIQUE(payout_id, earning_id, bank_transaction_id),
  FOREIGN KEY(payout_id, user_id) REFERENCES payouts(id, user_id) ON DELETE CASCADE,
  FOREIGN KEY(earning_id, user_id) REFERENCES earnings(id, user_id) ON DELETE CASCADE,
  FOREIGN KEY(bank_transaction_id, user_id) REFERENCES bank_transactions(id, user_id) ON DELETE CASCADE
);
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL,
  month TEXT NOT NULL,
  limit_cents INTEGER NOT NULL CHECK(typeof(limit_cents) = 'integer' AND limit_cents >= 0),
  UNIQUE(user_id, category_id, month),
  FOREIGN KEY(category_id, user_id) REFERENCES categories(id, user_id) ON DELETE CASCADE
);
CREATE TABLE sync_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL,
  error_code TEXT -- sanitized codes only; no provider responses or financial payloads
);
CREATE TABLE sync_cursors (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  item_id TEXT NOT NULL,
  cursor TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY(user_id, provider, item_id)
);
-- Future provider-token storage requires an independently protected encryption key.
-- No token storage is implemented here. Never put plaintext tokens in account rows.
