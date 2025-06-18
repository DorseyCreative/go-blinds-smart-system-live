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

export async function calculateJob(lineItems: LineItem[]) {
  let quote = 0;
  const unknownLineItems: LineItem[] = [];
  const catalog = await getCatalog();
  
  if (!catalog.length) {
    // Fallback: treat all as unknown
    return { durationMinutes: 0, quote: 0, unknownLineItems: lineItems };
  }

  let durationMinutes = 0;

  for (const item of lineItems) {
    const match = catalog.find(entry =>
      item.description.toLowerCase().includes(entry.code.toLowerCase())
    );
    if (match) {
      durationMinutes += match.duration_minutes * item.quantity;
      quote += Number(match.price) * item.quantity;
    } else {
      unknownLineItems.push(item);
    }
  }
  return { durationMinutes, quote, unknownLineItems };
} 