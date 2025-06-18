import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const lineItems = [
  { code: 'BDC-addlhorizontals', description: 'Additional Horizontals', price: 20, duration_minutes: 4 },
  { code: 'BDC-addlverticals', description: 'Additional Verticals', price: 35, duration_minutes: 12 },
  { code: 'BDC-corniceValance', description: 'Cornice Valance', price: 15, duration_minutes: 2 },
  { code: 'BDC-installation', description: 'Installation', price: 60, duration_minutes: 15 },
  { code: 'BDC-installover10feet', description: 'Install Over 10 Feet', price: 15, duration_minutes: 3 },
  { code: 'BDC-masonrmetaltile', description: 'Masonry/Metal/Tile', price: 12, duration_minutes: 5 },
  { code: 'BDC-measurement', description: 'Measurement', price: 35, duration_minutes: 10 },
  { code: 'BDC-minimum', description: 'Minimum Charge', price: 60, duration_minutes: 0 },
  { code: 'BDC-motorized', description: 'Motorized', price: 25, duration_minutes: 2 },
  { code: 'BDC-oversizevertical', description: 'Oversize Vertical', price: 6, duration_minutes: 0 },
  { code: 'BDC-papertemplate', description: 'Paper Template', price: 30, duration_minutes: 20 },
  { code: 'BDC-sheerverticalinstall', description: 'Sheer Vertical Install', price: 10, duration_minutes: 5 },
  { code: 'BDC-tripcharge', description: 'Trip Charge', price: 60, duration_minutes: 15 },
  { code: 'BDC-windowRemoval', description: 'Window Removal', price: 6, duration_minutes: 1 },
  { code: 'BDC-windowtohaul', description: 'Window to Haul', price: 6, duration_minutes: 1 },
  { code: 'BLIND/SHADE INSTALL-NAT', description: 'Blind/Shade Install (Nat)', price: 60, duration_minutes: 0 },
  { code: 'CUSTOM LABOR', description: 'Custom Labor', price: 60, duration_minutes: 15 },
  { code: 'HORIZONTAL BLINDS', description: 'Horizontal Blinds', price: 20, duration_minutes: 3 },
  { code: 'distance', description: 'Distance', price: 25, duration_minutes: 0 },
  { code: 'Mileage', description: 'Mileage', price: 3, duration_minutes: 0 },
  { code: 'INSPECT', description: 'Inspection', price: 60, duration_minutes: 30 },
  { code: 'windowadjustment', description: 'Window Adjustment', price: 16, duration_minutes: 5 },
  { code: 'measurewindow', description: 'Measure Window', price: 35, duration_minutes: 10 },
  { code: 'oversizedhorizontal', description: 'Oversized Horizontal', price: 20, duration_minutes: 1 },
  { code: 'REPAIR', description: 'Repair', price: 60, duration_minutes: 30 },
  { code: 'measureladder', description: 'Measure Ladder', price: 15, duration_minutes: 1 },
  { code: 'skylightinstall', description: 'Skylight Install', price: 27, duration_minutes: 2 },
  { code: 'commercial', description: 'Commercial', price: 30, duration_minutes: 5 },
];

async function seed() {
  for (const item of lineItems) {
    const { error } = await supabase
      .from('line_item_catalog')
      .upsert({
        code: item.code,
        description: item.description,
        price: item.price,
        duration_minutes: item.duration_minutes,
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