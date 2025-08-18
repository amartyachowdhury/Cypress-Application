import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

console.log('🔍 Testing Supabase Connection...\n');

// Check if environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment Variables:');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Not set');

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    console.log('\n❌ Missing environment variables!');
    console.log('Please update your .env file with your Supabase credentials.');
    console.log('Example:');
    console.log('SUPABASE_URL=https://your-project-id.supabase.co');
    console.log('SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    process.exit(1);
}

// Test Supabase connection
async function testConnection() {
    try {
        console.log('\n🔗 Testing Supabase connection...');
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Test basic connection
        const { data, error } = await supabase
            .from('reports')
            .select('count')
            .limit(1);
        
        if (error) {
            console.log('❌ Connection failed:', error.message);
            
            if (error.message.includes('relation "reports" does not exist')) {
                console.log('\n💡 The database schema might not be set up yet.');
                console.log('Please run the SQL schema in your Supabase dashboard:');
                console.log('1. Go to SQL Editor in Supabase');
                console.log('2. Copy and paste the contents of simple-supabase-schema.sql');
                console.log('3. Click "Run"');
            }
        } else {
            console.log('✅ Supabase connection successful!');
            console.log('✅ Database schema is properly set up.');
        }
        
    } catch (error) {
        console.log('❌ Connection error:', error.message);
    }
}

testConnection();
