import { LineItem, parseLineItems } from './parseLineItems';
import { supabase } from './supabaseClient';

async function getCatalog() {
    const { data, error } = await supabase
      .from('line_item_catalog')
      .select('*')
      .eq('active', true);
    if (error) {
        console.error('Supabase fetch error:', error);
        return [];
    };
    return data || [];
}

export async function calculateJobDuration(laborToDo: string): Promise<number> {
    const lineItems = parseLineItems(laborToDo);
    if (!lineItems.length) return 0;
    
    const catalog = await getCatalog();
    if (!catalog.length) return 0;

    let durationMinutes = 0;

    for (const item of lineItems) {
        const match = catalog.find(entry =>
            item.description.toLowerCase().includes(entry.code.toLowerCase())
        );
        if (match) {
            durationMinutes += match.duration_minutes * item.quantity;
        }
    }

    return durationMinutes;
}

export async function calculateJob(lineItems: LineItem[]): Promise<{ durationMinutes: number, quote: number }> {
  let durationMinutes = 0;
  let quote = 0;

  const catalog = await getCatalog();
  
  if (!catalog || catalog.length === 0) {
    console.log('Line item catalog is empty. Fetching from Supabase...');
    await getCatalog();
  }

  for (const item of lineItems) {
    const catalogItem = catalog.find(catItem => catItem.code === item.description);

    if (catalogItem) {
      durationMinutes += (catalogItem.duration_minutes || 0) * item.quantity;
      quote += (catalogItem.price || 0) * item.quantity;
    } else {
      console.warn(`[CATALOG_MISS] Line item code not found in catalog: "${item.description}"`);
    }
  }

  return { durationMinutes, quote };
} 