alter table customer_orders add column if not exists job_duration_minutes integer;
alter table customer_orders add column if not exists quote numeric; 