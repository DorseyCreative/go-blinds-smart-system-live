CREATE TABLE system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE system_settings IS 'A simple key-value store for global application settings.';
COMMENT ON COLUMN system_settings.key IS 'The unique key for the setting (e.g., google_refresh_token).';
COMMENT ON COLUMN system_settings.value IS 'The value for the setting.'; 