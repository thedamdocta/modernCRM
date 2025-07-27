import { Injectable, Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
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

@Injectable()
export class PromptService {
  constructor(private readonly geminiClient: GeminiClient) {}

  async generateFromPrompt(request: PromptRequest): Promise<PromptResponse> {
    const requestId = this.generateRequestId();
    
    try {
      console.log(`[${requestId}] Processing prompt generation request`);
      
      // Build context for the AI model
      const context = await this.buildGenerationContext(request);
      
      // Generate code using Gemini
      const generatedContent = await this.geminiClient.generateCode(
        request.prompt,
        context
      );
      
      // Parse and validate the generated content
      const parsedContent = await this.parseGeneratedContent(generatedContent);
      
      // Create file structure
      const files = await this.createFileStructure(parsedContent, request.options);
      
      // Generate blueprint for plugin registration
      const blueprint = this.createBlueprint(request, files);
      
      // Create metadata for CRM integration
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
      
    } catch (error) {
      console.error(`[${requestId}] Error generating from prompt:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to generate content from prompt',
        requestId
      };
    }
  }

  private async buildGenerationContext(request: PromptRequest): Promise<any> {
    const context = {
      // CRM Schema Information
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
      
      // Design System Tokens
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
      
      // Component Templates
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
      
      // Technical Constraints
      constraints: {
        framework: 'React with TypeScript',
        styling: 'CSS-in-JS or styled-components',
        stateManagement: 'React hooks (useState, useEffect)',
        dataFetching: request.options.includeDataBinding ? 'GraphQL with Apollo Client' : 'none',
        testing: request.options.generateTests ? 'Jest and React Testing Library' : 'none',
        accessibility: 'WCAG 2.1 AA compliance',
        responsive: 'Mobile-first responsive design'
      },
      
      // Output Requirements
      outputRequirements: {
        format: request.options.outputFormat,
        targetEntity: request.options.targetEntity,
        includeTests: request.options.generateTests,
        includeDataBinding: request.options.includeDataBinding
      }
    };
    
    return context;
  }

  private async parseGeneratedContent(content: string): Promise<any> {
    try {
      // Try to extract JSON from the generated content
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Try to extract code blocks
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
            } else if (language === 'css' || language === 'scss') {
              parsed.styles.push(code);
            } else if (language === 'test' || language === 'spec') {
              parsed.tests.push(code);
            }
          }
        });
        
        return parsed;
      }
      
      // Fallback: treat entire content as component code
      return {
        components: [content],
        styles: [],
        tests: [],
        config: {}
      };
      
    } catch (error) {
      console.error('Error parsing generated content:', error);
      throw new Error('Failed to parse generated content');
    }
  }

  private async createFileStructure(parsedContent: any, options: any): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    const timestamp = Date.now();
    const moduleName = this.generateModuleName(options.outputFormat);
    
    // Generate main component file
    if (parsedContent.components && parsedContent.components.length > 0) {
      files.push({
        path: `integration/plugins/generated/${moduleName}/${moduleName}.tsx`,
        content: parsedContent.components[0],
        type: 'component'
      });
    }
    
    // Generate style files
    if (parsedContent.styles && parsedContent.styles.length > 0) {
      files.push({
        path: `integration/plugins/generated/${moduleName}/${moduleName}.styles.ts`,
        content: parsedContent.styles[0],
        type: 'style'
      });
    }
    
    // Generate test files if requested
    if (options.generateTests && parsedContent.tests && parsedContent.tests.length > 0) {
      files.push({
        path: `integration/plugins/generated/${moduleName}/${moduleName}.test.tsx`,
        content: parsedContent.tests[0],
        type: 'test'
      });
    }
    
    // Generate plugin configuration
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

  private createBlueprint(request: PromptRequest, files: GeneratedFile[]): any {
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
          JSON.parse(files.find(f => f.type === 'config')!.content).dependencies : []
      }
    };
  }

  private createMetadata(request: PromptRequest, blueprint: any): any {
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

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateModuleName(outputFormat: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${outputFormat}_${timestamp}_${random}`;
  }
}

@Controller('api')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post('prompt-generate')
  async generateFromPrompt(@Body() request: PromptRequest): Promise<PromptResponse> {
    // Validate request
    if (!request.prompt || request.prompt.trim().length < 10) {
      throw new HttpException(
        'Prompt must be at least 10 characters long',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!request.options || !request.options.outputFormat) {
      throw new HttpException(
        'Output format is required',
        HttpStatus.BAD_REQUEST
      );
    }

    const validFormats = ['component', 'page', 'widget'];
    if (!validFormats.includes(request.options.outputFormat)) {
      throw new HttpException(
        `Output format must be one of: ${validFormats.join(', ')}`,
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      return await this.promptService.generateFromPrompt(request);
    } catch (error) {
      console.error('Error in prompt generation endpoint:', error);
      throw new HttpException(
        'Internal server error during prompt generation',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

// Export types for use in other modules
export { PromptRequest, PromptResponse, GeneratedFile };
