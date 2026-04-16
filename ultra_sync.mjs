
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://oyyosydowvffxzhctpzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eW9zeWRvd3ZmZnh6aGN0cHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc0ODIwNSwiZXhwIjoyMDU0MzI0MjA1fQ.w_T3yXyv0Yy6H3Y-8x0J7x0J7x0J7x0J7x0J7x0J7x0'
)

async function ultraSync() {
  const source = "C:/Users/El3atty/.gemini/antigravity/brain/e2efc1b1-dc09-43f5-9dbf-7c0620599f29/media__1775379153553.png";
  if (!fs.existsSync(source)) {
    console.error("SOURCE NOT FOUND");
    return;
  }

  const buffer = fs.readFileSync(source);
  
  // 1. Upload
  console.log("Uploading...");
  await supabase.storage.from('categories').upload('cosmetics_packshot.png', buffer, { upsert: true });
  
  const { data: { publicUrl } } = supabase.storage.from('categories').getPublicUrl('cosmetics_packshot.png');
  console.log("URL:", publicUrl);

  // 2. DB Update
  console.log("Updating DB...");
  const { error } = await supabase.from('categories').update({ image: publicUrl }).ilike('label', '%العناية الشخصية%');
  if(error) await supabase.from('categories').update({ image: publicUrl }).ilike('id', '%cosmetics%');
  
  console.log("SYNC COMPLETE! CHECK TABLET.");
}

ultraSync();
