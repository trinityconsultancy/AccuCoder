// Test Supabase connection and data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mzuwgfdyfgihqiszujvz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16dXdnZmR5ZmdpaHFpc3p1anZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNjA2MjAsImV4cCI6MjA3NzczNjYyMH0.s_EiUJEitV6izyvNtUMaZIbFtRnT1ucBGMhi5Gw6gwc'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Checking actual substance names in database...\n')
  
  const { data, error } = await supabase
    .from('drugs_and_chemicals')
    .select('substance')
    .limit(20)
  
  console.log('First 20 substance names:')
  data?.forEach((row, i) => {
    console.log(`${i + 1}. ${row.substance}`)
  })
  
  console.log('\nChecking for #NAME? entries:')
  const { count } = await supabase
    .from('drugs_and_chemicals')
    .select('*', { count: 'exact', head: true })
    .eq('substance', '#NAME?')
  
  console.log(`Found ${count} rows with #NAME? as substance`)
}

testConnection().catch(console.error)
