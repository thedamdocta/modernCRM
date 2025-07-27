import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';

// CRM Entity Interfaces
export interface WebTemplate {
  id: string;
  name: string;
  slug: string;
  template_type: 'component' | 'page' | 'widget' | 'form';
  schema: ModuleSchema;
  render_page: string;
  linked_crm_record?: string;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'draft' | 'archived';
  created_by?: string;
  tags?: string[];
  version: number;
}

export interface PromptLog {
  id: string;
  prompt: string;
  generated_files: GeneratedFile[];
  timestamp: Date;
  status: 'success' | 'failure' | 'partial';
  feature_type: string;
  user_id: string;
  template_id?: string;
  execution_time_ms: number;
  error_message?: string;
  quality_score?: number;
}

export interface ModuleSchema {
  name: string;
  description: string;
  files: FileDefinition[];
  dependencies: string[];
  props?: Record<string, any>;
  metadata: Record<string, any>;
}

export interface FileDefinition {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'test';
}

export interface GeneratedFile {
  path: string;
  content: string;
  size: number;
  checksum: string;
}

export interface CRMEntityLink {
  entity_type: 'contact' | 'account' | 'opportunity' | 'custom';
  entity_id: string;
  relationship_type: 'created_for' | 'used_by' | 'related_to';
}

// CRM Connector Class
export class CRMConnector {
  private dataPath: string;
  private templatesPath: string;
  private logsPath: string;

  constructor(basePath: string = './integration/plugins/metadata-binding/data') {
    this.dataPath = basePath;
    this.templatesPath = path.join(basePath, 'templates');
    this.logsPath = path.join(basePath, 'logs');
  }

  async initialize(): Promise<void> {
    try {
      // Create data directories
      await fs.mkdir(this.dataPath, { recursive: true });
      await fs.mkdir(this.templatesPath, { recursive: true });
      await fs.mkdir(this.logsPath, { recursive: true });

      console.log('✅ CRM Connector initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize CRM Connector:', error);
      throw error;
    }
  }

  // WebTemplate CRUD Operations
  async createWebTemplate(templateData: Omit<WebTemplate, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<WebTemplate> {
    const template: WebTemplate = {
      ...templateData,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
      version: 1
    };

    const filePath = path.join(this.templatesPath, `${template.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(template, null, 2));

    console.log(`✅ Created WebTemplate: ${template.name} (${template.id})`);
    return template;
  }

  async getWebTemplate(id: string): Promise<WebTemplate | null> {
    try {
      const filePath = path.join(this.templatesPath, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as WebTemplate;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async updateWebTemplate(id: string, updates: Partial<WebTemplate>): Promise<WebTemplate | null> {
    const existing = await this.getWebTemplate(id);
    if (!existing) {
      return null;
    }

    const updated: WebTemplate = {
      ...existing,
      ...updates,
      id: existing.id, // Prevent ID changes
      created_at: existing.created_at, // Preserve creation date
      updated_at: new Date(),
      version: existing.version + 1
    };

    const filePath = path.join(this.templatesPath, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));

    console.log(`✅ Updated WebTemplate: ${updated.name} (${id})`);
    return updated;
  }

  async deleteWebTemplate(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.templatesPath, `${id}.json`);
      await fs.unlink(filePath);
      console.log(`✅ Deleted WebTemplate: ${id}`);
      return true;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async listWebTemplates(filters?: {
    status?: WebTemplate['status'];
    template_type?: WebTemplate['template_type'];
    created_by?: string;
    tags?: string[];
  }): Promise<WebTemplate[]> {
    try {
      const files = await fs.readdir(this.templatesPath);
      const templates: WebTemplate[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.templatesPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const template = JSON.parse(data) as WebTemplate;
          
          // Apply filters
          if (filters) {
            if (filters.status && template.status !== filters.status) continue;
            if (filters.template_type && template.template_type !== filters.template_type) continue;
            if (filters.created_by && template.created_by !== filters.created_by) continue;
            if (filters.tags && !filters.tags.some(tag => template.tags?.includes(tag))) continue;
          }
          
          templates.push(template);
        }
      }

      return templates.sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
    } catch (error) {
      console.error('❌ Failed to list WebTemplates:', error);
      return [];
    }
  }

  // PromptLog CRUD Operations
  async createPromptLog(logData: Omit<PromptLog, 'id' | 'timestamp'>): Promise<PromptLog> {
    const log: PromptLog = {
      ...logData,
      id: uuidv4(),
      timestamp: new Date()
    };

    const filePath = path.join(this.logsPath, `${log.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(log, null, 2));

    console.log(`✅ Created PromptLog: ${log.feature_type} (${log.id})`);
    return log;
  }

  async getPromptLog(id: string): Promise<PromptLog | null> {
    try {
      const filePath = path.join(this.logsPath, `${id}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as PromptLog;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async listPromptLogs(filters?: {
    status?: PromptLog['status'];
    feature_type?: string;
    user_id?: string;
    template_id?: string;
    start_date?: Date;
    end_date?: Date;
  }): Promise<PromptLog[]> {
    try {
      const files = await fs.readdir(this.logsPath);
      const logs: PromptLog[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.logsPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const log = JSON.parse(data) as PromptLog;
          
          // Apply filters
          if (filters) {
            if (filters.status && log.status !== filters.status) continue;
            if (filters.feature_type && log.feature_type !== filters.feature_type) continue;
            if (filters.user_id && log.user_id !== filters.user_id) continue;
            if (filters.template_id && log.template_id !== filters.template_id) continue;
            if (filters.start_date && new Date(log.timestamp) < filters.start_date) continue;
            if (filters.end_date && new Date(log.timestamp) > filters.end_date) continue;
          }
          
          logs.push(log);
        }
      }

      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('❌ Failed to list PromptLogs:', error);
      return [];
    }
  }

  // CRM Entity Linking
  async linkTemplateToEntity(templateId: string, entityLink: CRMEntityLink): Promise<boolean> {
    const template = await this.getWebTemplate(templateId);
    if (!template) {
      return false;
    }

    const updated = await this.updateWebTemplate(templateId, {
      linked_crm_record: entityLink.entity_id
    });

    return updated !== null;
  }

  async getTemplatesByEntity(entityId: string): Promise<WebTemplate[]> {
    const allTemplates = await this.listWebTemplates();
    return allTemplates.filter(template => template.linked_crm_record === entityId);
  }

  // Analytics and Reporting
  async getTemplateUsageStats(templateId: string): Promise<{
    total_uses: number;
    success_rate: number;
    avg_execution_time: number;
    last_used: Date | null;
  }> {
    const logs = await this.listPromptLogs({ template_id: templateId });
    
    if (logs.length === 0) {
      return {
        total_uses: 0,
        success_rate: 0,
        avg_execution_time: 0,
        last_used: null
      };
    }

    const successfulLogs = logs.filter(log => log.status === 'success');
    const avgExecutionTime = logs.reduce((sum, log) => sum + log.execution_time_ms, 0) / logs.length;
    const lastUsed = logs.length > 0 ? new Date(Math.max(...logs.map(log => new Date(log.timestamp).getTime()))) : null;

    return {
      total_uses: logs.length,
      success_rate: (successfulLogs.length / logs.length) * 100,
      avg_execution_time: avgExecutionTime,
      last_used: lastUsed
    };
  }

  async getSystemStats(): Promise<{
    total_templates: number;
    active_templates: number;
    total_generations: number;
    success_rate: number;
    popular_template_types: Array<{ type: string; count: number }>;
  }> {
    const templates = await this.listWebTemplates();
    const logs = await this.listPromptLogs();

    const activeTemplates = templates.filter(t => t.status === 'active').length;
    const successfulLogs = logs.filter(log => log.status === 'success');
    
    // Count template types
    const typeCount = templates.reduce((acc, template) => {
      acc[template.template_type] = (acc[template.template_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularTypes = Object.entries(typeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    return {
      total_templates: templates.length,
      active_templates: activeTemplates,
      total_generations: logs.length,
      success_rate: logs.length > 0 ? (successfulLogs.length / logs.length) * 100 : 0,
      popular_template_types: popularTypes
    };
  }

  // Template Versioning
  async createTemplateVersion(templateId: string, changes: Partial<WebTemplate>): Promise<WebTemplate | null> {
    const existing = await this.getWebTemplate(templateId);
    if (!existing) {
      return null;
    }

    // Create a new version with incremented version number
    const newVersion: WebTemplate = {
      ...existing,
      ...changes,
      id: uuidv4(), // New ID for new version
      version: existing.version + 1,
      updated_at: new Date()
    };

    // Save the new version
    const filePath = path.join(this.templatesPath, `${newVersion.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(newVersion, null, 2));

    console.log(`✅ Created new version ${newVersion.version} of template: ${newVersion.name}`);
    return newVersion;
  }

  async getTemplateVersions(templateName: string): Promise<WebTemplate[]> {
    const allTemplates = await this.listWebTemplates();
    return allTemplates
      .filter(template => template.name === templateName)
      .sort((a, b) => b.version - a.version);
  }

  // Cleanup and Maintenance
  async archiveOldTemplates(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const templates = await this.listWebTemplates();
    let archivedCount = 0;

    for (const template of templates) {
      if (template.status !== 'archived' && new Date(template.updated_at) < cutoffDate) {
        await this.updateWebTemplate(template.id, { status: 'archived' });
        archivedCount++;
      }
    }

    console.log(`✅ Archived ${archivedCount} old templates`);
    return archivedCount;
  }

  async cleanupOldLogs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const logs = await this.listPromptLogs();
    let deletedCount = 0;

    for (const log of logs) {
      if (new Date(log.timestamp) < cutoffDate) {
        try {
          const filePath = path.join(this.logsPath, `${log.id}.json`);
          await fs.unlink(filePath);
          deletedCount++;
        } catch (error) {
          console.error(`Failed to delete log ${log.id}:`, error);
        }
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} old logs`);
    return deletedCount;
  }
}

export default CRMConnector;
