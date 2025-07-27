import GeminiClient from '../gemini-client-mock';
interface PromptRequest {
    prompt: string;
    options: {
        moduleType: string;
        targetEntity?: string;
        includeDataBinding: boolean;
        generateTests: boolean;
        outputFormat: 'component' | 'page' | 'widget';
    };
}
interface PromptResponse {
    success: boolean;
    data?: {
        generatedCode: string;
        blueprint: any;
        metadata: any;
        files: GeneratedFile[];
    };
    error?: string;
    requestId: string;
}
interface GeneratedFile {
    path: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'test';
}
export declare class PromptService {
    private readonly geminiClient;
    constructor(geminiClient: GeminiClient);
    generateFromPrompt(request: PromptRequest): Promise<PromptResponse>;
    private buildGenerationContext;
    private parseGeneratedContent;
    private createFileStructure;
    private createBlueprint;
    private createMetadata;
    private generateRequestId;
    private generateModuleName;
}
export declare class PromptController {
    private readonly promptService;
    constructor(promptService: PromptService);
    generateFromPrompt(request: PromptRequest): Promise<PromptResponse>;
}
export { PromptRequest, PromptResponse, GeneratedFile };
