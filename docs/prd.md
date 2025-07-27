# 📄 Product Requirements Document (PRD)

> **⚠️ IMPORTANT**: All development work on this project must follow the [Senior Engineer Task Execution Rule](./senior-engineer-rule.md). This rule must be referenced before starting any task and after completing any changes.

## 1. Vision & Purpose
- **Purpose**: Build a modular CRM platform that integrates a high-end visual website builder, powered by AI-based natural-language prompts.    
- **Goal**: Empower agencies to instantly generate CRM features or website modules (e.g. IDX-enabled real estate pages) without waiting for custom development.    
- **Value Proposition**: Seamless UX/UI by merging:  
  - **Twenty CRM** ([github.com/twentyhq/twenty](https://github.com/twentyhq/twenty)) – an open-source, metadata-first, plugin-ready CRM platform built with TypeScript, Nx, React, NestJS, GraphQL, PostgreSQL & Redis    
  - **Webstudio visual website builder** ([github.com/webstudio-is/webstudio](https://github.com/webstudio-is/webstudio)) – an AGPL‑licensed advanced visual editor featuring drag‑and‑drop UI, CSS tokens, headless CMS integration, and early-stage AI prompt capabilities

## 2. Repositories & Codebases    
- **Twenty CRM** (`https://github.com/twentyhq/twenty`) – Modern Open-Source CRM designed for extensibility, with strong developer experience, customizable objects and workflows    
- **Webstudio Builder** (`https://github.com/webstudio-is/webstudio`) – High-end visual builder designed to connect to any headless CMS, support full CSS control, and enable prompt-based page creation

## 3. Target Users & Personas    
- **Agency Operators**: Describe desired features via prompts; instantly generate modules without dev resources.    
- **CRM Administrators**: Manage and configure plugins, templates, and workflows.    
- **Developers / Plugin Creators**: Build new modules using a clear and consistent plugin framework.

## 4. Core Features & Epics  

### Epic A: Plugin Architecture & Integration    
- Integrate **Webstudio** as a plugin via Nx monorepo or as a published NPM package.    
- Implement plugin loader for backend (GraphQL schemas, DB migrations, service controllers).    
- Expose builder via CRM route, e.g. `/website-builder`.

### Epic B: Shared Design System    
- Synchronize Webstudio's CSS tokens and style system with CRM's UI library.    
- Ensure consistent visual semantics across all UI elements (buttons, inputs, modals, forms).

### Epic C: AI-Prompt Interface for Feature Generation    
- Prompt input UI (text / optional voice) within CRM.    
- Backend endpoint `/api/prompt-generate` to relay prompts to an LLM/codegen engine.    
- Standardized output: blueprint JSON, code snippets, metadata.    
- Persist generated modules under a folder (e.g. `webstudio-plugin/generated/...`), update plugin manifest and auto-reload UI/backend.

### Epic D: Metadata-Driven Data Binding    
- Define CRM custom object type `WebTemplate` to store generated templates/pages.    
- Connect generated forms/pages to CRM data: contacts, accounts, workflows.    
- Log prompts and outcomes for audit and iterative refinement.

### Epic E: QA & Validation    
- Validate generated code: linting, syntax checks.    
- Visual consistency check against shared tokens.    
- Prompt-feedback loop for QA or user-triggered regeneration.

## 5. Success Metrics    
- Time from prompt to deploy: **< 5 minutes**    
- UI compliance: **100% adherence** to shared design styling    
- Zero runtime errors from generated modules in staging environments    
- Generated templates are accessible and editable in CRM dashboard    
- Support prompt generation for at least **5 distinct module types** (e.g. IDX page, landing page, CRM-integrated form, dashboard widget)

## 6. Architecture & System Workflow  

### 6.1 User Flow    
1. User logs into CRM → navigates to **Website Builder**    
2. Enters prompt: e.g. "Create IDX listing page with lead capture form"    
3. Backend sends prompt to LLM → receives blueprint    
4. System writes module under `webstudio-plugin/generated/...`    
5. `plugins.json` updates → plugin registry reloads frontend/backend    
6. Route like `/website-builder/generated/idx-listing` available    
7. Template is saved as CRM metadata and immediately editable

### 6.2 System Components    
- **Frontend**: CRM React app, Webstudio UI plugin, prompt input widget, generated-template dashboard    
- **Backend**: NestJS CRM core, prompt API endpoint, plugin registration service, metadata connector    
- **LLM & Code Generator**: Interface to OpenAI or internal model using flattened repo context    
- **Plugin Registry**: `plugins.json` manifest listing available modules and routes

### 6.3 Data Model    
- **WebTemplate** object schema:    
  `id`, `name`, `slug`, `template_type`, `schema`, `render_page`, `linked_crm_record`    
- **PromptLog** schema:    
  `prompt`, `generated_files`, `timestamp`, `status`, `feature_type`

## 7. Dependencies & Integration    
- GitHub repositories:    
  - Twenty CRM: `https://github.com/twentyhq/twenty`    
  - Webstudio Builder: `https://github.com/webstudio-is/webstudio`    
- Tools: Nx, TypeScript, React, NestJS, Emotion, Radix UI, Storybook    
- LLM Provider: OpenAI or local model    
- Database: PostgreSQL + Redis    
- Auth: Extend CRM RBAC to new plugin endpoints and UI routes

## 8. Risks & Mitigations    
- **AI‑generated code quality**: Enforced QA validation, standardized prompt templates, manual approval options    
- **Visual inconsistency**: Shared design token sandbox environment, live preview and style enforcement    
- **Plugin load failures**: Schema validation and fallback UI, robust registration logic    
- **Security vulnerability from code injection**: Sanitize prompts, sandbox generated modules, static analysis checks

## 9. Timeline & Milestones

| Sprint | Duration | Deliverables |  
|--------|----------|--------------|  
| Sprint 1 | 2 weeks | Scaffold plugin architecture; integrate Webstudio; sync design tokens |  
| Sprint 2 | 2 weeks | Prompt input UI + backend endpoint; test prompt round-trip |  
| Sprint 3 | 2 weeks | Code/config generation logic; module creation; plugin reload |  
| Sprint 4 | 2 weeks | Metadata binding; QA pipeline; visual compliance testing |  
| Sprint 5 | 1 week | Final QA; documentation; deployment rollout |

## 10. Roles & Stakeholders    
- **Product Owner**: Drives vision and PRD refinement    
- **Project Lead / Scrum Master**: Manages backlog, sprint planning    
- **Frontend Developer(s)**: Embeds Webstudio UI, crafts prompt widget    
- **Backend Developer(s)**: Builds prompt endpoint, plugin loader, metadata connector    
- **AI Specialist**: Designs prompt templates, manages LLM integration    
- **QA Engineer**: Validates generated code and visual consistency

---

## ✅ Summary    
This PRD explicitly references the GitHub repos your project will use:

- **Twenty CRM**: `https://github.com/twentyhq/twenty`    
- **Webstudio Builder**: `https://github.com/webstudio-is/webstudio`  

This can now serve as a single Markdown file you can download and place in your `docs/prd.md`. Let me know if you'd like to scaffold this into your BMAD agent pipeline or generate additional artifacts like architecture diagrams or prompt templates.
