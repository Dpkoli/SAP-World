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
