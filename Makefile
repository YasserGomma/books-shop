.PHONY: help install dev dev-frontend dev-backend build test lint clean setup stop logs

# Default target
help: ## Show this help message
	@echo "Books Shop - Full Stack Development Commands"
	@echo "==========================================="
	@echo ""
	@echo "Quick Start:"
	@echo "  make setup     - Install all dependencies and set up the project"
	@echo "  make dev       - Run both frontend and backend (auto-creates DB if needed)"
	@echo "  make fresh-install - Complete fresh installation with database setup"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Setup and Installation
setup: ## Install all dependencies for both frontend and backend
	@echo "🚀 Setting up Books Shop project..."
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "✅ Setup complete! Run 'make dev' to start development"

install: setup ## Alias for setup

# Development
dev: ## Run both frontend and backend in parallel
	@echo "🚀 Starting Books Shop development servers..."
	@echo "🗄️  Initializing database if needed..."
	@cd backend && npm run db:init
	@echo "📱 Frontend: http://localhost:4000"
	@echo "🔌 Backend: http://localhost:8000/api"
	@echo ""
	@echo "Press Ctrl+C to stop all services"
	@trap 'echo "\n🛑 Stopping all services..."; kill 0' INT; \
	make dev-backend & \
	make dev-frontend & \
	wait

dev-frontend: ## Run only the frontend development server
	@echo "📱 Starting frontend development server..."
	cd frontend && PORT=4000 npm run dev

dev-backend: ## Run only the backend development server
	@echo "🔌 Starting backend development server..."
	cd backend && PORT=8000 npm run dev

dev-docker: ## Run backend with Docker and frontend locally
	@echo "🚀 Starting Books Shop with Docker backend..."
	@echo "🐳 Backend (Docker): http://localhost:8000/api"
	@echo "📱 Frontend: http://localhost:4000"
	@echo ""
	@trap 'echo "\n🛑 Stopping all services..."; make stop-docker' INT; \
	cd backend && make setup & \
	sleep 10 && cd frontend && PORT=4000 npm run dev & \
	wait

# Building
build: ## Build both frontend and backend for production
	@echo "🏗️  Building Books Shop for production..."
	@echo "🔧 Building backend..."
	cd backend && npm run build
	@echo "🔧 Building frontend..."
	cd frontend && npm run build
	@echo "✅ Build complete!"

build-frontend: ## Build only the frontend
	@echo "🔧 Building frontend..."
	cd frontend && npm run build

build-backend: ## Build only the backend
	@echo "🔧 Building backend..."
	cd backend && npm run build

# Testing
test: ## Run tests for both frontend and backend
	@echo "🧪 Running all tests..."
	@echo "🔍 Testing backend..."
	cd backend && npm test
	@echo "🔍 Testing frontend..."
	cd frontend && npm run test:run
	@echo "✅ All tests complete!"

test-frontend: ## Run only frontend tests
	@echo "🔍 Testing frontend..."
	cd frontend && npm run test:run

test-backend: ## Run only backend tests
	@echo "🔍 Testing backend..."
	cd backend && npm test

test-coverage: ## Run tests with coverage reports
	@echo "📊 Running tests with coverage..."
	cd backend && npm run test:coverage
	cd frontend && npm run test:coverage

# Code Quality
lint: ## Run linting for both frontend and backend
	@echo "🔍 Linting all code..."
	@echo "🔧 Linting backend..."
	cd backend && npm run lint
	@echo "🔧 Linting frontend..."
	cd frontend && npm run lint
	@echo "✅ Linting complete!"

lint-fix: ## Fix linting issues for both frontend and backend
	@echo "🔧 Fixing linting issues..."
	cd backend && npm run lint:fix
	cd frontend && npm run lint:fix

format: ## Format code for both frontend and backend
	@echo "💅 Formatting code..."
	cd backend && npm run format
	cd frontend && npm run format

typecheck: ## Run TypeScript type checking
	@echo "🔍 Type checking..."
	cd backend && npm run typecheck
	cd frontend && npm run typecheck

# Database (Backend)
db-init: ## Initialize database (create, migrate, seed if needed)
	@echo "🗄️  Initializing database..."
	cd backend && npm run db:init

db-setup: ## Set up database with migrations and seeding
	@echo "🗄️  Setting up database..."
	cd backend && npm run db:migrate && npm run db:seed-prod

db-reset: ## Reset database (migrate + seed with production data)
	@echo "🔄 Resetting database..."
	cd backend && npm run db:migrate && npm run db:seed-prod

db-migrate: ## Run database migrations
	cd backend && npm run db:migrate

db-seed: ## Seed database with sample data
	cd backend && npm run db:seed

db-seed-prod: ## Seed database with multilingual production data
	cd backend && npm run db:seed-prod

# Docker Operations
docker-up: ## Start backend services with Docker
	@echo "🐳 Starting backend services with Docker..."
	cd backend && docker-compose up -d

docker-down: ## Stop Docker services
	@echo "🛑 Stopping Docker services..."
	cd backend && docker-compose down

docker-logs: ## Show Docker logs
	cd backend && docker-compose logs -f

stop-docker: ## Stop Docker services (alias for docker-down)
	make docker-down

# Cleanup
clean: ## Clean all node_modules and build artifacts
	@echo "🧹 Cleaning project..."
	rm -rf frontend/node_modules frontend/.next frontend/dist
	rm -rf backend/node_modules backend/dist backend/.next
	@echo "✅ Cleanup complete!"

clean-frontend: ## Clean only frontend artifacts
	@echo "🧹 Cleaning frontend..."
	rm -rf frontend/node_modules frontend/.next frontend/dist

clean-backend: ## Clean only backend artifacts
	@echo "🧹 Cleaning backend..."
	rm -rf backend/node_modules backend/dist

# Production
start: ## Start production servers
	@echo "🚀 Starting production servers..."
	@trap 'echo "\n🛑 Stopping production servers..."; kill 0' INT; \
	cd backend && npm start & \
	cd frontend && npm start & \
	wait

# Logs
logs: ## Show logs from running services
	@echo "📄 Showing logs..."
	@echo "Use Ctrl+C to exit"
	@ps aux | grep -E "(next|node)" | grep -v grep || echo "No services running"

# Health Check
health: ## Check if services are running
	@echo "🏥 Health check..."
	@echo "Frontend (http://localhost:4000):"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:4000 2>/dev/null || echo "❌ Not running"
	@echo ""
	@echo "Backend (http://localhost:8000/api):"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api 2>/dev/null || echo "❌ Not running"

# Quick Commands
quick-start: setup dev ## Complete setup and start development (alias for setup + dev)

# Environment
env-setup: ## Create environment files from examples
	@echo "📝 Setting up environment files..."
	@if [ ! -f frontend/.env.local ]; then \
		cp frontend/.env.local.example frontend/.env.local 2>/dev/null || \
		echo "NEXTAUTH_URL=http://localhost:4000\nNEXTAUTH_SECRET=your-secret-key-here" > frontend/.env.local; \
		echo "✅ Created frontend/.env.local"; \
	fi
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env 2>/dev/null || \
		echo "DATABASE_URL=postgresql://postgres:password@localhost:5432/books_shop\nREDIS_URL=redis://localhost:6379\nJWT_SECRET=your-jwt-secret\nNODE_ENV=development\nPORT=8000" > backend/.env; \
		echo "✅ Created backend/.env"; \
	fi

# Status
status: ## Show project status and useful information
	@echo "📊 Books Shop Project Status"
	@echo "=========================="
	@echo ""
	@echo "Frontend:"
	@echo "  Location: ./frontend/"
	@echo "  URL: http://localhost:4000"
	@echo "  Package.json: $(shell test -f frontend/package.json && echo "✅ Found" || echo "❌ Missing")"
	@echo "  Dependencies: $(shell test -d frontend/node_modules && echo "✅ Installed" || echo "❌ Not installed")"
	@echo ""
	@echo "Backend:"
	@echo "  Location: ./backend/"
	@echo "  URL: http://localhost:8000/api"
	@echo "  Package.json: $(shell test -f backend/package.json && echo "✅ Found" || echo "❌ Missing")"
	@echo "  Dependencies: $(shell test -d backend/node_modules && echo "✅ Installed" || echo "❌ Not installed")"
	@echo ""
	@echo "Environment:"
	@echo "  Frontend .env: $(shell test -f frontend/.env.local && echo "✅ Found" || echo "❌ Missing")"
	@echo "  Backend .env: $(shell test -f backend/.env && echo "✅ Found" || echo "❌ Missing")"
	@echo ""
	@echo "Quick commands:"
	@echo "  make setup     - Install dependencies"
	@echo "  make dev       - Start development"
	@echo "  make test      - Run all tests"
	@echo "  make build     - Build for production"

# Development workflow helpers
fresh-start: clean setup dev ## Clean everything and start fresh

fresh-install: clean setup db-init dev ## Complete fresh installation with database setup

# Git helpers
commit-check: lint test ## Run linting and tests before committing
	@echo "✅ Ready to commit!"

# Documentation
docs: ## Open documentation
	@echo "📚 Books Shop Documentation"
	@echo "========================="
	@echo ""
	@echo "Main README: ./README.md"
	@echo "Frontend: ./frontend/README.md"
	@echo "Backend: ./backend/README.md"
	@echo ""
	@echo "API Documentation:"
	@echo "  Backend API: http://localhost:8000/api"
	@echo ""
	@echo "Frontend Login:"
	@echo "  Email: admin@books.com"
	@echo "  Password: admin123"