import { GeneratedModule } from './module-creator.js';
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
export declare class Sprint3Integration extends EventEmitter {
    private geminiClient;
    private moduleCreator;
    private hotReload;
    private isInitialized;
    constructor();
    initialize(): Promise<void>;
    generateModule(request: GenerationRequest): Promise<GenerationResult>;
    generateModuleWithFallback(request: GenerationRequest): Promise<GenerationResult>;
    listModules(): Promise<GeneratedModule[]>;
    getModule(moduleSlug: string): Promise<GeneratedModule | null>;
    deleteModule(moduleSlug: string): Promise<boolean>;
    toggleModule(moduleSlug: string, enabled: boolean): Promise<boolean>;
    reloadModule(moduleSlug: string): Promise<boolean>;
    getSystemStatus(): any;
    private setupEventListeners;
    shutdown(): Promise<void>;
    testPipeline(): Promise<any>;
}
export default Sprint3Integration;
