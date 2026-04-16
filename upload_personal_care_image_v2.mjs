
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Load Credentials
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
const envVars = {}
envLines.forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length > 0) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://yacjvrfwcahjqqbuiyxy.supabase.co'
// Try service role key first, then anon
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function uploadAndSync() {
  console.log("🚀 Starting Personal Care image upload...")
  const filePath = path.join(process.cwd(), 'public/assets/cosmetics.png')
  
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`)
    return
  }

  const fileBuffer = fs.readFileSync(filePath)
  
  // 1. Upload to storage (Bucket 'categories')
  console.log("📤 Uploading to Storage...")
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('categories')
    .upload('cosmetics_packshot.png', fileBuffer, {
      contentType: 'image/png',
      upsert: true
    })

  if (uploadError) {
    if (uploadError.message.includes('Bucket not found')) {
       console.error("❌ Bucket 'categories' not found. Please create it in Supabase Storage.")
    } else {
       console.error("❌ Upload failed:", uploadError)
    }
  } else {
    console.log("✅ Upload successful!")
  }

  const { data: { publicUrl } } = supabase.storage.from('categories').getPublicUrl('cosmetics_packshot.png')
  console.log(`🔗 Public URL: ${publicUrl}`)

  // 2. Update Categories Table
  console.log("🔄 Updating Categories table...")
  
  // First try by ID 'cosmetics'
  const { data: updateId, error: dbErrorId } = await supabase
    .from('categories')
    .update({ image: publicUrl })
    .eq('id', 'cosmetics')
    .select()

  if (updateId && updateId.length > 0) {
    console.log("✅ Database updated by ID (cosmetics)!")
  } else if (dbErrorId) {
    console.error("❌ Database update by ID failed:", dbErrorId)
  }

  // Then try by Label containing "العناية الشخصية" or "لمسات الجمال"
  const { data: updateLabel, error: dbErrorLabel } = await supabase
    .from('categories')
    .update({ image: publicUrl })
    .or('label.ilike.%العناية الشخصية%,label.ilike.%لمسات الجمال%')
    .select()

  if (updateLabel && updateLabel.length > 0) {
    console.log("✅ Database updated by Label!")
  } else if (dbErrorLabel) {
    console.error("❌ Database update by Label failed:", dbErrorLabel)
  }

  console.log("✨ All done!")
}

uploadAndSync()
