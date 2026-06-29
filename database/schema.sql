CREATE TABLE IF NOT EXISTS sap_world_state (
  store_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  revision BIGINT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sap_world_state_updated_at_idx
  ON sap_world_state (updated_at DESC);

COMMENT ON TABLE sap_world_state IS
  'Versioned durable state for SAP World repository aggregates.';
COMMENT ON COLUMN sap_world_state.store_key IS
  'Stable repository aggregate key such as auth, progress, or simulation execution.';
COMMENT ON COLUMN sap_world_state.payload IS
  'Typed application aggregate serialized as JSONB.';
COMMENT ON COLUMN sap_world_state.revision IS
  'Revision incremented by transaction-locked writes to prevent lost concurrent updates.';

CREATE TABLE IF NOT EXISTS sap_world_simulation_ledgers (
  simulation_signature TEXT PRIMARY KEY,
  simulation_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  persisted_at TIMESTAMPTZ NOT NULL,
  document_count INTEGER NOT NULL,
  process_chain_count INTEGER NOT NULL,
  transaction_value NUMERIC(20, 2) NOT NULL,
  exception_count INTEGER NOT NULL,
  ledger JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sap_world_ledger_documents (
  simulation_signature TEXT NOT NULL REFERENCES sap_world_simulation_ledgers(simulation_signature) ON DELETE CASCADE,
  document_id TEXT NOT NULL,
  document_number TEXT NOT NULL,
  chain_id TEXT NOT NULL,
  fiscal_year TEXT NOT NULL,
  posting_date DATE NOT NULL,
  process TEXT NOT NULL,
  module TEXT NOT NULL,
  document_type TEXT NOT NULL,
  amount NUMERIC(20, 2) NOT NULL,
  currency TEXT NOT NULL,
  has_exception BOOLEAN NOT NULL,
  payload JSONB NOT NULL,
  PRIMARY KEY (simulation_signature, document_id)
);

CREATE INDEX IF NOT EXISTS sap_world_ledger_documents_process_idx
  ON sap_world_ledger_documents (process, fiscal_year, posting_date DESC);
CREATE INDEX IF NOT EXISTS sap_world_ledger_documents_chain_idx
  ON sap_world_ledger_documents (simulation_signature, chain_id);
CREATE INDEX IF NOT EXISTS sap_world_ledger_documents_exception_idx
  ON sap_world_ledger_documents (has_exception, posting_date DESC)
  WHERE has_exception = TRUE;

CREATE TABLE IF NOT EXISTS sap_world_ledger_analytics_snapshots (
  scope_key TEXT PRIMARY KEY,
  scope_type TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  refreshed_at TIMESTAMPTZ NOT NULL,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sap_world_ledger_analytics_refreshed_idx
  ON sap_world_ledger_analytics_snapshots (refreshed_at DESC);

COMMENT ON TABLE sap_world_simulation_ledgers IS
  'Simulation-level ledger summaries and immutable generated ledger payloads.';
COMMENT ON TABLE sap_world_ledger_documents IS
  'Queryable normalized SAP documents for high-volume operational analytics.';
COMMENT ON TABLE sap_world_ledger_analytics_snapshots IS
  'Fingerprint-bound learner and platform analytical read models.';
