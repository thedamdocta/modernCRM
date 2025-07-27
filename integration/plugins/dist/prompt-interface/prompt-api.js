"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptController = exports.PromptService = void 0;
const common_1 = require("@nestjs/common");
const gemini_client_1 = require("../../ai-service/gemini-client");
let PromptService = class PromptService {
    constructor(geminiClient) {
        this.geminiClient = geminiClient;
    }
    async generateFromPrompt(request) {
        const requestId = this.generateRequestId();
        try {
            console.log(`[${requestId}] Processing prompt generation request`);
            const context = await this.buildGenerationContext(request);
            const generatedContent = await this.geminiClient.generateCode(request.prompt, context);
            const parsedContent = await this.parseGeneratedContent(generatedContent);
            const files = await this.createFileStructure(parsedContent, request.options);
            const blueprint = this.createBlueprint(request, files);
            const metadata = this.createMetadata(request, blueprint);
            console.log(`[${requestId}] Successfully generated ${files.length} files`);
            return {
                success: true,
                data: {
                    generatedCode: generatedContent,
                    blueprint,
                    metadata,
                    files
                },
                requestId
            };
        }
        catch (error) {
            console.error(`[${requestId}] Error generating from prompt:`, error);
            return {
                success: false,
                error: error.message || 'Failed to generate content from prompt',
                requestId
            };
        }
    }
    async buildGenerationContext(request) {
        const context = {
            crmEntities: {
                Contact: {
                    fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'company'],
                    relationships: ['accounts', 'opportunities', 'activities']
                },
                Account: {
                    fields: ['id', 'name', 'industry', 'website', 'employees'],
                    relationships: ['contacts', 'opportunities']
                },
                Opportunity: {
                    fields: ['id', 'name', 'amount', 'stage', 'closeDate'],
                    relationships: ['account', 'contact']
                },
                Lead: {
                    fields: ['id', 'firstName', 'lastName', 'email', 'source', 'status'],
                    relationships: ['activities']
                }
            },
            designTokens: {
                colors: {
                    primary: 'var(--twenty-color-blue-60)',
                    secondary: 'var(--twenty-color-gray-60)',
                    background: 'var(--twenty-color-gray-0)',
                    text: 'var(--twenty-color-gray-90)',
                    border: 'var(--twenty-color-gray-20)'
                },
                spacing: {
                    xs: 'var(--twenty-spacing-1)',
                    sm: 'var(--twenty-spacing-2)',
                    md: 'var(--twenty-spacing-4)',
                    lg: 'var(--twenty-spacing-6)',
                    xl: 'var(--twenty-spacing-8)'
                },
                typography: {
                    fontFamily: 'var(--twenty-font-family)',
                    fontSize: {
                        sm: 'var(--twenty-font-size-sm)',
                        base: 'var(--twenty-font-size-base)',
                        lg: 'var(--twenty-font-size-lg)',
                        xl: 'var(--twenty-font-size-xl)'
                    }
                }
            },
            componentTemplates: {
                page: {
                    structure: 'React functional component with hooks',
                    styling: 'CSS-in-JS with design tokens',
                    dataBinding: request.options.includeDataBinding ? 'GraphQL queries' : 'static data'
                },
                component: {
                    structure: 'Reusable React component with props interface',
                    styling: 'Styled components with design tokens',
                    dataBinding: request.options.includeDataBinding ? 'Props-based data flow' : 'internal state'
                },
                widget: {
                    structure: 'Dashboard widget with responsive design',
                    styling: 'CSS modules with design tokens',
                    dataBinding: request.options.includeDataBinding ? 'Real-time data updates' : 'mock data'
                }
            },
            constraints: {
                framework: 'React with TypeScript',
                styling: 'CSS-in-JS or styled-components',
                stateManagement: 'React hooks (useState, useEffect)',
                dataFetching: request.options.includeDataBinding ? 'GraphQL with Apollo Client' : 'none',
                testing: request.options.generateTests ? 'Jest and React Testing Library' : 'none',
                accessibility: 'WCAG 2.1 AA compliance',
                responsive: 'Mobile-first responsive design'
            },
            outputRequirements: {
                format: request.options.outputFormat,
                targetEntity: request.options.targetEntity,
                includeTests: request.options.generateTests,
                includeDataBinding: request.options.includeDataBinding
            }
        };
        return context;
    }
    async parseGeneratedContent(content) {
        try {
            const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1]);
            }
            const codeBlocks = content.match(/```(\w+)?\n([\s\S]*?)\n```/g);
            if (codeBlocks) {
                const parsed = {
                    components: [],
                    styles: [],
                    tests: [],
                    config: {}
                };
                codeBlocks.forEach(block => {
                    const match = block.match(/```(\w+)?\n([\s\S]*?)\n```/);
                    if (match) {
                        const language = match[1] || 'text';
                        const code = match[2];
                        if (language === 'tsx' || language === 'jsx') {
                            parsed.components.push(code);
                        }
                        else if (language === 'css' || language === 'scss') {
                            parsed.styles.push(code);
                        }
                        else if (language === 'test' || language === 'spec') {
                            parsed.tests.push(code);
                        }
                    }
                });
                return parsed;
            }
            return {
                components: [content],
                styles: [],
                tests: [],
                config: {}
            };
        }
        catch (error) {
            console.error('Error parsing generated content:', error);
            throw new Error('Failed to parse generated content');
        }
    }
    async createFileStructure(parsedContent, options) {
        const files = [];
        const timestamp = Date.now();
        const moduleName = this.generateModuleName(options.outputFormat);
        if (parsedContent.components && parsedContent.components.length > 0) {
            files.push({
                path: `integration/plugins/generated/${moduleName}/${moduleName}.tsx`,
                content: parsedContent.components[0],
                type: 'component'
            });
        }
        if (parsedContent.styles && parsedContent.styles.length > 0) {
            files.push({
                path: `integration/plugins/generated/${moduleName}/${moduleName}.styles.ts`,
                content: parsedContent.styles[0],
                type: 'style'
            });
        }
        if (options.generateTests && parsedContent.tests && parsedContent.tests.length > 0) {
            files.push({
                path: `integration/plugins/generated/${moduleName}/${moduleName}.test.tsx`,
                content: parsedContent.tests[0],
                type: 'test'
            });
        }
        const pluginConfig = {
            id: moduleName,
            name: `Generated ${options.outputFormat}`,
            version: '1.0.0',
            description: `AI-generated ${options.outputFormat} module`,
            author: 'AI Assistant',
            createdAt: new Date().toISOString(),
            type: options.outputFormat,
            routes: options.outputFormat === 'page' ? [
                {
                    path: `/generated/${moduleName}`,
                    component: moduleName,
                    exact: true
                }
            ] : undefined,
            dependencies: [
                'react',
                'typescript',
                ...(options.includeDataBinding ? ['@apollo/client', 'graphql'] : [])
            ]
        };
        files.push({
            path: `integration/plugins/generated/${moduleName}/plugin.json`,
            content: JSON.stringify(pluginConfig, null, 2),
            type: 'config'
        });
        return files;
    }
    createBlueprint(request, files) {
        return {
            id: this.generateModuleName(request.options.outputFormat),
            type: request.options.outputFormat,
            prompt: request.prompt,
            options: request.options,
            files: files.map(f => ({
                path: f.path,
                type: f.type
            })),
            metadata: {
                generatedAt: new Date().toISOString(),
                version: '1.0.0',
                dependencies: files.find(f => f.type === 'config')?.content ?
                    JSON.parse(files.find(f => f.type === 'config').content).dependencies : []
            }
        };
    }
    createMetadata(request, blueprint) {
        return {
            webTemplate: {
                name: blueprint.id,
                slug: blueprint.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                templateType: request.options.outputFormat,
                schema: {
                    prompt: request.prompt,
                    options: request.options,
                    blueprint: blueprint
                },
                linkedCrmRecord: request.options.targetEntity || null,
                status: 'generated',
                createdAt: new Date().toISOString()
            },
            promptLog: {
                prompt: request.prompt,
                generatedFiles: blueprint.files,
                timestamp: new Date().toISOString(),
                status: 'success',
                featureType: request.options.outputFormat
            }
        };
    }
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateModuleName(outputFormat) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${outputFormat}_${timestamp}_${random}`;
    }
};
exports.PromptService = PromptService;
exports.PromptService = PromptService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof gemini_client_1.GeminiClient !== "undefined" && gemini_client_1.GeminiClient) === "function" ? _a : Object])
], PromptService);
let PromptController = class PromptController {
    constructor(promptService) {
        this.promptService = promptService;
    }
    async generateFromPrompt(request) {
        if (!request.prompt || request.prompt.trim().length < 10) {
            throw new common_1.HttpException('Prompt must be at least 10 characters long', common_1.HttpStatus.BAD_REQUEST);
        }
        if (!request.options || !request.options.outputFormat) {
            throw new common_1.HttpException('Output format is required', common_1.HttpStatus.BAD_REQUEST);
        }
        const validFormats = ['component', 'page', 'widget'];
        if (!validFormats.includes(request.options.outputFormat)) {
            throw new common_1.HttpException(`Output format must be one of: ${validFormats.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.promptService.generateFromPrompt(request);
        }
        catch (error) {
            console.error('Error in prompt generation endpoint:', error);
            throw new common_1.HttpException('Internal server error during prompt generation', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PromptController = PromptController;
__decorate([
    (0, common_1.Post)('prompt-generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PromptController.prototype, "generateFromPrompt", null);
exports.PromptController = PromptController = __decorate([
    (0, common_1.Controller)('api'),
    __metadata("design:paramtypes", [PromptService])
], PromptController);
//# sourceMappingURL=prompt-api.js.map