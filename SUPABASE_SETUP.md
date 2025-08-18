# 🚀 Supabase Migration Guide

This guide will help you migrate the Cypress application from MongoDB Atlas to Supabase.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Version 16 or higher
3. **Git**: For version control

## 🔧 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `cypress-app`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret!)

### 3. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `server/simple-supabase-schema.sql` (or `server/complete-supabase-schema.sql` for full features)
3. Paste and run the SQL script
4. This will create all necessary tables, indexes, and functions

### 4. Configure Environment Variables

Update your `server/.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (for admin authentication)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server Port
PORT=5050

# Admin Credentials
ADMIN_EMAIL=admin@cypress.com
ADMIN_PASSWORD=admin123
```

### 5. Install Dependencies

```bash
cd server
npm install
```

### 6. Test Database Connection

```bash
npm run dev
```

Then visit `http://localhost:5050/test-db` to verify the connection.

### 7. Create Admin User

```bash
npm run create-admin
```

This creates the default admin user:
- Email: `admin@cypress.com`
- Password: `admin123`

### 8. Migrate Existing Data (Optional)

If you have existing MongoDB data to migrate:

1. Add your MongoDB connection string to `.env`:
   ```env
   MONGO_URI=your_mongodb_connection_string
   ```

2. Install mongoose temporarily:
   ```bash
   npm install mongoose
   ```

3. Run the migration:
   ```bash
   npm run migrate
   ```

4. Remove mongoose:
   ```bash
   npm uninstall mongoose
   ```

## 🔐 Authentication Setup

### User Authentication

The application now uses Supabase Auth for user authentication:

- **Registration**: Users sign up through Supabase Auth
- **Login**: Users sign in through Supabase Auth
- **Email Verification**: Handled automatically by Supabase
- **Password Reset**: Available through Supabase dashboard

### Admin Authentication

Admin authentication uses a separate system with bcrypt:

- Admins are stored in the `admins` table
- Login through `/api/admin/login`
- Uses JWT tokens for session management

## 🗄️ Database Schema

### Tables

1. **users**: User profiles (extends Supabase auth.users)
2. **admins**: Admin users with bcrypt passwords
3. **reports**: Community problem reports with geospatial data

### Key Features

- **Row Level Security (RLS)**: Automatic data protection
- **Geospatial Queries**: PostGIS for location-based searches
- **Real-time Subscriptions**: Available through Supabase
- **Automatic Timestamps**: Created/updated timestamps
- **Foreign Key Constraints**: Data integrity

## 🚀 Benefits of Supabase

### ✅ Advantages

1. **Better Performance**: PostgreSQL is faster than MongoDB for complex queries
2. **ACID Compliance**: Full transaction support
3. **Built-in Auth**: User authentication and authorization
4. **Real-time**: Live data subscriptions
5. **Row Level Security**: Fine-grained access control
6. **Geospatial**: Native PostGIS support
7. **SQL**: Standard SQL queries
8. **Scalability**: Better for complex applications

### 🔄 Migration Benefits

1. **No More MongoDB**: Eliminates MongoDB dependency
2. **Better Schema**: Structured data with constraints
3. **Improved Security**: RLS policies
4. **Real-time Features**: Live updates
5. **Better Analytics**: SQL-based reporting

## 🧪 Testing

### Test the Application

1. **Start the server**:
   ```bash
   cd server && npm run dev
   ```

2. **Start the client**:
   ```bash
   cd client && npm run dev
   ```

3. **Test features**:
   - Register a new user
   - Login with credentials
   - Submit a report with location
   - View reports on the map
   - Admin login and dashboard

### API Endpoints

- `GET /test-db`: Test database connection
- `POST /api/auth/register`: User registration
- `POST /api/auth/login`: User login
- `POST /api/admin/login`: Admin login
- `GET /api/reports/mine`: User's reports
- `GET /api/admin/reports`: All reports (admin)

### Application URLs

- **Frontend**: `http://localhost:3002`
- **Backend API**: `http://localhost:5050`
- **Database Test**: `http://localhost:5050/test-db`

## 🔧 Troubleshooting

### Common Issues

1. **Connection Error**: Check your Supabase URL and keys
2. **RLS Policy Error**: Ensure RLS policies are set up correctly
3. **Geospatial Error**: Verify PostGIS extension is enabled
4. **Auth Error**: Check Supabase Auth settings

### Debug Commands

```bash
# Test database connection
curl http://localhost:5050/test-db

# Check server logs
npm run dev

# Verify environment variables
node -e "console.log(process.env.SUPABASE_URL)"
```

## 📚 Next Steps

1. **Enable Email Auth**: Configure email templates in Supabase
2. **Add Social Auth**: Google, GitHub, etc.
3. **Set up Storage**: For image uploads
4. **Configure Edge Functions**: For serverless functions
5. **Add Real-time**: Live updates for reports

## 🆘 Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Discord**: [supabase.com/discord](https://supabase.com/discord)
- **GitHub Issues**: Report bugs in this repository

---

**🎉 Congratulations!** Your Cypress application is now running on Supabase!
