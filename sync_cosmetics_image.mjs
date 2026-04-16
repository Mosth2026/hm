
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  'https://oyyosydowvffxzhctpzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eW9zeWRvd3ZmZnh6aGN0cHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc0ODIwNSwiZXhwIjoyMDU0MzI0MjA1fQ.w_T3yXyv0Yy6H3Y-8x0J7x0J7x0J7x0J7x0J7x0J7x0' // SERVICE_ROLE_KEY
)

async function syncImage() {
  const filePath = 'public/assets/cosmetics.png'
  const fileBuffer = fs.readFileSync(filePath)
  
  // 1. Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('categories')
    .upload('cosmetics_packshot.png', fileBuffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (uploadError) {
    console.error("Upload failed:", uploadError)
    return
  }

  const { data: { publicUrl } } = supabase.storage.from('categories').getPublicUrl('cosmetics_packshot.png')

  // 2. Update Categories Table
  const { error: dbError } = await supabase
    .from('categories')
    .update({ image: publicUrl })
    .ilike('label', '%العناية الشخصية%')

  if (dbError) {
    // Try update by ID/Cosmetics
     const { error: dbError2 } = await supabase
    .from('categories')
    .update({ image: publicUrl })
    .ilike('id', '%cosmetics%')
    
     if (dbError2) console.error("Database update failed:", dbError2)
     else console.log("Database updated by ID (cosmetics)!")
  } else {
    console.log("Database updated successfully by Label!")
  }
}

syncImage()
