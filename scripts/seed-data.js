import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Käytä service role -avainta RLS:n ohitukseen
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Aseta ympäristömuuttujat SUPABASE_URL ja SUPABASE_SERVICE_ROLE_KEY');
  console.error('Esim: SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=eyJ... node scripts/seed-data.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const dataPath = join(__dirname, 'data.json');
const data = JSON.parse(readFileSync(dataPath, 'utf-8'));

async function seed() {
  console.log('Aloitetaan datan siirto Supabaseen...\n');

  // 1. Lisää paikat
  let placeCount = 0;
  for (const [cityKey, city] of Object.entries(data.cities)) {
    console.log(`Kaupunki: ${city.name} (${cityKey}) - ${city.places.length} paikkaa`);

    for (const place of city.places) {
      const row = {
        city: cityKey,
        name: place.name,
        category: place.category,
        description: place.description || '',
        website: place.website || '',
        google_maps: place.googleMaps || '',
        other_links: place.otherLinks || [],
        visited: place.visited || false,
        notes: place.notes || '',
      };

      const { error } = await supabase.from('places').insert(row);
      if (error) {
        console.error(`  VIRHE: ${place.name} - ${error.message}`);
      } else {
        placeCount++;
      }
    }
  }
  console.log(`\nLisätty ${placeCount} paikkaa.\n`);

  // 2. Lisää pikalinkit
  let linkCount = 0;
  for (const [categoryIndex, category] of data.quickLinks.entries()) {
    console.log(`Kategoria: ${category.category} - ${category.links.length} linkkiä`);

    for (const [linkIndex, link] of category.links.entries()) {
      const row = {
        category: category.category,
        name: link.name,
        url: link.url,
        sort_order: categoryIndex * 100 + linkIndex,
      };

      const { error } = await supabase.from('quick_links').insert(row);
      if (error) {
        console.error(`  VIRHE: ${link.name} - ${error.message}`);
      } else {
        linkCount++;
      }
    }
  }
  console.log(`\nLisätty ${linkCount} pikalinkkiä.`);
  console.log('\nDatan siirto valmis!');
}

seed().catch(console.error);
