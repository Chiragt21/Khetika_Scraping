const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aczcololiedppabxmsmb.supabase.co', // Your Supabase URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjemNvbG9saWVkcHBhYnhtc21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI1MTQ2NywiZXhwIjoyMDY2ODI3NDY3fQ.zBEXPlJJ_ZO_WdjfQb9q9g9A-deXGiOmMLlHUDjgf5c' // Paste your service role key here
);

function parseCustomDate(str) {
  // Example: "30/6/2025, 9:02:32 am"
  if (!str) return null;
  const [datePart, timePart] = str.split(', ');
  if (!datePart || !timePart) return null;
  const [d, m, y] = datePart.split('/');
  const match = timePart.match(/(\d+):(\d+):(\d+)\s*(am|pm)/i);
  if (!match) return null;
  let [, h, min, s, ampm] = match;
  h = parseInt(h, 10);
  min = parseInt(min, 10);
  s = parseInt(s, 10);
  if (ampm.toLowerCase() === 'pm' && h !== 12) h += 12;
  if (ampm.toLowerCase() === 'am' && h === 12) h = 0;
  // Pad month and day
  return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')} ${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

async function run() {
  let from = 0;
  const batchSize = 1000;
  let totalUpdated = 0;
  while (true) {
    let { data: products, error } = await supabase
      .from('products')
      .select('id, date')
      .range(from, from + batchSize - 1);
    if (error) throw error;
    if (!products || products.length === 0) break;

    for (const product of products) {
      const isoDate = parseCustomDate(product.date);
      if (isoDate) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ date: isoDate })
          .eq('id', product.id);
        if (updateError) {
          console.error(`Failed to update id ${product.id}:`, updateError.message);
        } else {
          console.log(`Updated id ${product.id}: ${product.date} -> ${isoDate}`);
          totalUpdated++;
        }
      } else {
        console.warn(`Could not parse date for id ${product.id}: ${product.date}`);
      }
    }
    from += batchSize;
    // Safety check to prevent infinite loop
    if (from > 10000) break;
  }
  console.log(`Total updated: ${totalUpdated}`);
}

run(); 