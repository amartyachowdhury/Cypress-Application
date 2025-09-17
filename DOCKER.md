# Docker Setup for Cypress Application

This guide will help you run the Cypress Community Problem Reporting Application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd Cypress-Application
   ```

2. **Start all services:**
   ```bash
   ./docker-scripts.sh start
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5050
   - Admin Panel: http://localhost:3000/admin/login

## Available Commands

Use the provided script for easy management:

```bash
# Start all services
./docker-scripts.sh start

# Stop all services
./docker-scripts.sh stop

# Restart all services
./docker-scripts.sh restart

# View logs
./docker-scripts.sh logs
./docker-scripts.sh logs server  # View specific service logs

# Check service status
./docker-scripts.sh status

# Run database migrations
./docker-scripts.sh migrate

# Clean up everything
./docker-scripts.sh cleanup

# Show help
./docker-scripts.sh help
```

## Manual Docker Commands

If you prefer to use Docker commands directly:

```bash
# Build and start all services
docker-compose up --build -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build -d server

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Access server container
docker-compose exec server sh
```

## Services

The application consists of the following services:

### 1. MongoDB Database
- **Port:** 27017
- **Database:** cypress_tracker
- **Username:** admin
- **Password:** password123
- **Volume:** mongodb_data

### 2. Backend Server
- **Port:** 5050
- **Environment:** Production
- **Dependencies:** MongoDB
- **Volume:** ./server/uploads

### 3. Frontend Client
- **Port:** 3000 (mapped to 80 in container)
- **Web Server:** Nginx
- **Dependencies:** Backend Server

### 4. Redis (Optional)
- **Port:** 6379
- **Purpose:** Caching and session storage
- **Volume:** redis_data

## Environment Variables

The application uses the following environment variables (configured in docker-compose.yml):

```env
NODE_ENV=production
PORT=5050
MONGO_URI=mongodb://admin:password123@mongodb:27017/cypress_tracker?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
VITE_API_URL=http://localhost:5050/api
```

## Default Admin Credentials

- **Email:** admin@cypress.com
- **Password:** admin123

## Development vs Production

### Development Mode
To run in development mode with hot reloading:

```bash
# Start only the database
docker-compose up -d mongodb redis

# Run the application locally
npm run dev
```

### Production Mode
The Docker setup is configured for production with:
- Optimized builds
- Nginx for serving static files
- Health checks
- Proper logging
- Security headers

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5050
   
   # Kill the process or change ports in docker-compose.yml
   ```

2. **MongoDB connection issues:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

3. **Build failures:**
   ```bash
   # Clean build
   docker-compose down
   docker system prune -f
   docker-compose up --build -d
   ```

4. **Permission issues:**
   ```bash
   # Fix script permissions
   chmod +x docker-scripts.sh
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb

# Access container shell
docker-compose exec server sh
docker-compose exec client sh
```

### Database Management

```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123

# Create admin user manually
docker-compose exec server npm run create-admin

# Backup database
docker-compose exec mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db cypress_tracker --out /backup

# Restore database
docker-compose exec mongodb mongorestore --username admin --password password123 --authenticationDatabase admin --db cypress_tracker /backup/cypress_tracker
```

## Security Considerations

For production deployment:

1. **Change default passwords:**
   - Update MongoDB credentials
   - Change JWT secret
   - Update admin credentials

2. **Use environment files:**
   ```bash
   # Create production .env file
   cp env.example .env.production
   # Edit with production values
   ```

3. **Enable HTTPS:**
   - Configure SSL certificates
   - Update CORS origins
   - Use secure cookies

4. **Network security:**
   - Use Docker networks
   - Configure firewalls
   - Limit exposed ports

## Monitoring and Health Checks

The application includes health checks for all services:

- **Server:** http://localhost:5050/health
- **Client:** http://localhost:3000 (Nginx health check)
- **MongoDB:** Built-in health check
- **Redis:** Built-in health check

## Performance Optimization

1. **Resource limits:**
   ```yaml
   # Add to docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

2. **Caching:**
   - Redis for session storage
   - Nginx for static file caching
   - MongoDB query optimization

3. **Scaling:**
   ```bash
   # Scale services
   docker-compose up --scale server=3 -d
   ```

## Backup and Recovery

```bash
# Backup volumes
docker run --rm -v cypress-application_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v cypress-application_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## Support

If you encounter issues:

1. Check the logs: `./docker-scripts.sh logs`
2. Verify all services are running: `./docker-scripts.sh status`
3. Try restarting: `./docker-scripts.sh restart`
4. Clean rebuild: `./docker-scripts.sh cleanup && ./docker-scripts.sh start`
