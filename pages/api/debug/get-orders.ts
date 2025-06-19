import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('customer_orders')
        .select('*')
        .order('work_order_number', { ascending: true });

      if (error) {
        throw error;
      }

      const nullQuoteOrDuration = data.some(d => d.quote === null || d.duration_minutes === null);

      res.status(200).json({ 
        message: nullQuoteOrDuration 
          ? "Verification FAILED: Found orders with null quote or duration."
          : "Verification PASSED: All orders have a quote and duration.",
        count: data.length,
        nullFound: nullQuoteOrDuration,
        data 
      });
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 