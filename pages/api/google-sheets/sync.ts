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

// This is the new, more robust data processing function
async function processAndUpsertData(rows: any[][], header: string[]) {
  const aggregatedData: { [key: string]: any } = {};
  const debugData = {
    header: header,
    firstRow: rows.length > 0 ? rows[0] : null
  };

  // Step 1: Aggregate data by Work Order Number
  for (const row of rows) {
    const rowData: { [key: string]: any } = {};
    header.forEach((headerVal, index) => {
      rowData[headerVal] = row[index] || null; // Use null for empty cells
    });

    const workOrderNumber = rowData['Work Order Number'];
    if (!workOrderNumber) {
      console.warn('Skipping row without a work order number:', row);
      continue;
    }

    if (!aggregatedData[workOrderNumber]) {
      // If this is the first time we see this WO#, create a new entry
      
      // Fix for date format
      const entryDateStr = rowData['Entry Date'];
      let isoDate = null;
      if (entryDateStr) {
        const parts = entryDateStr.split('/');
        if (parts.length === 3) {
          // Assuming MM/DD/YY format from the sheet
          const year = `20${parts[2]}`;
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          isoDate = `${year}-${month}-${day}`;
        }
      }

      // Create a clean object with only the columns that exist in the database
      aggregatedData[workOrderNumber] = {
        entry_date: isoDate,
        customer_name: rowData['Customer Name'],
        work_order_number: workOrderNumber,
        po_number: rowData['PO Number'],
        phone_1: rowData['Phone 1'],
        email: rowData['Email'],
        address: rowData['Address'],
        city: rowData['City'],
        state: rowData['State'],
        zip_code: rowData['Zip Code'],
        labor_to_do_items: [], // This is a temporary field for aggregation
      };
    }

    // Add the "Labor To Do" item to our array for this WO#
    if (rowData['Labor To Do']) {
      aggregatedData[workOrderNumber].labor_to_do_items.push(rowData['Labor To Do']);
    }
  }

  // Step 2: Upsert each aggregated order into Supabase
  let processedCount = 0;
  for (const workOrderNumber in aggregatedData) {
    const order = aggregatedData[workOrderNumber];
    
    // Join the labor items into a single, formatted string
    order.labor_to_do = order.labor_to_do_items.join('\n');
    delete order.labor_to_do_items; // Clean up the temporary array

    // Re-introduce the calculation logic
    order.line_items = parseLineItems(order.labor_to_do || '');
    const { durationMinutes, quote } = await calculateJob(order.line_items);
    order.duration_minutes = durationMinutes;
    order.quote = quote;
    // We can decide how to handle unknown items later if needed

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
    const { processedCount } = await processAndUpsertData(rows, header);
    
    return res.status(200).json({ 
      message: `Sync complete. Processed ${rows.length + 1} rows and upserted ${processedCount} unique orders.`
    });

  } catch (error: any) {
    console.error('Error during Google Sheets sync:', error.message);
    return res.status(500).json({ error: 'Google Sheets sync failed.', details: error.message });
  }
} 