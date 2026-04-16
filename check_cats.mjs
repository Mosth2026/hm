
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://oyyosydowvffxzhctpzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eW9zeWRvd3ZmZnh6aGN0cHp4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczODc0ODIwNSwiZXhwIjoyMDU0MzI0MjA1fQ.w_T3yXyv0Yy6H3Y-8x0J7x0J7x0J7x0J7x0J7x0J7x0'
)

async function getCats() {
  const { data, error } = await supabase.from('categories').select('id, label, image')
  if(error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}

getCats()
