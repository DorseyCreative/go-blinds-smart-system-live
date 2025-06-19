import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Anon Key is missing. Make sure .env.local is set up correctly.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const lineItems = [
  { code: 'BDC-addlhorizontals', description: 'Additional Horizontals', price: 20, duration_minutes: 4, category: 'Install' },
  { code: 'BDC-tripcharge', description: 'Trip Charge', price: 60, duration_minutes: 15, category: 'Service' },
  { code: 'BDC-installation', description: 'Installation', price: 60, duration_minutes: 15, category: 'Install' },
  { code: 'BDC-addlverticals', description: 'Additional Verticals', price: 35, duration_minutes: 12, category: 'Install' },
  { code: 'BDC-oversizevertical', description: 'Oversize Vertical', price: 6, duration_minutes: 0, category: 'Install' },
  { code: 'BDC-motorized', description: 'Motorized', price: 25, duration_minutes: 2, category: 'Install' },
  { code: 'BDC-windowRemoval', description: 'Window Removal', price: 6, duration_minutes: 0, category: 'Removal' },
  { code: 'BDC-installover10feet', description: 'Install Over 10 Feet', price: 15, duration_minutes: 1, category: 'Install' },
  { code: 'BDC-skylightinstall', description: 'Skylight Install', price: 27, duration_minutes: 2, category: 'Install' },
  { code: 'BDC-distance', description: 'Distance', price: 25, duration_minutes: 0, category: 'Service' },
  { code: 'BDC-Mileage', description: 'Mileage', price: 3, duration_minutes: 0, category: 'Service' },
  { code: 'BDC-Template', description: 'Template', price: 30, duration_minutes: 20, category: 'Service' },
  { code: 'BDC-Metal', description: 'Masonry/Metal/Tile', price: 12, duration_minutes: 0, category: 'Install' },
  { code: 'BDC-sheerverticalinstall', description: 'Sheer Vertical Install', price: 10, duration_minutes: 5, category: 'Install' },
  { code: 'BDC-commercial', description: 'Commercial', price: 0, duration_minutes: 5, category: 'Service' },
  { code: 'BDC-measurewindow', description: 'Measure Window', price: 0, duration_minutes: 1, category: 'Measurement' },
  { code: 'BDC-oversizedhorizontal', description: 'Oversized Horizontal', price: 0, duration_minutes: 1, category: 'Install' },
  { code: 'INSPECT', description: 'Inspect', price: 60, duration_minutes: 30, category: 'Service' },
  { code: 'BDC-windowtohaul', description: 'Window to Haul', price: 6, duration_minutes: 0, category: 'Removal' },
  { code: 'BDC-windowadjustment', description: 'Window Adjustment', price: 16, duration_minutes: 5, category: 'Service' },
  { code: 'BDC-minimum', description: 'Minimum Charge', price: 60, duration_minutes: 0, category: 'Service' },
  { code: 'BLIND/SHADE INSTALL-NAT', description: 'Blind/Shade Install (Nat)', price: 60, duration_minutes: 0, category: 'Install' },
  { code: 'BDC-measureladder', description: 'Measure with Ladder', price: 0, duration_minutes: 1, category: 'Measurement' },
  { code: 'REPAIR', description: 'Repair', price: 60, duration_minutes: 30, category: 'Service' },
  { code: 'BDC-measurement', description: 'Measurement', price: 35, duration_minutes: 10, category: 'Measurement' },
  { code: 'HORIZONTAL BLINDS', description: 'Horizontal Blinds', price: 20, duration_minutes: 4, category: 'Install' },
  { code: 'BDC-deadpool', description: 'Dead-pull', price: 0, duration_minutes: 0, category: 'Service' },
];

async function seed() {
  console.log('Starting to seed line_item_catalog...');
  for (const item of lineItems) {
    const { error } = await supabase
      .from('line_item_catalog')
      .upsert({
        code: item.code,
        description: item.description,
        price: item.price,
        duration_minutes: item.duration_minutes,
        category: item.category,
        active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'code' });
    if (error) {
      console.error(`Error upserting ${item.code}:`, error.message);
    } else {
      console.log(`Upserted: ${item.code}`);
    }
  }
  console.log('Seeding complete.');
}

seed(); 