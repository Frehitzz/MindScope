import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const urlMatch = envFile.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch ? urlMatch[1].trim() : '';
const supabaseKey = keyMatch ? keyMatch[1].trim() : '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Fetching from teen_mental_health_cleaned...');
  const { data, error } = await supabase
    .from('teen_mental_health_cleaned')
    .select('stress_level, anxiety_level, sleep_hours, daily_social_media_hours')
    .limit(5);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`Found ${data?.length || 0} rows.`);
    console.log(data);
  }
}

test();
