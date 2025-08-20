# Books Shop API - Docker Commands

# Default target
.PHONY: help
help:
	@echo "📚 Books Shop API - Available Docker Commands:"
	@echo ""
	@echo "🚀 Development:"
	@echo "  make dev         - Start development environment"
	@echo "  make dev-logs    - View development logs"
	@echo "  make dev-down    - Stop development environment"
	@echo ""
	@echo "🏭 Production:"
	@echo "  make prod        - Start production environment"
	@echo "  make prod-logs   - View production logs"
	@echo "  make prod-down   - Stop production environment"
	@echo ""
	@echo "🗄️  Database:"
	@echo "  make migrate     - Run database migrations"
	@echo "  make seed        - Seed database with sample data"
	@echo "  make db-shell    - Connect to PostgreSQL shell"
	@echo "  make redis-cli   - Connect to Redis CLI"
	@echo ""
	@echo "🧪 Testing & Development:"
	@echo "  make test        - Run tests in development container"
	@echo "  make shell       - Get shell access to dev container"
	@echo "  make shell-prod  - Get shell access to production container"
	@echo "  make build       - Build all images"
	@echo "  make clean       - Clean up containers and images"
	@echo ""
	@echo "📊 Monitoring:"
	@echo "  make status      - Show container status"
	@echo "  make logs        - View all logs"

# Development environment
.PHONY: dev
dev:
	docker-compose --profile dev up -d

.PHONY: dev-logs
dev-logs:
	docker-compose --profile dev logs -f app-dev

.PHONY: dev-down
dev-down:
	docker-compose --profile dev down

# Production environment
.PHONY: prod
prod:
	docker-compose up -d app

.PHONY: prod-logs
prod-logs:
	docker-compose logs -f app

.PHONY: prod-down
prod-down:
	docker-compose down

# Database operations
.PHONY: migrate
migrate:
	docker-compose --profile migration run --rm migrator

.PHONY: seed
seed:
	docker-compose --profile seeding run --rm seeder

.PHONY: db-shell
db-shell:
	docker-compose exec postgres psql -U books_user -d books_shop

.PHONY: redis-cli
redis-cli:
	docker-compose exec redis redis-cli -a redis_password_123

# Testing and development
.PHONY: test
test:
	docker-compose run --rm app-dev npm test

.PHONY: shell
shell:
	docker-compose exec app-dev sh

.PHONY: shell-prod
shell-prod:
	docker-compose exec app sh

.PHONY: build
build:
	docker-compose build

# Cleanup
.PHONY: clean
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Monitoring
.PHONY: status
status:
	docker-compose ps

.PHONY: logs
logs:
	docker-compose logs -f

# Complete setup (for first time)
.PHONY: setup
setup: build migrate seed prod
	@echo "✅ Books Shop API is ready!"
	@echo "🌐 Production API: http://localhost:8000"
	@echo "📋 API Documentation: http://localhost:8000/api"
	@echo "🔍 Health Check: http://localhost:8000/health"

# Complete development setup
.PHONY: setup-dev
setup-dev: build migrate seed dev
	@echo "✅ Books Shop API development environment is ready!"
	@echo "🌐 Development API: http://localhost:8002"
	@echo "📋 API Documentation: http://localhost:8002/api"
	@echo "🔍 Health Check: http://localhost:8002/health"