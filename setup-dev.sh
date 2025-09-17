#!/bin/bash

# Development setup script for Cypress Application
# This script sets up the development environment without Docker

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if MongoDB is installed
check_mongodb() {
    if ! command -v mongod &> /dev/null; then
        print_warning "MongoDB is not installed locally."
        print_status "You can:"
        print_status "1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/"
        print_status "2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
        print_status "3. Use Docker: ./docker-scripts.sh start"
        echo ""
        read -p "Do you want to continue without MongoDB? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "MongoDB is installed"
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    if [ -f "package.json" ]; then
        print_status "Installing root dependencies..."
        npm install
    fi
    
    # Install server dependencies
    if [ -d "server" ]; then
        print_status "Installing server dependencies..."
        cd server
        npm install
        cd ..
    fi
    
    # Install client dependencies
    if [ -d "client" ]; then
        print_status "Installing client dependencies..."
        cd client
        npm install
        cd ..
    fi
    
    print_success "Dependencies installed successfully"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Server environment
    if [ ! -f "server/.env" ]; then
        if [ -f "env.example" ]; then
            print_status "Creating server/.env from env.example..."
            cp env.example server/.env
        else
            print_status "Creating server/.env with default values..."
            cat > server/.env << EOF
NODE_ENV=development
PORT=5050
MONGO_URI=mongodb://localhost:27017/cypress_tracker
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@cypress.com
ADMIN_PASSWORD=admin123
EOF
        fi
    fi
    
    # Client environment
    if [ ! -f "client/.env" ]; then
        print_status "Creating client/.env..."
        cat > client/.env << EOF
VITE_API_URL=http://localhost:5050/api
EOF
    fi
    
    print_success "Environment files created"
}

# Create admin user
create_admin() {
    print_status "Creating admin user..."
    
    if [ -f "server/scripts/createAdmin.js" ]; then
        cd server
        node scripts/createAdmin.js
        cd ..
        print_success "Admin user created"
    else
        print_warning "Admin creation script not found"
    fi
}

# Start MongoDB (if installed locally)
start_mongodb() {
    if command -v mongod &> /dev/null; then
        print_status "Starting MongoDB..."
        
        # Check if MongoDB is already running
        if pgrep -x "mongod" > /dev/null; then
            print_success "MongoDB is already running"
        else
            # Start MongoDB in background
            mongod --dbpath ./data/db --fork --logpath ./data/mongodb.log
            print_success "MongoDB started"
        fi
    fi
}

# Main setup function
main() {
    echo "🚀 Setting up Cypress Application for development..."
    echo ""
    
    check_node
    check_mongodb
    install_dependencies
    setup_env
    
    # Create data directory for MongoDB
    mkdir -p data/db
    
    start_mongodb
    create_admin
    
    echo ""
    print_success "Development setup completed!"
    echo ""
    print_status "To start the application:"
    echo "  npm run dev"
    echo ""
    print_status "Or start services individually:"
    echo "  npm run server:dev  # Backend only"
    echo "  npm run client:dev  # Frontend only"
    echo ""
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5050"
    echo "  Admin:    http://localhost:3000/admin/login"
    echo ""
    print_status "Admin credentials:"
    echo "  Email:    admin@cypress.com"
    echo "  Password: admin123"
    echo ""
    print_status "To stop MongoDB (if started locally):"
    echo "  pkill mongod"
}

# Run main function
main "$@"
