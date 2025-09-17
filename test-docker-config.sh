#!/bin/bash

# Test Docker configuration without running containers
echo "Testing Docker configuration..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "⚠️  Docker daemon is not running. Please start Docker Desktop."
    echo "   You can still test the configuration files."
fi

echo "✅ Docker and Docker Compose are installed"

# Validate docker-compose.yml syntax
echo "Validating docker-compose.yml..."
if docker-compose config &> /dev/null; then
    echo "✅ docker-compose.yml is valid"
else
    echo "❌ docker-compose.yml has syntax errors"
    docker-compose config
    exit 1
fi

# Check if all required files exist
echo "Checking required files..."

files=(
    "server/Dockerfile"
    "client/Dockerfile"
    "client/nginx.conf"
    "mongo-init.js"
    "env.example"
    "docker-compose.yml"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
    fi
done

# Check Dockerfile syntax
echo "Checking Dockerfile syntax..."

# Server Dockerfile
if [ -f "server/Dockerfile" ]; then
    echo "✅ server/Dockerfile exists"
    if grep -q "FROM node:" server/Dockerfile; then
        echo "✅ server/Dockerfile has valid FROM instruction"
    else
        echo "❌ server/Dockerfile missing FROM instruction"
    fi
fi

# Client Dockerfile
if [ -f "client/Dockerfile" ]; then
    echo "✅ client/Dockerfile exists"
    if grep -q "FROM node:" client/Dockerfile && grep -q "FROM nginx:" client/Dockerfile; then
        echo "✅ client/Dockerfile has multi-stage build"
    else
        echo "❌ client/Dockerfile missing multi-stage build"
    fi
fi

echo ""
echo "🎉 Docker configuration test completed!"
echo ""
echo "To start the application:"
echo "1. Start Docker Desktop"
echo "2. Run: ./docker-scripts.sh start"
echo ""
echo "To test without Docker:"
echo "1. Install MongoDB locally"
echo "2. Run: npm run dev"
