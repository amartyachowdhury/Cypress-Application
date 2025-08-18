import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables:');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Create Supabase client with anon key for user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
    // Users
    async createUser(userData) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .insert([userData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async getUserById(id) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async updateUser(id, updates) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Reports
    async createReport(reportData) {
        const { data, error } = await supabaseAdmin
            .from('reports')
            .insert([reportData])
            .select(`
                *,
                users:created_by(id, name, email)
            `)
            .single();
        
        if (error) throw error;
        return data;
    },

    async getReports(filters = {}) {
        let query = supabaseAdmin
            .from('reports')
            .select(`
                *,
                users:created_by(id, name, email)
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }
        if (filters.severity && filters.severity !== 'all') {
            query = query.eq('severity', filters.severity);
        }
        if (filters.createdBy) {
            query = query.eq('created_by', filters.createdBy);
        }

        // Apply pagination
        if (filters.page && filters.limit) {
            const from = (filters.page - 1) * filters.limit;
            const to = from + filters.limit - 1;
            query = query.range(from, to);
        }

        const { data, error, count } = await query;
        
        if (error) throw error;
        return { reports: data, count };
    },

    async getReportById(id) {
        const { data, error } = await supabaseAdmin
            .from('reports')
            .select(`
                *,
                users:created_by(id, name, email)
            `)
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    },

    async updateReport(id, updates) {
        const { data, error } = await supabaseAdmin
            .from('reports')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                users:created_by(id, name, email)
            `)
            .single();
        
        if (error) throw error;
        return data;
    },

    async deleteReport(id) {
        const { error } = await supabaseAdmin
            .from('reports')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return true;
    },

    async getNearbyReports(lat, lng, radius = 5000) {
        const { data, error } = await supabaseAdmin
            .rpc('get_nearby_reports', {
                lat: lat,
                lng: lng,
                radius_meters: radius
            });
        
        if (error) throw error;
        return data;
    },

    // Admins
    async getAdminByEmail(email) {
        const { data, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) throw error;
        return data;
    },

    async createAdmin(adminData) {
        const { data, error } = await supabaseAdmin
            .from('admins')
            .insert([adminData])
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    async updateAdmin(email, updates) {
        const { data, error } = await supabaseAdmin
            .from('admins')
            .update(updates)
            .eq('email', email)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },

    // Statistics
    async getStats() {
        const { data, error } = await supabaseAdmin
            .from('reports')
            .select('status');
        
        if (error) throw error;

        const stats = {
            total: data.length,
            open: data.filter(r => r.status === 'open').length,
            inProgress: data.filter(r => r.status === 'in progress').length,
            resolved: data.filter(r => r.status === 'resolved').length
        };

        return stats;
    }
};

export default db;
