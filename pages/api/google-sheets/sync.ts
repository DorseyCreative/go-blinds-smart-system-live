import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { parseLineItems } from '../../../lib/parseLineItems';
import { calculateJob } from '../../../lib/jobCalculations';
import credentials from '../../../lib/google-credentials.json';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function processRow(row: any[], header: string[]) {
  const rowData: { [key: string]: any } = {};
  header.forEach((headerVal, index) => {
    rowData[headerVal] = row[index];
  });

  const mappedData = {
    entry_date: rowData['Entry Date'],
    customer_name: rowData['Customer Name'],
    work_order_number: rowData['WO #'],
    po_number: rowData['PO #'],
    phone_1: rowData['Phone 1'],
    email: rowData['Email'],
    address: rowData['Address'],
    city: rowData['City'],
    state: rowData['State'],
    zip_code: rowData['Zip'],
    labor_to_do: rowData['Labor To Do'],
    // Add any other fields you need from the sheet
  };

  if (!mappedData.work_order_number) {
    console.warn('Skipping row without a work order number:', row);
    return;
  }
  
  const finalData: { [key: string]: any } = { ...mappedData };

  finalData.line_items = parseLineItems(finalData.labor_to_do || '');
  const { durationMinutes, quote, unknownLineItems } = await calculateJob(finalData.line_items);
  finalData.duration_minutes = durationMinutes;
  finalData.quote = quote;

  const { error } = await supabase
    .from('customer_orders')
    .upsert(finalData, { onConflict: 'work_order_number' });

  if (error) {
    console.error('Supabase upsert error for WO#', finalData.work_order_number, ':', error.message);
  } else {
    console.log('Successfully processed and saved WO#', finalData.work_order_number);
  }
  
  // You can still handle unknown line items if you wish
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
      range: 'Ezra Dorsey', // Assumes data is on the first sheet, change if needed
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ message: 'No data found in sheet.' });
    }

    const header = rows.shift(); // Get header row
    if (!header) {
      return res.status(200).json({ message: 'Sheet is empty or missing a header row.' });
    }

    console.log(`Found ${rows.length} rows to process.`);
    for (const row of rows) {
      await processRow(row, header);
    }
    
    return res.status(200).json({ message: `Sync complete. Processed ${rows.length} rows.` });

  } catch (error: any) {
    console.error('Error during Google Sheets sync:', error.message);
    return res.status(500).json({ error: 'Google Sheets sync failed.', details: error.message });
  }
} 