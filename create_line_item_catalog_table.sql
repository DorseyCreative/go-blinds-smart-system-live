CREATE TABLE IF NOT EXISTS line_item_catalog (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category TEXT,
  active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON COLUMN line_item_catalog.code IS 'Unique code for the line item (e.g., BDC-measurement)';
COMMENT ON COLUMN line_item_catalog.description IS 'Human-readable description of the line item';
COMMENT ON COLUMN line_item_catalog.price IS 'Price for this line item';
COMMENT ON COLUMN line_item_catalog.duration_minutes IS 'Estimated duration in minutes';
COMMENT ON COLUMN line_item_catalog.category IS 'Category for grouping (e.g., Install, Repair)';
COMMENT ON COLUMN line_item_catalog.active IS 'Whether this line item is active/available';
COMMENT ON COLUMN line_item_catalog.created_at IS 'Creation timestamp';
COMMENT ON COLUMN line_item_catalog.updated_at IS 'Last update timestamp'; 