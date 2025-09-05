# Development Guide

## Project Architecture

This project follows a clean architecture pattern with clear separation of concerns:

### Backend Architecture
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define data structures and database schemas
- **Middleware**: Handle cross-cutting concerns (auth, validation, error handling)
- **Routes**: Define API endpoints
- **Config**: Application configuration
- **Constants**: Application-wide constants
- **Validations**: Input validation schemas

### Frontend Architecture
- **Components**: Reusable UI components
- **Pages**: Route-level components
- **Layouts**: Layout wrapper components
- **Services**: API communication layer
- **Contexts**: React context providers
- **Constants**: Application constants
- **Utils**: Utility functions

## Development Workflow

### 1. Setting up the development environment

```bash
# Clone the repository
git clone <repository-url>
cd Cypress-Application

# Install all dependencies
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit the .env files with your configuration
```

### 2. Running the application

```bash
# Start both frontend and backend in development mode
npm run dev

# Or start individually
npm run server:dev  # Backend only
npm run client:dev  # Frontend only
```

### 3. Code organization guidelines

#### Backend
- Place business logic in services, not controllers
- Use middleware for cross-cutting concerns
- Validate all inputs using Joi schemas
- Handle errors consistently using the error handler middleware
- Use constants for magic strings and numbers

#### Frontend
- Keep components small and focused
- Use custom hooks for reusable logic
- Place API calls in services
- Use constants for configuration values
- Follow React best practices

### 4. Adding new features

1. **Backend**:
   - Create/update models if needed
   - Add validation schemas
   - Create service methods
   - Add controller methods
   - Define routes
   - Add tests

2. **Frontend**:
   - Create components
   - Add API service methods
   - Update routing if needed
   - Add constants if needed
   - Update contexts if needed

### 5. Database migrations

For schema changes:
1. Update the model
2. Create a migration script in `server/scripts/`
3. Test the migration
4. Update documentation

### 6. Testing

```bash
# Run backend tests
cd server && npm test

# Run frontend tests
cd client && npm test

# Run all tests
npm test
```

### 7. Code quality

- Use ESLint for code linting
- Use Prettier for code formatting
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Follow the existing code style

## Environment Variables

### Server (.env)
```env
PORT=5050
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/cypress-app
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5050
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_APP_NAME=Cypress - Community Problem Reporting Application
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/admin/login` - Admin login

### Reports
- `GET /api/reports` - Get user reports
- `POST /api/reports` - Create new report
- `GET /api/admin/reports` - Get all reports (admin)
- `PATCH /api/admin/reports/:id/status` - Update report status (admin)

## Deployment

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start production server
cd server && npm start
```

### Environment Setup
- Set `NODE_ENV=production`
- Use production database
- Set secure JWT secret
- Configure CORS for production domain

## Troubleshooting

### Common Issues

1. **Database connection issues**
   - Check MongoDB connection string
   - Ensure MongoDB is running
   - Verify network connectivity

2. **Authentication issues**
   - Check JWT secret configuration
   - Verify token expiration
   - Check CORS settings

3. **Build issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Resources

- [React Documentation](https://reactjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
