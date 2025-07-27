/**
 * Sprint 3 Integration Service
 * Orchestrates enhanced code generation, module creation, and hot-reload functionality
 */

import GeminiClient from '../ai-service/gemini-client.js';
import ModuleCreator, { GeneratedModule } from './module-creator';
import PluginHotReload from './plugin-hot-reload';
import { EventEmitter } from 'events';

export interface GenerationRequest {
  prompt: string;
  options?: {
    featureType?: string;
    strictValidation?: boolean;
    maxFileSize?: number;
    allowedDependencies?: string[];
    outputFormat?: 'component' | 'page' | 'widget' | 'service';
  };
  context?: {
    crmEntities?: string[];
    designTokens?: any;
    existingModules?: string[];
  };
}

export interface GenerationResult {
  success: boolean;
  module?: GeneratedModule;
  error?: string;
  validationResults?: any[];
  generationTime?: number;
  hotReloadTriggered?: boolean;
}

export class Sprint3Integration extends EventEmitter {
  private geminiClient: GeminiClient;
  private moduleCreator: ModuleCreator;
  private hotReload: PluginHotReload;
  private isInitialized: boolean = false;

  constructor() {
    super();
    this.geminiClient = new GeminiClient();
    this.moduleCreator = new ModuleCreator();
    this.hotReload = new PluginHotReload();
  }

  /**
   * Initialize the Sprint 3 integration system
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Sprint 3 Integration System...');

      // Test Gemini connection
      const connectionTest = await this.geminiClient.testConnection();
      if (!connectionTest) {
        console.warn('Gemini API connection failed, will use fallback mode');
      }

      // Start hot-reload system
      await this.hotReload.start();

      // Set up event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log('Sprint 3 Integration System initialized successfully');

      this.emit('system-initialized', {
        timestamp: new Date().toISOString(),
        geminiConnected: connectionTest,
        hotReloadActive: true
      });

    } catch (error) {
      console.error('Failed to initialize Sprint 3 Integration System:', error);
      throw error;
    }
  }

  /**
   * Generate a complete module from a user prompt
   */
  async generateModule(request: GenerationRequest): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      if (!this.isInitialized) {
        throw new Error('System not initialized. Call initialize() first.');
      }

      console.log('Starting module generation for prompt:', request.prompt);

      this.emit('generation-started', {
        prompt: request.prompt,
        timestamp: new Date().toISOString()
      });

      // Step 1: Generate module using enhanced AI client
      const generatedModule = await this.geminiClient.generateModule(
        request.prompt,
        {
          strictValidation: request.options?.strictValidation !== false,
          maxFileSize: request.options?.maxFileSize,
          allowedDependencies: request.options?.allowedDependencies,
          constraints: {
            outputFormat: request.options?.outputFormat || 'component',
            featureType: request.options?.featureType
          },
          ...request.context
        }
      );

      // Step 2: Create module using module creator
      const createdModule = await this.moduleCreator.createModule(generatedModule);

      // Step 3: Hot-reload will automatically detect the new module
      // Wait a moment for the hot-reload system to pick up changes
      await new Promise(resolve => setTimeout(resolve, 1000));

      const generationTime = Date.now() - startTime;

      const result: GenerationResult = {
        success: true,
        module: createdModule,
        validationResults: generatedModule.validation?.results || [],
        generationTime,
        hotReloadTriggered: true
      };

      console.log(`Module generation completed in ${generationTime}ms`);

      this.emit('generation-completed', {
        moduleId: createdModule.id,
        moduleName: createdModule.config.name,
        generationTime,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      const generationTime = Date.now() - startTime;
      
      console.error('Module generation failed:', error);

      this.emit('generation-failed', {
        prompt: request.prompt,
        error: error.message,
        generationTime,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message,
        generationTime
      };
    }
  }

  /**
   * Generate module with fallback support
   */
  async generateModuleWithFallback(request: GenerationRequest): Promise<GenerationResult> {
    try {
      // Try real generation first
      return await this.generateModule(request);
    } catch (error) {
      console.warn('Real generation failed, trying fallback:', error.message);

      // Use fallback generation
      const fallbackCode = await this.geminiClient.generateWithFallback(
        request.prompt,
        request.context || {}
      );

      // Create a simple module structure for fallback
      const fallbackModuleData = {
        name: `Generated Module`,
        slug: `generated-${Date.now()}`,
        feature_type: request.options?.featureType || 'component',
        files: [
          {
            path: 'component.tsx',
            content: fallbackCode,
            type: 'component'
          }
        ],
        metadata: {
          description: 'Fallback generated module',
          dependencies: [],
          routes: [],
          integration_points: []
        }
      };

      const createdModule = await this.moduleCreator.createModule(fallbackModuleData);

      return {
        success: true,
        module: createdModule,
        generationTime: 0,
        hotReloadTriggered: true
      };
    }
  }

  /**
   * List all generated modules
   */
  async listModules(): Promise<GeneratedModule[]> {
    return await this.moduleCreator.listGeneratedModules();
  }

  /**
   * Get module by slug
   */
  async getModule(moduleSlug: string): Promise<GeneratedModule | null> {
    return await this.moduleCreator.getModule(moduleSlug);
  }

  /**
   * Delete a module
   */
  async deleteModule(moduleSlug: string): Promise<boolean> {
    const success = await this.moduleCreator.deleteModule(moduleSlug);
    
    if (success) {
      this.emit('module-deleted', {
        moduleSlug,
        timestamp: new Date().toISOString()
      });
    }

    return success;
  }

  /**
   * Toggle module status (enable/disable)
   */
  async toggleModule(moduleSlug: string, enabled: boolean): Promise<boolean> {
    const success = await this.hotReload.togglePlugin(moduleSlug, enabled);
    
    if (success) {
      this.emit('module-toggled', {
        moduleSlug,
        enabled,
        timestamp: new Date().toISOString()
      });
    }

    return success;
  }

  /**
   * Force reload a module
   */
  async reloadModule(moduleSlug: string): Promise<boolean> {
    const success = await this.hotReload.reloadPlugin(moduleSlug);
    
    if (success) {
      this.emit('module-reloaded', {
        moduleSlug,
        timestamp: new Date().toISOString()
      });
    }

    return success;
  }

  /**
   * Get system status
   */
  getSystemStatus(): any {
    return {
      initialized: this.isInitialized,
      hotReload: this.hotReload.getStatus(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Setup event listeners for cross-component communication
   */
  private setupEventListeners(): void {
    // Listen to hot-reload events
    this.hotReload.on('plugin-loaded', (event) => {
      this.emit('module-loaded', event);
    });

    this.hotReload.on('plugin-updated', (event) => {
      this.emit('module-updated', event);
    });

    this.hotReload.on('plugin-removed', (event) => {
      this.emit('module-removed', event);
    });

    this.hotReload.on('frontend-reload-required', (event) => {
      this.emit('frontend-reload-required', event);
    });

    // Listen to system events
    this.hotReload.on('system-started', (event) => {
      console.log('Hot-reload system started:', event);
    });

    this.hotReload.on('system-stopped', (event) => {
      console.log('Hot-reload system stopped:', event);
    });
  }

  /**
   * Shutdown the integration system
   */
  async shutdown(): Promise<void> {
    try {
      console.log('Shutting down Sprint 3 Integration System...');

      // Stop hot-reload system
      await this.hotReload.stop();

      this.isInitialized = false;

      this.emit('system-shutdown', {
        timestamp: new Date().toISOString()
      });

      console.log('Sprint 3 Integration System shutdown complete');

    } catch (error) {
      console.error('Error during system shutdown:', error);
    }
  }

  /**
   * Test the complete generation pipeline
   */
  async testPipeline(): Promise<any> {
    try {
      console.log('Testing Sprint 3 pipeline...');

      const testRequest: GenerationRequest = {
        prompt: 'Create a simple contact form component',
        options: {
          featureType: 'contact-form',
          strictValidation: false
        },
        context: {
          crmEntities: ['Contact'],
          designTokens: {}
        }
      };

      const result = await this.generateModuleWithFallback(testRequest);

      return {
        success: result.success,
        moduleCreated: !!result.module,
        generationTime: result.generationTime,
        validationPassed: !result.error,
        hotReloadActive: this.hotReload.getStatus().isWatching,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default Sprint3Integration;
