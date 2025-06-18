import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testUnknownLineItemWebhook() {
  const payload = {
    entry_date: '2025-06-18',
    customer_name: 'Test User',
    work_order_number: 'TEST-ORDER-001',
    labor_to_do: 'Qty: 2.00 - BDC-unknownitem\nQty: 1.00 - BDC-measurement'
  };

  console.log('--- Sending test payload to /api/smartsheet-webhook ---');
  console.log(JSON.stringify(payload, null, 2));

  // 1. POST to the webhook
  const res = await fetch('http://localhost:3000/api/smartsheet-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  console.log('Webhook response:', json);

  // 2. Query system_alerts for the latest unknown_line_item
  const { data: alerts, error } = await supabase
    .from('system_alerts')
    .select('*')
    .eq('type', 'unknown_line_item')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Supabase query error:', error);
    process.exit(1);
  } else if (alerts && alerts.length > 0) {
    console.log('Latest system_alert:', alerts[0]);
    process.exit(0);
  } else {
    console.error('No system_alerts found for unknown_line_item.');
    process.exit(1);
  }
}

if (require.main === module) {
  testUnknownLineItemWebhook().catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
  });
} 