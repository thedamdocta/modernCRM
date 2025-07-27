/**
 * Gemini AI Client for Modern CRM Project
 * Handles AI-powered code generation for CRM features and website modules
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class GeminiClient {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.contextWindowSize = parseInt(process.env.CONTEXT_WINDOW_SIZE) || 1000000;
    
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.generativeModel = this.genAI.getGenerativeModel({ model: this.model });
  }

  /**
   * Generate code/config based on user prompt and repository context
   * @param {string} prompt - User's natural language prompt
   * @param {Object} context - Repository context and metadata
   * @returns {Promise<Object>} Generated blueprint with code, config, and metadata
   */
  async generateFeature(prompt, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const contextPrompt = await this.buildContextPrompt(context);
      const userPrompt = this.buildUserPrompt(prompt);
      
      const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\n${userPrompt}`;
      
      console.log('Generating feature with Gemini 2.5...');
      console.log('Prompt length:', fullPrompt.length);
      
      const result = await this.generativeModel.generateContent(fullPrompt);
      const response = await result.response;
      const generatedText = response.text();
      
      return this.parseGeneratedResponse(generatedText);
    } catch (error) {
      console.error('Error generating feature:', error);
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt with project context and requirements
   */
  buildSystemPrompt() {
    return `You are an expert full-stack developer specializing in integrating Twenty CRM with Webstudio visual website builder.

Your task is to generate production-ready code, configuration, and metadata based on user prompts.

TECHNOLOGY STACK:
- Twenty CRM: TypeScript, Nx monorepo, React, NestJS, GraphQL, PostgreSQL, Redis
- Webstudio: React, TypeScript, pnpm, visual builder with CSS tokens
- Integration: Plugin architecture, shared design system, AI-powered generation

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "feature_type": "string (e.g., 'idx-listing', 'landing-page', 'form-integration')",
  "name": "human-readable feature name",
  "slug": "url-friendly identifier",
  "files": [
    {
      "path": "relative/path/to/file.tsx",
      "content": "complete file content",
      "type": "component|config|schema|migration"
    }
  ],
  "schema": {
    "graphql_types": "GraphQL type definitions if needed",
    "database_migrations": "SQL migrations if needed",
    "plugin_config": "Plugin configuration"
  },
  "metadata": {
    "description": "Feature description",
    "dependencies": ["list of required packages"],
    "routes": ["list of new routes"],
    "integration_points": ["Twenty CRM integration points"]
  }
}

REQUIREMENTS:
1. Generate complete, working code - no placeholders or TODOs
2. Follow Twenty CRM's plugin architecture patterns
3. Use Webstudio's design token system for consistent styling
4. Ensure GraphQL schema compatibility
5. Include proper TypeScript types
6. Follow React best practices
7. Generate database migrations if needed
8. Create proper plugin manifest entries

INTEGRATION PATTERNS:
- Webstudio components should integrate as Twenty CRM plugins
- Use shared design tokens for consistent UI
- Follow Twenty's GraphQL conventions
- Implement proper authentication and authorization
- Use Twenty's metadata system for data binding`;
  }

  /**
   * Build context prompt with repository information
   */
  async buildContextPrompt(context) {
    let contextPrompt = 'REPOSITORY CONTEXT:\n';
    
    // Add Twenty CRM context
    if (context.twentyContext) {
      contextPrompt += '\nTWENTY CRM STRUCTURE:\n';
      contextPrompt += JSON.stringify(context.twentyContext, null, 2);
    }
    
    // Add Webstudio context
    if (context.webstudioContext) {
      contextPrompt += '\nWEBSTUDIO STRUCTURE:\n';
      contextPrompt += JSON.stringify(context.webstudioContext, null, 2);
    }
    
    // Add existing plugins context
    if (context.existingPlugins) {
      contextPrompt += '\nEXISTING PLUGINS:\n';
      contextPrompt += JSON.stringify(context.existingPlugins, null, 2);
    }
    
    return contextPrompt;
  }

  /**
   * Build user prompt with specific requirements
   */
  buildUserPrompt(prompt) {
    return `USER REQUEST:
${prompt}

Generate the complete implementation following the requirements above. Ensure all code is production-ready and follows the established patterns.`;
  }

  /**
   * Parse and validate the generated response
   */
  parseGeneratedResponse(generatedText) {
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = generatedText.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedText.match(/```\n([\s\S]*?)\n```/) ||
                       [null, generatedText];
      
      const jsonString = jsonMatch[1] || generatedText;
      const parsed = JSON.parse(jsonString);
      
      // Validate required fields
      const requiredFields = ['feature_type', 'name', 'slug', 'files', 'schema', 'metadata'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse generated response:', error);
      console.error('Raw response:', generatedText);
      throw new Error(`Invalid response format: ${error.message}`);
    }
  }

  /**
   * Get repository context for better code generation
   */
  async getRepositoryContext() {
    const context = {};
    
    try {
      // Get Twenty CRM package structure
      const twentyPackageJson = await fs.readFile('../../twenty/package.json', 'utf-8');
      context.twentyPackage = JSON.parse(twentyPackageJson);
      
      // Get Webstudio package structure
      const webstudioPackageJson = await fs.readFile('../../webstudio/package.json', 'utf-8');
      context.webstudioPackage = JSON.parse(webstudioPackageJson);
      
      // Get existing plugin configurations
      try {
        const pluginsConfig = await fs.readFile('../plugins/plugins.json', 'utf-8');
        context.existingPlugins = JSON.parse(pluginsConfig);
      } catch {
        context.existingPlugins = { plugins: [] };
      }
      
    } catch (error) {
      console.warn('Could not load full repository context:', error.message);
    }
    
    return context;
  }

  /**
   * Generate code based on a prompt and context
   * Used by the prompt API for Sprint 2 functionality
   */
  async generateCode(prompt, context = {}) {
    try {
      console.log('Generating code with Gemini 2.5 Flash...');
      
      const systemPrompt = this.buildCodeGenerationPrompt();
      const contextPrompt = this.buildCodeContext(context);
      const userPrompt = `USER REQUEST: ${prompt}`;
      
      const fullPrompt = `${systemPrompt}\n\n${contextPrompt}\n\n${userPrompt}`;
      
      console.log('Code generation prompt length:', fullPrompt.length);
      
      const result = await this.generativeModel.generateContent(fullPrompt);
      const response = await result.response;
      const generatedText = response.text();
      
      console.log('Generated code response received');
      return generatedText;
      
    } catch (error) {
      console.error('Error generating code:', error);
      throw new Error(`Code generation failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt specifically for code generation
   */
  buildCodeGenerationPrompt() {
    return `You are an expert React/TypeScript developer specializing in CRM integrations and visual website builders.

TASK: Generate production-ready React components based on user prompts.

TECHNOLOGY STACK:
- React 18 with TypeScript
- CSS-in-JS with design tokens
- GraphQL for data fetching (when needed)
- Twenty CRM integration patterns
- Webstudio visual builder compatibility

DESIGN TOKENS AVAILABLE:
- Colors: var(--twenty-color-blue-60), var(--twenty-color-gray-0), etc.
- Spacing: var(--twenty-spacing-1) through var(--twenty-spacing-12)
- Typography: var(--twenty-font-family), var(--twenty-font-size-base), etc.
- Borders: var(--twenty-border-radius-md), etc.
- Shadows: var(--twenty-shadow-sm), var(--twenty-shadow-lg), etc.

OUTPUT FORMAT:
Generate complete, working React components with:
1. TypeScript interfaces for props
2. Proper error handling
3. Responsive design using design tokens
4. Accessibility features (ARIA labels, keyboard navigation)
5. Clean, maintainable code structure

REQUIREMENTS:
- Use functional components with hooks
- Include proper TypeScript types
- Use design tokens for all styling
- Follow React best practices
- Include loading and error states
- Make components responsive
- Add proper accessibility attributes
- No external dependencies unless specified in context

EXAMPLE STRUCTURE:
\`\`\`tsx
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  // Define props interface
}

export const ComponentName: React.FC<ComponentProps> = ({ 
  // destructure props
}) => {
  // Component logic here
  
  return (
    <div className="component-container">
      {/* Component JSX */}
      <style jsx>{\`
        .component-container {
          /* Use design tokens for styling */
        }
      \`}</style>
    </div>
  );
};

export default ComponentName;
\`\`\`

Generate complete, production-ready code based on the user's request.`;
  }

  /**
   * Build context for code generation
   */
  buildCodeContext(context) {
    let contextPrompt = 'GENERATION CONTEXT:\n';
    
    if (context.crmEntities) {
      contextPrompt += '\nCRM ENTITIES AVAILABLE:\n';
      contextPrompt += JSON.stringify(context.crmEntities, null, 2);
    }
    
    if (context.designTokens) {
      contextPrompt += '\nDESIGN TOKENS:\n';
      contextPrompt += JSON.stringify(context.designTokens, null, 2);
    }
    
    if (context.componentTemplates) {
      contextPrompt += '\nCOMPONENT TEMPLATES:\n';
      contextPrompt += JSON.stringify(context.componentTemplates, null, 2);
    }
    
    if (context.constraints) {
      contextPrompt += '\nTECHNICAL CONSTRAINTS:\n';
      contextPrompt += JSON.stringify(context.constraints, null, 2);
    }
    
    if (context.outputRequirements) {
      contextPrompt += '\nOUTPUT REQUIREMENTS:\n';
      contextPrompt += JSON.stringify(context.outputRequirements, null, 2);
    }
    
    return contextPrompt;
  }

  /**
   * Validate generated code using TypeScript compiler
   * @param {string} code - TypeScript/JavaScript code to validate
   * @param {string} filePath - File path for context
   * @returns {Promise<Object>} Validation result with errors/warnings
   */
  async validateGeneratedCode(code, filePath) {
    try {
      // Create temporary file for validation
      const tempDir = path.join(process.cwd(), 'temp');
      await fs.mkdir(tempDir, { recursive: true });
      
      const tempFile = path.join(tempDir, `validation-${Date.now()}.ts`);
      await fs.writeFile(tempFile, code);
      
      // Run TypeScript compiler check
      const { stdout, stderr } = await execAsync(`npx tsc --noEmit --skipLibCheck ${tempFile}`);
      
      // Clean up temp file
      await fs.unlink(tempFile);
      
      return {
        valid: !stderr,
        errors: stderr ? stderr.split('\n').filter(line => line.trim()) : [],
        warnings: stdout ? stdout.split('\n').filter(line => line.trim()) : []
      };
    } catch (error) {
      return {
        valid: false,
        errors: [error.message],
        warnings: []
      };
    }
  }

  /**
   * Generate module with enhanced validation and structure
   * @param {string} prompt - User prompt
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Complete module with validation
   */
  async generateModule(prompt, options = {}) {
    try {
      console.log('Generating module with enhanced validation...');
      
      // Build enhanced context
      const context = await this.buildEnhancedContext(options);
      
      // Generate feature using enhanced prompts
      const feature = await this.generateFeature(prompt, context);
      
      // Validate all generated files
      const validationResults = [];
      for (const file of feature.files) {
        if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
          const validation = await this.validateGeneratedCode(file.content, file.path);
          validationResults.push({
            file: file.path,
            ...validation
          });
        }
      }
      
      // Check for validation failures
      const hasErrors = validationResults.some(result => !result.valid);
      if (hasErrors && options.strictValidation !== false) {
        throw new Error(`Code validation failed: ${JSON.stringify(validationResults, null, 2)}`);
      }
      
      return {
        ...feature,
        validation: {
          results: validationResults,
          passed: !hasErrors,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Module generation failed:', error);
      throw error;
    }
  }

  /**
   * Build enhanced context with templates and patterns
   */
  async buildEnhancedContext(options = {}) {
    const context = await this.getRepositoryContext();
    
    // Add code templates
    context.templates = await this.loadCodeTemplates();
    
    // Add design tokens
    context.designTokens = await this.loadDesignTokens();
    
    // Add CRM schema information
    context.crmSchema = await this.loadCRMSchema();
    
    // Add generation constraints
    context.constraints = {
      maxFileSize: options.maxFileSize || 50000, // 50KB max per file
      allowedDependencies: options.allowedDependencies || [],
      requiredPatterns: options.requiredPatterns || [],
      ...options.constraints
    };
    
    return context;
  }

  /**
   * Load code templates for consistent generation
   */
  async loadCodeTemplates() {
    const templates = {};
    
    try {
      const templatesDir = path.join(process.cwd(), 'integration/templates');
      const templateFiles = await fs.readdir(templatesDir).catch(() => []);
      
      for (const file of templateFiles) {
        if (file.endsWith('.template.ts') || file.endsWith('.template.tsx')) {
          const templateName = file.replace('.template.ts', '').replace('.template.tsx', '');
          const templateContent = await fs.readFile(path.join(templatesDir, file), 'utf-8');
          templates[templateName] = templateContent;
        }
      }
    } catch (error) {
      console.warn('Could not load code templates:', error.message);
    }
    
    return templates;
  }

  /**
   * Load design tokens for consistent styling
   */
  async loadDesignTokens() {
    try {
      const tokensPath = path.join(process.cwd(), 'integration/shared-tokens/design-system-mapping.json');
      const tokensContent = await fs.readFile(tokensPath, 'utf-8');
      return JSON.parse(tokensContent);
    } catch (error) {
      console.warn('Could not load design tokens:', error.message);
      return {};
    }
  }

  /**
   * Load CRM schema information
   */
  async loadCRMSchema() {
    try {
      // This would typically load from Twenty CRM's GraphQL schema
      // For now, return a basic schema structure
      return {
        entities: ['Contact', 'Account', 'Opportunity', 'Lead', 'WebTemplate', 'PromptLog'],
        relationships: {
          Contact: ['Account', 'Opportunity'],
          Account: ['Contact', 'Opportunity'],
          Opportunity: ['Contact', 'Account']
        },
        customFields: {}
      };
    } catch (error) {
      console.warn('Could not load CRM schema:', error.message);
      return {};
    }
  }

  /**
   * Generate with fallback to mock for development
   */
  async generateWithFallback(prompt, context = {}) {
    try {
      // Try real API first
      return await this.generateCode(prompt, context);
    } catch (error) {
      console.warn('Real API failed, falling back to mock:', error.message);
      
      // Fallback to mock response for development
      return this.generateMockResponse(prompt, context);
    }
  }

  /**
   * Generate mock response for development/testing
   */
  generateMockResponse(prompt, context = {}) {
    const mockResponses = {
      'contact form': `
import React, { useState } from 'react';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          required
        />
      </div>
      
      <button type="submit" className="submit-button">
        Send Message
      </button>
      
      <style jsx>{\`
        .contact-form {
          max-width: 500px;
          margin: 0 auto;
          padding: var(--twenty-spacing-6);
          background: var(--twenty-color-gray-0);
          border-radius: var(--twenty-border-radius-md);
          box-shadow: var(--twenty-shadow-sm);
        }
        
        .form-group {
          margin-bottom: var(--twenty-spacing-4);
        }
        
        label {
          display: block;
          margin-bottom: var(--twenty-spacing-1);
          font-weight: 600;
          color: var(--twenty-color-gray-90);
        }
        
        input, textarea {
          width: 100%;
          padding: var(--twenty-spacing-2);
          border: 1px solid var(--twenty-color-gray-30);
          border-radius: var(--twenty-border-radius-sm);
          font-family: var(--twenty-font-family);
        }
        
        .submit-button {
          background: var(--twenty-color-blue-60);
          color: white;
          padding: var(--twenty-spacing-3) var(--twenty-spacing-6);
          border: none;
          border-radius: var(--twenty-border-radius-sm);
          cursor: pointer;
          font-weight: 600;
        }
        
        .submit-button:hover {
          background: var(--twenty-color-blue-70);
        }
      \`}</style>
    </form>
  );
};

export default ContactForm;
      `,
      'dashboard': `
import React, { useState, useEffect } from 'react';

interface DashboardProps {
  title?: string;
}

interface DashboardStats {
  totalContacts: number;
  totalAccounts: number;
  totalOpportunities: number;
  totalRevenue: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ title = 'CRM Dashboard' }) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalAccounts: 0,
    totalOpportunities: 0,
    totalRevenue: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setStats({
        totalContacts: 1247,
        totalAccounts: 89,
        totalOpportunities: 156,
        totalRevenue: 2847500
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">{title}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Contacts</h3>
          <p className="stat-number">{stats.totalContacts.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Accounts</h3>
          <p className="stat-number">{stats.totalAccounts.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Opportunities</h3>
          <p className="stat-number">{stats.totalOpportunities.toLocaleString()}</p>
        </div>
        
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">${stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <style jsx>{\`
        .dashboard {
          padding: var(--twenty-spacing-6);
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard-title {
          font-size: var(--twenty-font-size-xl);
          color: var(--twenty-color-gray-90);
          margin-bottom: var(--twenty-spacing-6);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--twenty-spacing-4);
        }
        
        .stat-card {
          background: var(--twenty-color-gray-0);
          padding: var(--twenty-spacing-6);
          border-radius: var(--twenty-border-radius-md);
          box-shadow: var(--twenty-shadow-sm);
          text-align: center;
        }
        
        .stat-card h3 {
          color: var(--twenty-color-gray-70);
          margin-bottom: var(--twenty-spacing-2);
          font-size: var(--twenty-font-size-sm);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-number {
          font-size: var(--twenty-font-size-xxl);
          font-weight: 700;
          color: var(--twenty-color-blue-60);
          margin: 0;
        }
        
        .loading {
          text-align: center;
          padding: var(--twenty-spacing-12);
          color: var(--twenty-color-gray-60);
        }
      \`}</style>
    </div>
  );
};

export default Dashboard;
      `
    };

    // Return mock response based on prompt keywords
    const promptLower = prompt.toLowerCase();
    if (promptLower.includes('contact') || promptLower.includes('form')) {
      return mockResponses['contact form'];
    } else if (promptLower.includes('dashboard') || promptLower.includes('stats')) {
      return mockResponses['dashboard'];
    }
    
    // Default mock response
    return mockResponses['contact form'];
  }

  /**
   * Test the Gemini connection
   */
  async testConnection() {
    try {
      const result = await this.generativeModel.generateContent('Hello, respond with "Connection successful"');
      const response = await result.response;
      const text = response.text();
      console.log('Gemini connection test:', text);
      return text.includes('Connection successful');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }
}

export default GeminiClient;
