# Modern CRM Project

This repository contains comprehensive documentation for a modern CRM platform that integrates AI-powered website building capabilities. The project combines two powerful open-source platforms to create a unified solution for agencies and businesses.

## Project Overview

The Modern CRM project aims to build a modular CRM platform that integrates:

- **[Twenty CRM](https://github.com/twentyhq/twenty)** - An open-source, metadata-first, plugin-ready CRM platform
- **[Webstudio](https://github.com/webstudio-is/webstudio)** - An advanced visual website builder with AI prompt capabilities

The goal is to empower agencies to instantly generate CRM features or website modules through natural language prompts, eliminating the need for custom development.

## Repository Structure

```
├── README.md                           # This file
├── SETUP.md                           # Development environment setup guide
├── docker-compose.yml                 # Database services configuration
├── docs/
│   └── prd.md                         # Main Product Requirements Document
├── architecture/
│   └── modernCRMarchitecture.md       # Technical architecture documentation
├── specs/
│   └── storyarc-prd.md               # StoryArc narrative tool specification
├── twenty/                            # Twenty CRM repository (cloned)
├── webstudio/                         # Webstudio repository (cloned)
└── integration/                       # Custom integration code
    ├── ai-service/                    # Gemini AI integration
    ├── plugins/                       # Plugin definitions and registry
    ├── shared-tokens/                 # Design system mapping
    └── config/                        # Configuration files
```

## Key Documents

### 📄 [Product Requirements Document (PRD)](docs/prd.md)
The main PRD outlines the vision, goals, and technical requirements for the Modern CRM platform. It includes:
- Vision and purpose
- Target users and personas
- Core features organized into 5 epics
- Success metrics and timeline
- Technical dependencies and integration requirements

### 🏗️ [Architecture Document](architecture/modernCRMarchitecture.md)
Technical architecture documentation covering:
- Component breakdown (Frontend, Backend, AI & Code Generation)
- Data flow and state management
- Plugin isolation and modularity
- Security, resilience, and monitoring
- Data model definitions

### 📋 [StoryArc Specification](specs/storyarc-prd.md)
A separate product specification for StoryArc, a narrative design tool that provides:
- Visual timeline and kanban interfaces for story structure
- Hierarchical organization (Storyline → Arc → Scene → Beat)
- Character and location linking
- Template-based story frameworks

## Core Features

### Modern CRM Platform
- **AI-Prompt Interface**: Generate CRM features and website modules using natural language
- **Plugin Architecture**: Modular system supporting dynamic loading of new capabilities
- **Shared Design System**: Consistent UI/UX across CRM and website builder components
- **Metadata-Driven Data Binding**: Connect generated templates to CRM data
- **Real-time Collaboration**: Multi-user support with live updates

### Technology Stack
- **Frontend**: React, TypeScript, Nx monorepo
- **Backend**: NestJS, GraphQL, PostgreSQL, Redis
- **UI Components**: Emotion, Radix UI, Storybook
- **AI Integration**: OpenAI or custom LLM models
- **Authentication**: Extended CRM RBAC system

## Success Metrics
- Time from prompt to deploy: **< 5 minutes**
- UI compliance: **100% adherence** to shared design styling
- Zero runtime errors from generated modules in staging
- Support for **5+ distinct module types** (IDX pages, landing pages, forms, widgets)

## Timeline
The project is planned across 5 sprints (9 weeks total):
1. **Sprint 1-2**: Plugin architecture and Webstudio integration
2. **Sprint 3-4**: AI prompt interface and code generation
3. **Sprint 5**: Metadata binding and QA pipeline

## Getting Started

### Quick Start
1. **Setup Development Environment**: Follow the comprehensive [Setup Guide](SETUP.md) to configure Node.js, Docker, and both repositories
2. **Review Documentation**: Read the [PRD](docs/prd.md) and [Architecture Document](architecture/modernCRMarchitecture.md)
3. **Start Development**: Begin with Sprint 1 tasks outlined in the PRD

### Development Environment
- **Prerequisites**: Node.js 22.12.0 (Twenty) + Node.js 20 (Webstudio), Docker, Yarn 4.x, pnpm 9.x
- **Databases**: PostgreSQL + Redis via Docker Compose
- **AI Integration**: Gemini 2.5 Flash for code generation

### Current Status
✅ **Phase 1 Complete**: Repository setup, documentation, and integration architecture  
🔄 **Next Phase**: Plugin architecture implementation (Sprint 1)

The project includes:
- Cloned Twenty CRM and Webstudio repositories
- Docker Compose configuration for databases
- AI service integration with Gemini 2.5
- Plugin registry and design token mapping
- Comprehensive setup and development guides

## Contributing

This project integrates two major open-source platforms. Contributions should align with:
- Twenty CRM's plugin architecture and development patterns
- Webstudio's design token system and component structure
- The modular, AI-first approach outlined in the PRD

## License

This project builds upon:
- Twenty CRM (MIT License)
- Webstudio (AGPL License)

Please review the licensing requirements of both platforms when contributing or deploying.
