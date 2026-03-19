
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBranches() {
  const branches = [
    {
      name: 'فرع الرحاب',
      whatsapp_number: '+201050005701',
      latitude: 30.0558637,
      longitude: 31.4913691,
      is_active: true
    },
    {
      name: 'فرع المهندسين',
      whatsapp_number: '+201050663537',
      latitude: 30.056319,
      longitude: 31.196222,
      is_active: true
    },
    {
      name: 'فرع المعادي 1',
      whatsapp_number: '+201050663538',
      latitude: 29.962696,
      longitude: 31.276942,
      is_active: true
    },
    {
      name: 'فرع المعادي 2',
      whatsapp_number: '+201050006956',
      latitude: 29.9640,
      longitude: 31.2740,
      is_active: true
    },
    {
      name: 'فرع مدينة نصر',
      whatsapp_number: '+201050006929',
      latitude: 30.061883,
      longitude: 31.345014,
      is_active: true
    },
    {
      name: 'فرع مصر الجديدة',
      whatsapp_number: '+201050006946',
      latitude: 30.1000,
      longitude: 31.3333,
      is_active: true
    },
    {
      name: 'فرع اسكندرية',
      whatsapp_number: '+201050663539',
      latitude: 31.2458,
      longitude: 29.9660,
      is_active: true
    }
  ];

  for (const b of branches) {
    const { data, error } = await supabase.from('branches').insert([b]).select();
    if (error) {
      console.error(`Error adding ${b.name}:`, error.message);
    } else {
      console.log(`Successfully added ${b.name}`);
    }
  }
}

addBranches();
