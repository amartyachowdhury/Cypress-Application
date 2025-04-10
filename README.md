# Cypress - Community Problem Reporting Application

A full-stack web application that allows citizens to report and track local issues in their community. Built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### User Features
- 🔐 User Authentication
- 📝 Submit Reports with Location
- 🗺️ Interactive Map View
- 📊 Personal Report Management
- 📱 Responsive Design

### Admin Features
- 👑 Secure Admin Panel
- 📋 View All Reports
- 🔄 Update Report Status
- 📊 Report Management

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- Leaflet for maps

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/amartyachowdhury/Cypress-Application.git
cd Cypress-Application
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd client
npm install
```

3. Set up environment variables
```bash
# In the server directory, create a .env file with:
MONGO_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
PORT=5050

# In the client directory, create a .env file with:
VITE_API_URL=http://localhost:5050
```

4. Start the development servers
```bash
# Start backend server (from server/ directory)
npm run dev

# Start frontend server (from client/ directory)
npm run dev
```

5. Access the application
- Frontend: http://localhost:3000
- Backend: http://localhost:5050

## Project Structure

Cypress-Application/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── admin/         # Admin components
│   │   ├── components/    # Reusable components
│   │   ├── layouts/       # Layout components
│   │   └── pages/        # Page components
│   └── public/           # Static files
│
└── server/               # Backend Node.js application
    ├── controllers/      # Route controllers
    ├── middleware/       # Custom middleware
    ├── models/          # Mongoose models
    └── routes/          # API routes
```

## API Endpoints

### Public Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login

### Protected Routes
- `GET /api/reports` - Get user's reports
- `POST /api/reports` - Create new report
- `GET /api/admin/reports` - Get all reports (admin only)
- `PATCH /api/admin/reports/:id/status` - Update report status (admin only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

