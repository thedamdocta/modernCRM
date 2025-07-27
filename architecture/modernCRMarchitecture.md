---

## 3. Component Breakdown

### Frontend  
- **Core CRM UI** (React/Recoil within Twenty)  
- **Webstudio plugin UI** embedded at route `/website-builder`  
- **Prompt Input Widget** for plain-language or voice input  
- **Generated Template Dashboard** to list and edit AI-generated modules

### Backend  
- **NestJS + GraphQL core services** (from Twenty CRM)  
- **Prompt API endpoint**: `/api/prompt-generate`  
- **Plugin Registration Service** for schema and route integration  
- **Metadata Connector** for saving web templates as CRM custom objects

### AI & Code Generation  
- Connects to LLM backend (e.g. OpenAI or fine-tuned model)  
- Uses flattened code context from both repos to generate code/config blueprints  
- Outputs include file structure, component code, metadata definitions

### Plugin Registry  
- Uses `plugins.json` manifest to register plugin modules and routes  
- System scans plugin folders and dynamically loads backend schemas and frontend modules

---

## 4. Data Flow & State Management

1. User enters a prompt in the UI (e.g. "Add IDX listing page")  
2. Frontend sends POST to backend with the prompt  
3. Prompt processor sends context + prompt to LLM  
4. LLM returns structured blueprint (file paths, code/config, metadata)  
5. System writes these into `webstudio-plugin/generated/{feature}`  
6. `plugins.json` updates entry and triggers hot-reload  
7. New route (e.g. `/website-builder/generated/idx-listing`) becomes live  
8. Generated templates stored as CRM custom objects (e.g., `WebTemplate`) tied to CRM data

---

## 5. Plugin Isolation & Modularity

- Each plugin (e.g. Webstudio) declares:  
  - GraphQL types and resolvers  
  - UI route and menu entries  
  - Design token dependencies  
- Plugins are independently loadable, updatable, or removable without affecting core CRM  
- Enables scalable architecture with future AI-generated and custom plugin support

---

## 6. Shared Design & Style Tokens

- Webstudio's design tokens (CSS properties, style primitives) are integrated into Twenty's shared UI library and Storybook  
- Token mapping ensures consistent appearance across CRM modules and web pages

---

## 7. Data Model Definitions

### `WebTemplate` (CRM Custom Object)  
| Field              | Type   | Description                                  |  
|-------------------|--------|----------------------------------------------|  
| `id`               | UUID   | Unique identifier                            |  
| `name`             | String | Human-readable feature/name                  |  
| `slug`             | String | URL-friendly route identifier                |  
| `template_type`    | String | e.g., IDX, landing page, form integration    |  
| `schema`           | JSON   | Configuration blueprint returned by LLM      |  
| `render_page`      | String | Path to module for page rendering            |  
| `linked_crm_record`| UUID   | Optional linkage to CRM entities (e.g. contact) |

### `PromptLog`  
| Field             | Type       | Description                              |  
|------------------|------------|------------------------------------------|  
| `prompt`          | Text       | User-submitted prompt                    |  
| `generated_files` | JSON       | File paths and code outputs              |  
| `timestamp`       | Timestamp  | Request creation time                    |  
| `status`          | String     | Result status (e.g. success/failure)     |  
| `feature_type`    | String     | Type of generated module (e.g. IDX)      |

---

## 8. Security, Resilience & Monitoring

- **Prompt sanitization** to mitigate injection or malformed inputs  
- **Sandboxed module loading** to isolate generated code  
- **Schema validation** of plugin manifest and registration metadata  
- **Fallback UI routing** if module fails to load  
- **Logging & monitoring** for plugin registration, LLM responses, and runtime errors

---

## ✅ Summary    
This architecture enables a cohesive, modular system combining:  
- **Twenty CRM** for core CRM capabilities and plugin infrastructure.  
- **Webstudio** for a visual builder with AI prompt-based generation capabilities.

Together, they deliver:  
- Frontend CRM interface embedding Webstudio and prompt UI    
- Backend endpoint and module registrar for AI-generated feature injection    
- Shared data model and design system for consistent UX/UI    
- Safe, modular plugin architecture with hot-reload and isolation support  

Let me know if you'd like runnable scaffolds, architecture diagrams, or code templates next!
