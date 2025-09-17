#!/bin/bash

# Docker management scripts for Cypress Application

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build and start all services
start_all() {
    print_status "Starting Cypress Application with Docker..."
    check_docker
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from example..."
        cp env.example .env
    fi
    
    # Build and start services
    print_status "Building and starting services..."
    docker-compose up --build -d
    
    print_success "All services started successfully!"
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5050"
    echo "  MongoDB:  mongodb://localhost:27017"
    echo "  Redis:    redis://localhost:6379"
    echo ""
    print_status "Admin credentials:"
    echo "  Email:    admin@cypress.com"
    echo "  Password: admin123"
}

# Function to stop all services
stop_all() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped!"
}

# Function to restart all services
restart_all() {
    print_status "Restarting all services..."
    docker-compose down
    docker-compose up --build -d
    print_success "All services restarted!"
}

# Function to view logs
view_logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Function to clean up
cleanup() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to run database migrations
migrate() {
    print_status "Running database migrations..."
    docker-compose exec server npm run create-admin
    print_success "Database migrations completed!"
}

# Function to show status
status() {
    print_status "Service Status:"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Cypress Application Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services"
    echo "  stop      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      View logs (optionally specify service name)"
    echo "  status    Show service status"
    echo "  migrate   Run database migrations"
    echo "  cleanup   Remove all containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs server"
    echo "  $0 migrate"
}

# Main script logic
case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    logs)
        view_logs "$2"
        ;;
    status)
        status
        ;;
    migrate)
        migrate
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
