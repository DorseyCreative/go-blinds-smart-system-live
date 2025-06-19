import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import credentials from '../../../lib/google-credentials.json';
import { parseLineItems } from '../../../lib/parseLineItems';
import { calculateJob } from '../../../lib/jobCalculations';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper function to parse dates, assuming MM/DD/YY format
const parseDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts.map(p => parseInt(p, 10));
    // Handles '25' -> 2025
    const fullYear = year < 100 ? 2000 + year : year;
    // Format to YYYY-MM-DD
    return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null; // Return null if format is unexpected
};

// This function aggregates the raw rows from the sheet into a structured format
async function aggregateAndUpsert(rows: any[][], header: string[]) {
  const aggregatedData: { [key: string]: any } = {};

  // This maps Google Sheet headers to your database columns.
  // It's the new "source of truth" for what data to pull.
  const columnMap: { [key: string]: string } = {
    'Customer Name': 'customer_name',
    'Work Order Number': 'work_order_number',
    'PO Number': 'po_number',
    'Phone 1': 'phone_1',
    'Phone 2': 'phone_2',
    'Phone 3': 'phone_3',
    'Email': 'email',
    'Address': 'address',
    'Apt / Unit Number': 'apt_unit_number',
    'City': 'city',
    'State': 'state',
    'Zip Code': 'zip_code',
    'Store Number': 'store_number',
    'Job Type': 'job_type',
    'Instructions': 'instructions',
    'Materials': 'materials',
    'Time Window': 'time_window',
    'Last Note Made': 'last_note_made',
    'Latest Comment': 'latest_comment',
    'Entry Date': 'entry_date',
    'Date order sent to installer': 'date_order_sent_to_installer',
    'Material Arrival Date': 'material_arrival_date',
    'Schedule Date': 'schedule_date',
    'Labor To Do': 'labor_to_do',
    'Installer': 'installer',
    'Status': 'status',
    'Date of Status Change': 'date_of_status_change',
    'Chargeback': 'chargeback',
    'Chargeback Amount': 'chargeback_amount',
    'Invoice Number': 'invoice_number',
    'Billed Date': 'billed_date',
    'Payment Date': 'payment_date',
    'Payment Amount': 'payment_amount',
    'Check Number': 'check_number',
    'Notes': 'notes'
  };

  // Step 1: Aggregate data by Work Order Number
  for (const row of rows) {
    const rowData: { [key: string]: any } = {};
    header.forEach((headerVal, index) => {
      rowData[headerVal] = row[index] || null; // Use null for empty cells
    });

    const workOrderNumber = rowData['Work Order Number'];

    if (!workOrderNumber) {
      continue;
    }

    if (!aggregatedData[workOrderNumber]) {
      // Create a clean object with only the columns that exist in the database
      const newOrder: { [key: string]: any } = {};
      
      // Dynamically handle date columns
      const dateColumns = [
        'entry_date', 
        'date_order_sent_to_installer', 
        'material_arrival_date', 
        'schedule_date', 
        'date_of_status_change', 
        'billed_date', 
        'payment_date'
      ];

      for (const sheetHeader in columnMap) {
        const dbCol = columnMap[sheetHeader];
        const sheetValue = rowData[sheetHeader] || null;

        if (dateColumns.includes(dbCol)) {
          if (sheetValue && typeof sheetValue === 'string' && /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(sheetValue)) {
            const parts = sheetValue.split('/');
            // Assuming MM/DD/YY format
            newOrder[dbCol] = `20${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
          } else {
            newOrder[dbCol] = null; // Set to null if format is invalid or value is missing
          }
        } else {
          newOrder[dbCol] = sheetValue;
        }
      }

      newOrder.labor_to_do_items = []; // This is a temporary field for aggregation
      aggregatedData[workOrderNumber] = newOrder;
    }

    // Add the "Labor To Do" item to our array for this WO#
    const laborItem = rowData['Labor To Do'];
    if (laborItem && typeof laborItem === 'string' && laborItem.trim() !== '') {
      aggregatedData[workOrderNumber].labor_to_do_items.push(laborItem);
    }
  }

  let processedCount = 0;

  // Step 2: Calculate derivative fields and upsert to Supabase
  for (const workOrderNumber in aggregatedData) {
    const order = aggregatedData[workOrderNumber];
    
    // Join the labor items into a single, formatted string
    if (order.labor_to_do_items) {
      order.labor_to_do = order.labor_to_do_items.join('\n');
      delete order.labor_to_do_items; // Clean up temp field
    }
    
    // --- START IN-FLIGHT VERIFICATION ---
    const { data: existingOrder, error: fetchError } = await supabase
      .from('customer_orders')
      .select('*')
      .eq('work_order_number', workOrderNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "no rows found"
      console.error(`Error fetching WO#${workOrderNumber} for verification`, fetchError);
    }

    if (existingOrder) {
      console.log(`--- Verifying WO# ${workOrderNumber} ---`);
      for (const key in order) {
        if (Object.prototype.hasOwnProperty.call(order, key) && key !== 'line_items') {
          const sheetVal = order[key] || null;
          const dbVal = existingOrder[key] || null;
          if (String(sheetVal) !== String(dbVal)) {
            console.log(`  - Mismatch on '${key}': Sheet val is "${sheetVal}", DB val is "${dbVal}"`);
          }
        }
      }
      console.log(`--- End Verification for WO# ${workOrderNumber} ---`);
    }
    // --- END IN-FLIGHT VERIFICATION ---

    // --- Revert to original, working calculation logic ---
    order.line_items = parseLineItems(order.labor_to_do || '');
    const { durationMinutes, quote } = await calculateJob(order.line_items);
    order.duration_minutes = durationMinutes;
    order.quote = quote;
    
    const { error } = await supabase
      .from('customer_orders')
      .upsert(order, { onConflict: 'work_order_number' });

    if (error) {
      console.error('Supabase upsert error for WO#', workOrderNumber, ':', error.message);
    } else {
      processedCount++;
    }
  }

  return { processedCount };
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'Ezra Dorsey',
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ message: 'No data found in sheet.' });
    }

    const header = rows.shift(); 
    if (!header) {
      return res.status(200).json({ message: 'Sheet is empty or missing a header row.' });
    }
    
    // Use the new processing function
    const { processedCount } = await aggregateAndUpsert(rows, header);
    
    return res.status(200).json({ 
      message: `Sync complete. Processed ${rows.length + 1} rows and upserted ${processedCount} unique orders.`
    });

  } catch (error: any) {
    console.error('Error during Google Sheets sync:', error.message);
    return res.status(500).json({ error: 'Google Sheets sync failed.', details: error.message });
  }
} 