# Cypress - Community Problem Reporting Application

A full-stack web application that allows citizens to report and track local issues in their community. Built with modern web technologies and Supabase.

## Features

### User Features
- 🔐 User Authentication (Supabase Auth)
- 📝 Submit Reports with Location
- 🗺️ Interactive Map View
- 📊 Personal Report Management
- 📱 Responsive Design
- 📸 Image Upload Support

### Admin Features
- 👑 Secure Admin Panel
- 📋 View All Reports
- 🔄 Update Report Status
- 📊 Report Management & Analytics
- 🔍 Advanced Filtering & Search

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Leaflet for maps

### Backend
- Node.js & Express.js
- Supabase (PostgreSQL) for database
- JWT for authentication
- bcrypt for password hashing
- PostGIS for geospatial data

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Cypress-Application
   ```

2. **Set up Supabase**
   - Create a Supabase project
   - Run the SQL schema from `server/simple-supabase-schema.sql`
   - Get your API keys

3. **Configure environment variables**
   ```bash
   # In server/.env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd server && npm install
   
   # Frontend
   cd client && npm install
   ```

5. **Start the application**
   ```bash
   # Backend (Terminal 1)
   cd server && npm run dev
   
   # Frontend (Terminal 2)
   cd client && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3002
   - Backend API: http://localhost:5050
   - Admin Login: admin@cypress.com / admin123

## Database Schema

The application uses Supabase with the following main tables:
- `users` - User profiles (extends Supabase auth)
- `admins` - Administrative users
- `reports` - Community problem reports with geospatial data

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login

### Reports
- `GET /api/reports/mine` - User's reports
- `POST /api/reports` - Create report
- `GET /api/admin/reports` - All reports (admin)
- `PATCH /api/admin/reports/:id/status` - Update report status

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.