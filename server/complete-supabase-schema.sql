-- =====================================================
-- COMPLETE SUPABASE SCHEMA FOR CYPRESS APPLICATION
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-super-secret-jwt-key-change-this-in-production';

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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Admins indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON public.admins(role);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_created_by ON public.reports(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON public.reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status_category ON public.reports(status, category);
CREATE INDEX IF NOT EXISTS idx_reports_severity_status ON public.reports(severity, status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR USERS TABLE
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- RLS POLICIES FOR REPORTS TABLE
-- =====================================================

-- Users can view all reports (public read access)
CREATE POLICY "Users can view all reports" ON public.reports
    FOR SELECT USING (true);

-- Users can create their own reports
CREATE POLICY "Users can create their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can update their own reports
CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = created_by);

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports" ON public.reports
    FOR DELETE USING (auth.uid() = created_by);

-- Admins can manage all reports (additional policy for admin access)
CREATE POLICY "Admins can manage all reports" ON public.reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        )
    );

-- =====================================================
-- RLS POLICIES FOR ADMINS TABLE
-- =====================================================

-- Only admins can view admin table
CREATE POLICY "Admins can view all admins" ON public.admins
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        )
    );

-- Only admins can insert into admin table
CREATE POLICY "Admins can insert admins" ON public.admins
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        )
    );

-- Only admins can update admin table
CREATE POLICY "Admins can update admins" ON public.admins
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admins 
            WHERE email = (
                SELECT email FROM auth.users WHERE id = auth.uid()
            )
        )
    );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at 
    BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GEOSPATIAL FUNCTIONS
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
    distance_meters DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE
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
        ST_Distance(r.location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance_meters,
        r.created_at
    FROM public.reports r
    WHERE ST_DWithin(
        r.location, 
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, 
        radius_meters
    )
    ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql;

-- Function to get reports within a bounding box
CREATE OR REPLACE FUNCTION get_reports_in_bounds(
    min_lat DOUBLE PRECISION,
    max_lat DOUBLE PRECISION,
    min_lng DOUBLE PRECISION,
    max_lng DOUBLE PRECISION
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    severity TEXT,
    status TEXT,
    category TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
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
        ST_Y(ST_AsText(r.location)) as latitude,
        ST_X(ST_AsText(r.location)) as longitude
    FROM public.reports r
    WHERE ST_Within(
        r.location,
        ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STATISTICS FUNCTIONS
-- =====================================================

-- Function to get report statistics
CREATE OR REPLACE FUNCTION get_report_stats()
RETURNS TABLE (
    total_reports BIGINT,
    open_reports BIGINT,
    in_progress_reports BIGINT,
    resolved_reports BIGINT,
    high_severity BIGINT,
    medium_severity BIGINT,
    low_severity BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE status = 'open') as open_reports,
        COUNT(*) FILTER (WHERE status = 'in progress') as in_progress_reports,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
        COUNT(*) FILTER (WHERE severity = 'high') as high_severity,
        COUNT(*) FILTER (WHERE severity = 'medium') as medium_severity,
        COUNT(*) FILTER (WHERE severity = 'low') as low_severity
    FROM public.reports;
END;
$$ LANGUAGE plpgsql;

-- Function to get reports by category statistics
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
    category TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.category,
        COUNT(*) as count
    FROM public.reports r
    GROUP BY r.category
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEARCH FUNCTIONS
-- =====================================================

-- Function to search reports by text
CREATE OR REPLACE FUNCTION search_reports(search_term TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    severity TEXT,
    status TEXT,
    category TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity_score REAL
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
        r.created_at,
        GREATEST(
            similarity(r.title, search_term),
            similarity(r.description, search_term),
            similarity(r.address, search_term)
        ) as similarity_score
    FROM public.reports r
    WHERE 
        r.title ILIKE '%' || search_term || '%' OR
        r.description ILIKE '%' || search_term || '%' OR
        r.address ILIKE '%' || search_term || '%'
    ORDER BY similarity_score DESC;
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
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for recent reports with user information
CREATE OR REPLACE VIEW recent_reports_view AS
SELECT 
    r.id,
    r.title,
    r.description,
    r.severity,
    r.status,
    r.category,
    r.address,
    r.created_at,
    u.name as user_name,
    u.email as user_email
FROM public.reports r
LEFT JOIN public.users u ON r.created_by = u.id
ORDER BY r.created_at DESC;

-- View for admin dashboard
CREATE OR REPLACE VIEW admin_dashboard_view AS
SELECT 
    r.id,
    r.title,
    r.description,
    r.severity,
    r.status,
    r.category,
    r.address,
    r.created_at,
    u.name as reporter_name,
    u.email as reporter_email,
    CASE 
        WHEN r.status = 'open' THEN 'bg-gray-100 text-gray-800'
        WHEN r.status = 'in progress' THEN 'bg-blue-100 text-blue-800'
        WHEN r.status = 'resolved' THEN 'bg-green-100 text-green-800'
    END as status_class,
    CASE 
        WHEN r.severity = 'high' THEN 'bg-red-100 text-red-800'
        WHEN r.severity = 'medium' THEN 'bg-yellow-100 text-yellow-800'
        WHEN r.severity = 'low' THEN 'bg-green-100 text-green-800'
    END as severity_class
FROM public.reports r
LEFT JOIN public.users u ON r.created_by = u.id
ORDER BY r.created_at DESC;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reports TO authenticated;

-- Grant permissions to anon users for public read access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.reports TO anon;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_nearby_reports(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reports_in_bounds(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION) TO authenticated;
GRANT EXECUTE ON FUNCTION get_report_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_category_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION search_reports(TEXT) TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.users IS 'User profiles that extend Supabase auth.users';
COMMENT ON TABLE public.admins IS 'Administrative users with bcrypt passwords';
COMMENT ON TABLE public.reports IS 'Community problem reports with geospatial data';
COMMENT ON COLUMN public.reports.location IS 'PostGIS Point geometry for location data';
COMMENT ON COLUMN public.reports.images IS 'Array of image URLs for report evidence';
COMMENT ON FUNCTION get_nearby_reports IS 'Get reports within specified radius of coordinates';
COMMENT ON FUNCTION get_report_stats IS 'Get comprehensive statistics about reports';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'admins', 'reports')
ORDER BY table_name;

-- Verify indexes were created
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'admins', 'reports')
ORDER BY tablename, indexname;

-- Verify functions were created
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_nearby_reports', 'get_report_stats', 'search_reports')
ORDER BY routine_name;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cypress Supabase schema created successfully!';
    RAISE NOTICE '📊 Tables: users, admins, reports';
    RAISE NOTICE '🔐 RLS policies enabled';
    RAISE NOTICE '🗺️ Geospatial functions ready';
    RAISE NOTICE '📈 Statistics functions available';
    RAISE NOTICE '🔍 Search functions configured';
    RAISE NOTICE '👤 Default admin: admin@cypress.com (password: admin123)';
END $$;
