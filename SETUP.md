# Modern CRM Project Setup Guide

This guide will help you set up the development environment for the Modern CRM project, which integrates Twenty CRM with Webstudio visual website builder.

## Prerequisites

### Required Software
- **Node.js**: Version 22.12.0 (for Twenty CRM)
- **Node.js**: Version 20 (for Webstudio) 
- **Package Managers**:
  - Yarn 4.0.2+ (for Twenty CRM)
  - pnpm 9.14.0+ (for Webstudio)
- **Docker** (for databases)
- **Git**

### Environment Setup

1. **Install Node Version Manager (nvm)**
   ```bash
   # Install nvm (if not already installed)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Reload shell
   source ~/.bashrc  # or ~/.zshrc
   ```

2. **Install Required Node.js Versions**
   ```bash
   # Install Node.js 22.12.0 for Twenty CRM
   nvm install 22.12.0
   
   # Install Node.js 20 for Webstudio
   nvm install 20
   ```

3. **Install Package Managers**
   ```bash
   # Install Yarn 4.x globally
   npm install -g yarn
   
   # Install pnpm globally
   npm install -g pnpm@9.14.4
   ```

4. **Install Docker**
   - Download and install Docker Desktop from https://www.docker.com/products/docker-desktop/
   - Ensure Docker is running

## Project Structure

```
modernCRM/
├── README.md                    # Project overview
├── SETUP.md                     # This setup guide
├── docker-compose.yml           # Database services
├── docs/                        # Documentation
│   └── prd.md                  # Product Requirements Document
├── architecture/                # Architecture documentation
│   └── modernCRMarchitecture.md
├── specs/                       # Additional specifications
│   └── storyarc-prd.md
├── twenty/                      # Twenty CRM repository
├── webstudio/                   # Webstudio repository
└── integration/                 # Our custom integration code
    ├── plugins/                 # Plugin definitions
    ├── ai-service/             # Gemini AI integration
    ├── shared-tokens/          # Design system mapping
    └── config/                 # Configuration files
```

## Setup Steps

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis containers
docker compose up -d

# Verify services are running
docker compose ps
```

This will start:
- **moderncrm-postgres**: Main integration database (port 5432)
- **twenty-postgres**: Twenty CRM database (port 5433)
- **webstudio-postgres**: Webstudio database (port 5434)
- **moderncrm-redis**: Redis cache (port 6379)

### 2. Setup Twenty CRM

```bash
# Navigate to Twenty CRM directory
cd twenty

# Use Node.js 22.12.0
nvm use 22.12.0

# Install dependencies
yarn install

# Copy environment template
cp .env.example .env

# Edit .env file with database configuration:
# DATABASE_URL=postgresql://twenty:twenty@localhost:5433/twenty
# REDIS_URL=redis://localhost:6379

# Run database migrations
yarn database:migrate

# Start Twenty CRM in development mode
yarn start
```

Twenty CRM will be available at: http://localhost:3000

### 3. Setup Webstudio

```bash
# Navigate to Webstudio directory (in new terminal)
cd webstudio

# Use Node.js 20
nvm use 20

# Install dependencies
pnpm install

# Copy environment template (if exists)
cp .env.example .env || touch .env

# Edit .env file with database configuration:
# DATABASE_URL=postgresql://webstudio:webstudio@localhost:5434/webstudio

# Start Webstudio in development mode
pnpm dev
```

Webstudio will be available at: http://localhost:3001 (or check terminal output)

### 4. Setup AI Integration

```bash
# Create Gemini API configuration
cd integration/config

# Create environment file for AI service
cat > .env.ai << EOF
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CONTEXT_WINDOW_SIZE=1000000
EOF
```

### 5. Verify Setup

1. **Check Twenty CRM**: Visit http://localhost:3000
2. **Check Webstudio**: Visit http://localhost:3001
3. **Check Databases**: 
   ```bash
   # Test database connections
   docker exec -it twenty-postgres psql -U twenty -d twenty -c "SELECT version();"
   docker exec -it webstudio-postgres psql -U webstudio -d webstudio -c "SELECT version();"
   docker exec -it moderncrm-redis redis-cli ping
   ```

## Development Workflow

### Daily Development
1. Start Docker services: `docker compose up -d`
2. Start Twenty CRM: `cd twenty && nvm use 22.12.0 && yarn start`
3. Start Webstudio: `cd webstudio && nvm use 20 && pnpm dev`

### Integration Development
- Work in the `integration/` directory for custom code
- Follow the sprint plan outlined in the PRD
- Use the architecture document for technical guidance

## Troubleshooting

### Common Issues

1. **Node.js Version Conflicts**
   - Always use `nvm use` in each terminal
   - Check current version: `node --version`

2. **Port Conflicts**
   - Twenty CRM: 3000
   - Webstudio: 3001 (may vary)
   - PostgreSQL: 5432, 5433, 5434
   - Redis: 6379

3. **Database Connection Issues**
   - Ensure Docker containers are running: `docker compose ps`
   - Check logs: `docker compose logs postgres`

4. **Package Installation Issues**
   - Clear caches: `yarn cache clean` or `pnpm store prune`
   - Delete node_modules and reinstall

### Getting Help
- Check the PRD document for project requirements
- Review architecture documentation for technical details
- Consult individual project READMEs in twenty/ and webstudio/

## Next Steps

Once the environment is set up:
1. Review the PRD and architecture documents
2. Start with Sprint 1: Plugin Architecture & Integration
3. Follow the development timeline outlined in the PRD
4. Begin with integrating Webstudio as a plugin within Twenty's Nx monorepo

## Environment Variables Reference

### Twenty CRM (.env)
```
DATABASE_URL=postgresql://twenty:twenty@localhost:5433/twenty
REDIS_URL=redis://localhost:6379
FRONT_BASE_URL=http://localhost:3000
SERVER_URL=http://localhost:3000
```

### Webstudio (.env)
```
DATABASE_URL=postgresql://webstudio:webstudio@localhost:5434/webstudio
```

### AI Integration (integration/config/.env.ai)
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CONTEXT_WINDOW_SIZE=1000000
