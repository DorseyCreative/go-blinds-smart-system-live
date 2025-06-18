ALTER TABLE customer_orders
ADD COLUMN google_calendar_event_id TEXT,
ADD COLUMN scheduled_start_time TIMESTAMPTZ,
ADD COLUMN scheduled_end_time TIMESTAMPTZ; 