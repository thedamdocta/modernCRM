import { CRMConnector } from './metadata-binding/crm-connector';
import { ValidationEngine } from './qa-pipeline/validation-engine';
import { DesignValidator } from './visual-compliance/design-validator';
import { ModuleCreator } from './module-creator';
import { PluginHotReload } from './plugin-hot-reload';
import GeminiClient from './gemini-client-mock';

// Sprint 4 Integration Interfaces
export interface Sprint4Config {
  enableCRMBinding: boolean;
  enableQAPipeline: boolean;
  enableVisualCompliance: boolean;
  enableAdvancedGeneration: boolean;
  qualityThreshold: number;
  complianceThreshold: number;
}

export interface GenerationRequest {
  prompt: string;
  type: 'component' | 'page' | 'widget' | 'form';
  requirements?: {
    accessibility?: boolean;
    responsive?: boolean;
    brandCompliant?: boolean;
    crmIntegration?: boolean;
  };
  metadata?: {
    userId?: string;
    projectId?: string;
    templateId?: string;
  };
}

export interface GenerationResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'test';
  }>;
  metadata: {
    templateId?: string;
    promptLogId?: string;
    qualityScore: number;
    complianceScore: number;
  };
  validation: {
    qa_report: any;
    compliance_report: any;
  };
  recommendations: string[];
  errors?: string[];
}

// Main Sprint 4 Integration Class
export class Sprint4Integration {
  private crmConnector: CRMConnector;
  private validationEngine: ValidationEngine;
  private designValidator: DesignValidator;
  private moduleCreator: ModuleCreator;
  private pluginSystem: PluginHotReload;
  private geminiClient: GeminiClient;
  private config: Sprint4Config;
  private initialized: boolean = false;

  constructor(config: Partial<Sprint4Config> = {}) {
    this.config = {
      enableCRMBinding: true,
      enableQAPipeline: true,
      enableVisualCompliance: true,
      enableAdvancedGeneration: true,
      qualityThreshold: 80,
      complianceThreshold: 85,
      ...config
    };

    // Initialize components
    this.crmConnector = new CRMConnector();
    this.validationEngine = new ValidationEngine();
    this.designValidator = new DesignValidator();
    this.moduleCreator = new ModuleCreator();
    this.pluginSystem = new PluginHotReload();
    this.geminiClient = new GeminiClient();
  }

  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Sprint 4 Integration System...');

      // Initialize all components
      if (this.config.enableCRMBinding) {
        await this.crmConnector.initialize();
        console.log('✅ CRM Connector initialized');
      }

      if (this.config.enableQAPipeline) {
        await this.validationEngine.initialize();
        console.log('✅ QA Pipeline initialized');
      }

      if (this.config.enableVisualCompliance) {
        await this.designValidator.initialize();
        console.log('✅ Visual Compliance initialized');
      }

      // Initialize plugin system
      await this.pluginSystem.start();
      console.log('✅ Plugin System initialized');

      this.initialized = true;
      console.log('🎉 Sprint 4 Integration System ready!');

    } catch (error) {
      console.error('❌ Failed to initialize Sprint 4 Integration System:', error);
      throw error;
    }
  }

  // Enhanced code generation with full pipeline
  async generateWithPipeline(request: GenerationRequest): Promise<GenerationResult> {
    if (!this.initialized) {
      throw new Error('System not initialized. Call initialize() first.');
    }

    console.log(`🔄 Processing generation request: ${request.type}`);
    
    try {
      // Step 1: Generate initial code
      const generatedFiles = await this.generateCode(request);
      
      // Step 2: Run QA validation if enabled
      let qaReport = null;
      if (this.config.enableQAPipeline) {
        console.log('🔍 Running QA validation...');
        qaReport = await this.validationEngine.validateFiles(generatedFiles);
      }

      // Step 3: Run visual compliance check if enabled
      let complianceReport = null;
      if (this.config.enableVisualCompliance) {
        console.log('🎨 Running visual compliance check...');
        complianceReport = await this.designValidator.validateCompliance(generatedFiles);
      }

      // Step 4: Calculate scores
      const qualityScore = qaReport?.overall_score || 100;
      const complianceScore = complianceReport?.overall_score || 100;

      // Step 5: Check if quality meets thresholds
      const meetsQualityThreshold = qualityScore >= this.config.qualityThreshold;
      const meetsComplianceThreshold = complianceScore >= this.config.complianceThreshold;

      // Step 6: Store in CRM if enabled and quality is good
      let templateId: string | undefined;
      let promptLogId: string | undefined;

      if (this.config.enableCRMBinding && meetsQualityThreshold && meetsComplianceThreshold) {
        console.log('💾 Storing in CRM system...');
        
        // Create template record
        const template = await this.crmConnector.createWebTemplate({
          name: `${request.type}-${Date.now()}`,
          slug: `${request.type}-${Date.now()}`,
          template_type: request.type,
          schema: {
            name: `Generated ${request.type}`,
            description: request.prompt,
            files: generatedFiles.map(f => ({
              path: f.path,
              content: f.content,
              type: f.type
            })),
            dependencies: [],
            metadata: request.metadata || {}
          },
          render_page: generatedFiles.find(f => f.type === 'component')?.content || '',
          status: 'active',
          created_by: request.metadata?.userId
        });
        templateId = template.id;

        // Create prompt log
        const promptLog = await this.crmConnector.createPromptLog({
          prompt: request.prompt,
          generated_files: generatedFiles.map(f => ({
            path: f.path,
            content: f.content,
            size: f.content.length,
            checksum: this.generateChecksum(f.content)
          })),
          status: 'success',
          feature_type: request.type,
          user_id: request.metadata?.userId || 'anonymous',
          template_id: templateId,
          execution_time_ms: 0, // Would be calculated in real implementation
          quality_score: qualityScore
        });
        promptLogId = promptLog.id;
      }

      // Step 7: Generate recommendations
      const recommendations = this.generateRecommendations(qaReport, complianceReport);

      const result: GenerationResult = {
        success: meetsQualityThreshold && meetsComplianceThreshold,
        files: generatedFiles,
        metadata: {
          templateId,
          promptLogId,
          qualityScore,
          complianceScore
        },
        validation: {
          qa_report: qaReport,
          compliance_report: complianceReport
        },
        recommendations,
        errors: []
      };

      // Add warnings if thresholds not met
      if (!meetsQualityThreshold) {
        result.errors?.push(`Quality score ${qualityScore} below threshold ${this.config.qualityThreshold}`);
      }
      if (!meetsComplianceThreshold) {
        result.errors?.push(`Compliance score ${complianceScore} below threshold ${this.config.complianceThreshold}`);
      }

      console.log(`✅ Generation complete - Quality: ${qualityScore}%, Compliance: ${complianceScore}%`);
      return result;

    } catch (error) {
      console.error('❌ Generation pipeline failed:', error);
      return {
        success: false,
        files: [],
        metadata: {
          qualityScore: 0,
          complianceScore: 0
        },
        validation: {
          qa_report: null,
          compliance_report: null
        },
        recommendations: ['Fix generation pipeline errors'],
        errors: [error.message]
      };
    }
  }

  // Generate code using existing module creator
  private async generateCode(request: GenerationRequest): Promise<Array<{
    path: string;
    content: string;
    type: 'component' | 'style' | 'config' | 'test';
  }>> {
    // Create module data structure expected by ModuleCreator
    const moduleData = {
      name: `Generated ${request.type}`,
      slug: `${request.type}-${Date.now()}`,
      feature_type: request.type,
      metadata: {
        description: request.prompt,
        dependencies: [],
        routes: [],
        integration_points: []
      },
      files: [
        {
          path: `${request.type}.tsx`,
          content: this.generateBasicComponent(request),
          type: 'component'
        }
      ]
    };

    const generatedModule = await this.moduleCreator.createModule(moduleData);

    return generatedModule.files.map(file => ({
      path: file.path,
      content: file.content,
      type: file.type as 'component' | 'style' | 'config' | 'test'
    }));
  }

  // Generate a basic component based on the request
  private generateBasicComponent(request: GenerationRequest): string {
    const componentName = request.type.charAt(0).toUpperCase() + request.type.slice(1);
    
    return `import React from 'react';

interface ${componentName}Props {
  // Add props based on requirements
}

const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <div className="${request.type}-container">
      <h2>${componentName}</h2>
      <p>Generated from prompt: ${request.prompt}</p>
      {/* Add component logic based on requirements */}
    </div>
  );
};

export default ${componentName};
`;
  }

  // Analytics and reporting
  async getSystemAnalytics(): Promise<{
    generation_stats: any;
    quality_trends: any;
    compliance_trends: any;
    template_usage: any;
  }> {
    if (!this.config.enableCRMBinding) {
      return {
        generation_stats: null,
        quality_trends: null,
        compliance_trends: null,
        template_usage: null
      };
    }

    try {
      const systemStats = await this.crmConnector.getSystemStats();
      
      // Get recent prompt logs for trends
      const recentLogs = await this.crmConnector.listPromptLogs({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      });

      const qualityTrends = this.calculateQualityTrends(recentLogs);
      const complianceTrends = this.calculateComplianceTrends(recentLogs);

      return {
        generation_stats: systemStats,
        quality_trends: qualityTrends,
        compliance_trends: complianceTrends,
        template_usage: await this.getTemplateUsageStats()
      };

    } catch (error) {
      console.error('Failed to get system analytics:', error);
      return {
        generation_stats: null,
        quality_trends: null,
        compliance_trends: null,
        template_usage: null
      };
    }
  }

  // Template management
  async getTemplate(templateId: string): Promise<any> {
    if (!this.config.enableCRMBinding) {
      throw new Error('CRM binding not enabled');
    }
    return await this.crmConnector.getWebTemplate(templateId);
  }

  async listTemplates(filters?: any): Promise<any[]> {
    if (!this.config.enableCRMBinding) {
      return [];
    }
    return await this.crmConnector.listWebTemplates(filters);
  }

  async updateTemplate(templateId: string, updates: any): Promise<any> {
    if (!this.config.enableCRMBinding) {
      throw new Error('CRM binding not enabled');
    }
    return await this.crmConnector.updateWebTemplate(templateId, updates);
  }

  // System maintenance
  async runMaintenance(): Promise<{
    archived_templates: number;
    cleaned_logs: number;
    system_health: 'good' | 'warning' | 'critical';
  }> {
    console.log('🧹 Running system maintenance...');

    let archivedTemplates = 0;
    let cleanedLogs = 0;

    if (this.config.enableCRMBinding) {
      archivedTemplates = await this.crmConnector.archiveOldTemplates(90);
      cleanedLogs = await this.crmConnector.cleanupOldLogs(30);
    }

    // Check system health
    const systemHealth = await this.checkSystemHealth();

    console.log(`✅ Maintenance complete - Archived: ${archivedTemplates}, Cleaned: ${cleanedLogs}`);

    return {
      archived_templates: archivedTemplates,
      cleaned_logs: cleanedLogs,
      system_health: systemHealth
    };
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Sprint 4 Integration System...');
    
    try {
      await this.pluginSystem.stop();
      console.log('✅ Plugin system stopped');
      
      this.initialized = false;
      console.log('✅ Sprint 4 Integration System shutdown complete');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
    }
  }

  // Private helper methods
  private generateChecksum(content: string): string {
    // Simple checksum implementation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private generateRecommendations(qaReport: any, complianceReport: any): string[] {
    const recommendations: string[] = [];

    if (qaReport) {
      recommendations.push(...qaReport.recommendations);
    }

    if (complianceReport) {
      if (complianceReport.design_tokens) {
        recommendations.push(...complianceReport.design_tokens.recommendations);
      }
      if (complianceReport.accessibility) {
        recommendations.push(...complianceReport.accessibility.recommendations);
      }
      if (complianceReport.responsive) {
        recommendations.push(...complianceReport.responsive.recommendations);
      }
      if (complianceReport.brand_guidelines) {
        recommendations.push(...complianceReport.brand_guidelines.recommendations);
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  private calculateQualityTrends(logs: any[]): any {
    const trends = logs.map(log => ({
      date: log.timestamp,
      score: log.quality_score || 0
    }));

    return {
      average_score: trends.reduce((sum, t) => sum + t.score, 0) / trends.length || 0,
      trend_direction: this.calculateTrendDirection(trends.map(t => t.score)),
      data_points: trends
    };
  }

  private calculateComplianceTrends(logs: any[]): any {
    // Mock compliance trends - in real implementation would extract from validation reports
    const trends = logs.map(log => ({
      date: log.timestamp,
      score: Math.random() * 100 // Mock compliance score
    }));

    return {
      average_score: trends.reduce((sum, t) => sum + t.score, 0) / trends.length || 0,
      trend_direction: this.calculateTrendDirection(trends.map(t => t.score)),
      data_points: trends
    };
  }

  private calculateTrendDirection(scores: number[]): 'up' | 'down' | 'stable' {
    if (scores.length < 2) return 'stable';
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  }

  private async getTemplateUsageStats(): Promise<any> {
    const templates = await this.crmConnector.listWebTemplates();
    const usageStats = [];

    for (const template of templates.slice(0, 10)) { // Top 10
      const stats = await this.crmConnector.getTemplateUsageStats(template.id);
      usageStats.push({
        template_name: template.name,
        template_type: template.template_type,
        ...stats
      });
    }

    return usageStats.sort((a, b) => b.total_uses - a.total_uses);
  }

  private async checkSystemHealth(): Promise<'good' | 'warning' | 'critical'> {
    try {
      // Check if all systems are responsive
      const checks = [];

      if (this.config.enableCRMBinding) {
        checks.push(this.crmConnector.getSystemStats());
      }

      await Promise.all(checks);
      return 'good';

    } catch (error) {
      console.warn('System health check failed:', error);
      return 'warning';
    }
  }
}

export default Sprint4Integration;
