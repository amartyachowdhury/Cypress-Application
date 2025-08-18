-- =====================================================
-- SIMPLE SUPABASE SCHEMA FOR CYPRESS APPLICATION
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admins table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')) DEFAULT 'low',
    status TEXT CHECK (status IN ('open', 'in progress', 'resolved')) DEFAULT 'open',
    category TEXT CHECK (category IN ('infrastructure', 'safety', 'environment', 'noise', 'other')) DEFAULT 'other',
    address TEXT,
    location GEOGRAPHY(POINT, 4326),
    images TEXT[], -- Array of image URLs
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reports_created_by ON public.reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Reports policies
CREATE POLICY "Users can view all reports" ON public.reports
    FOR SELECT USING (true);
CREATE POLICY "Users can create their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete their own reports" ON public.reports
    FOR DELETE USING (auth.uid() = created_by);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get nearby reports
CREATE OR REPLACE FUNCTION get_nearby_reports(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    severity TEXT,
    status TEXT,
    category TEXT,
    address TEXT,
    distance_meters DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.title,
        r.description,
        r.severity,
        r.status,
        r.category,
        r.address,
        ST_Distance(r.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters
    FROM public.reports r
    WHERE ST_DWithin(
        r.location, 
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO public.admins (email, name, password_hash) 
VALUES (
    'admin@cypress.com',
    'System Admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_reports(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cypress Supabase schema created successfully!';
    RAISE NOTICE '👤 Default admin: admin@cypress.com (password: admin123)';
END $$;
