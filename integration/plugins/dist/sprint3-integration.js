"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sprint3Integration = void 0;
const gemini_client_js_1 = __importDefault(require("../ai-service/gemini-client.js"));
const module_creator_1 = __importDefault(require("./module-creator"));
const plugin_hot_reload_1 = __importDefault(require("./plugin-hot-reload"));
const events_1 = require("events");
class Sprint3Integration extends events_1.EventEmitter {
    constructor() {
        super();
        this.isInitialized = false;
        this.geminiClient = new gemini_client_js_1.default();
        this.moduleCreator = new module_creator_1.default();
        this.hotReload = new plugin_hot_reload_1.default();
    }
    async initialize() {
        try {
            console.log('Initializing Sprint 3 Integration System...');
            const connectionTest = await this.geminiClient.testConnection();
            if (!connectionTest) {
                console.warn('Gemini API connection failed, will use fallback mode');
            }
            await this.hotReload.start();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Sprint 3 Integration System initialized successfully');
            this.emit('system-initialized', {
                timestamp: new Date().toISOString(),
                geminiConnected: connectionTest,
                hotReloadActive: true
            });
        }
        catch (error) {
            console.error('Failed to initialize Sprint 3 Integration System:', error);
            throw error;
        }
    }
    async generateModule(request) {
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
            const generatedModule = await this.geminiClient.generateModule(request.prompt, {
                strictValidation: request.options?.strictValidation !== false,
                maxFileSize: request.options?.maxFileSize,
                allowedDependencies: request.options?.allowedDependencies,
                constraints: {
                    outputFormat: request.options?.outputFormat || 'component',
                    featureType: request.options?.featureType
                },
                ...request.context
            });
            const createdModule = await this.moduleCreator.createModule(generatedModule);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const generationTime = Date.now() - startTime;
            const result = {
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
        }
        catch (error) {
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
    async generateModuleWithFallback(request) {
        try {
            return await this.generateModule(request);
        }
        catch (error) {
            console.warn('Real generation failed, trying fallback:', error.message);
            const fallbackCode = await this.geminiClient.generateWithFallback(request.prompt, request.context || {});
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
    async listModules() {
        return await this.moduleCreator.listGeneratedModules();
    }
    async getModule(moduleSlug) {
        return await this.moduleCreator.getModule(moduleSlug);
    }
    async deleteModule(moduleSlug) {
        const success = await this.moduleCreator.deleteModule(moduleSlug);
        if (success) {
            this.emit('module-deleted', {
                moduleSlug,
                timestamp: new Date().toISOString()
            });
        }
        return success;
    }
    async toggleModule(moduleSlug, enabled) {
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
    async reloadModule(moduleSlug) {
        const success = await this.hotReload.reloadPlugin(moduleSlug);
        if (success) {
            this.emit('module-reloaded', {
                moduleSlug,
                timestamp: new Date().toISOString()
            });
        }
        return success;
    }
    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            hotReload: this.hotReload.getStatus(),
            timestamp: new Date().toISOString()
        };
    }
    setupEventListeners() {
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
        this.hotReload.on('system-started', (event) => {
            console.log('Hot-reload system started:', event);
        });
        this.hotReload.on('system-stopped', (event) => {
            console.log('Hot-reload system stopped:', event);
        });
    }
    async shutdown() {
        try {
            console.log('Shutting down Sprint 3 Integration System...');
            await this.hotReload.stop();
            this.isInitialized = false;
            this.emit('system-shutdown', {
                timestamp: new Date().toISOString()
            });
            console.log('Sprint 3 Integration System shutdown complete');
        }
        catch (error) {
            console.error('Error during system shutdown:', error);
        }
    }
    async testPipeline() {
        try {
            console.log('Testing Sprint 3 pipeline...');
            const testRequest = {
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
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}
exports.Sprint3Integration = Sprint3Integration;
exports.default = Sprint3Integration;
//# sourceMappingURL=sprint3-integration.js.map