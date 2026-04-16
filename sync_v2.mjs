
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  'https://oyyosydowvffxzhctpzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eW9zeWRvd3ZmZnh6aGN0cHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc0ODIwNSwiZXhwIjoyMDU0MzI0MjA1fQ.w_T3yXyv0Yy6H3Y-8x0J7x0J7x0J7x0J7x0J7x0J7x0'
)

async function run() {
  try {
    const filePath = './public/assets/cosmetics.png';
    console.log("Checking file:", filePath);
    
    if (!fs.existsSync(filePath)) {
       console.error("File not found at:", path.resolve(filePath));
       return;
    }

    const fileContent = fs.readFileSync(filePath);
    
    console.log("Uploading to storage...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('categories')
      .upload('cosmetics_new_v1.png', fileContent, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('categories').getPublicUrl('cosmetics_new_v1.png');
    console.log("Public URL:", publicUrl);

    console.log("Updating database for 'العناية الشخصية'...");
    const { error: dbError } = await supabase
      .from('categories')
      .update({ image_url: publicUrl }) 
      .ilike('label', '%العناية الشخصية%');

    if (dbError) {
       console.warn("Retrying with 'image' column name...");
       await supabase.from('categories').update({ image: publicUrl }).ilike('label', '%العناية الشخصية%');
    }

    console.log("DONE! Refresh your tablet now.");
  } catch (err) {
    console.error("FATAL:", err.message);
  }
}

run();
