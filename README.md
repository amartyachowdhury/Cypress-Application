# Cypress - Community Problem Reporting Application

A full-stack web application that allows citizens to report and track local issues in their community. Built with modern web technologies and MongoDB.

## Features

### User Features
- 🔐 User Authentication (JWT)
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
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Geospatial queries for location data

## Project Structure

```
Cypress-Application/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── admin/            # Admin components
│   │   ├── components/       # Reusable UI components
│   │   ├── constants/        # Application constants
│   │   ├── contexts/         # React contexts
│   │   ├── layouts/          # Layout components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── public/               # Static files
│   └── package.json
│
├── server/                   # Backend Node.js application
│   ├── config/              # Configuration files
│   ├── constants/           # Application constants
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── scripts/             # Utility scripts
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── validations/         # Input validation schemas
│   └── server.js            # Main server file
│
├── package.json             # Root package.json with scripts
└── README.md
```


### Prerequisites
- Node.js (v14 or higher)
- MongoDB or Supabase account
- npm or yarn

## Quick Start with Docker

The easiest way to run the application is using Docker:

```bash
# Clone the repository
git clone <your-repo-url>
cd Cypress-Application

# Start all services with Docker
./docker-scripts.sh start

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5050
# Admin: http://localhost:3000/admin/login
```

**Default Admin Credentials:**
- Email: admin@cypress.com
- Password: admin123

For detailed Docker setup instructions, see [DOCKER.md](DOCKER.md).

## Manual Installation

If you prefer to run without Docker:

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Cypress-Application
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**
   ```bash
   # Copy environment files
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers:**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run server:dev  # Backend only
   npm run client:dev  # Frontend only
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5050

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 