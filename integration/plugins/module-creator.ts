/**
 * Module Creator for Modern CRM Integration Project
 * Handles dynamic plugin module creation, scaffolding, and file system management
 */

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ModuleConfig {
  name: string;
  slug: string;
  featureType: string;
  description: string;
  version: string;
  author?: string;
  dependencies: string[];
  routes: string[];
  integrationPoints: string[];
}

export interface ModuleFile {
  path: string;
  content: string;
  type: 'component' | 'config' | 'schema' | 'migration' | 'test' | 'style';
}

export interface GeneratedModule {
  id: string;
  config: ModuleConfig;
  files: ModuleFile[];
  pluginManifest: any;
  metadata: {
    createdAt: string;
    generatedBy: string;
    status: 'created' | 'active' | 'inactive' | 'error';
  };
}

export class ModuleCreator {
  private readonly generatedModulesPath: string;
  private readonly pluginsConfigPath: string;

  constructor() {
    this.generatedModulesPath = path.join(process.cwd(), 'integration/plugins/generated');
    this.pluginsConfigPath = path.join(process.cwd(), 'integration/plugins/plugins.json');
  }

  /**
   * Create a new module from generated content
   * @param moduleData - Generated module data from AI
   * @returns Promise<GeneratedModule>
   */
  async createModule(moduleData: any): Promise<GeneratedModule> {
    try {
      console.log('Creating new module:', moduleData.name);

      // Generate unique module ID
      const moduleId = uuidv4();
      const timestamp = new Date().toISOString();

      // Create module configuration
      const moduleConfig: ModuleConfig = {
        name: moduleData.name,
        slug: moduleData.slug,
        featureType: moduleData.feature_type,
        description: moduleData.metadata?.description || 'AI-generated module',
        version: '1.0.0',
        author: 'AI Generator',
        dependencies: moduleData.metadata?.dependencies || [],
        routes: moduleData.metadata?.routes || [],
        integrationPoints: moduleData.metadata?.integration_points || []
      };

      // Process and validate files
      const processedFiles = await this.processModuleFiles(moduleData.files, moduleConfig);

      // Create plugin manifest
      const pluginManifest = this.createPluginManifest(moduleConfig, processedFiles);

      // Create module structure
      const generatedModule: GeneratedModule = {
        id: moduleId,
        config: moduleConfig,
        files: processedFiles,
        pluginManifest,
        metadata: {
          createdAt: timestamp,
          generatedBy: 'AI-Gemini-2.5-Flash',
          status: 'created'
        }
      };

      // Write module to file system
      await this.writeModuleToFileSystem(generatedModule);

      // Update plugins registry
      await this.updatePluginsRegistry(generatedModule);

      console.log(`Module ${moduleConfig.name} created successfully with ID: ${moduleId}`);
      return generatedModule;

    } catch (error) {
      console.error('Error creating module:', error);
      throw new Error(`Module creation failed: ${error.message}`);
    }
  }

  /**
   * Process and validate module files
   */
  private async processModuleFiles(files: any[], config: ModuleConfig): Promise<ModuleFile[]> {
    const processedFiles: ModuleFile[] = [];

    for (const file of files) {
      // Validate file structure
      if (!file.path || !file.content) {
        throw new Error(`Invalid file structure: missing path or content`);
      }

      // Determine file type
      const fileType = this.determineFileType(file.path, file.type);

      // Process file content (add imports, fix paths, etc.)
      const processedContent = await this.processFileContent(file.content, file.path, config);

      processedFiles.push({
        path: file.path,
        content: processedContent,
        type: fileType
      });
    }

    // Add required files if missing
    await this.addRequiredFiles(processedFiles, config);

    return processedFiles;
  }

  /**
   * Determine file type based on path and extension
   */
  private determineFileType(filePath: string, explicitType?: string): ModuleFile['type'] {
    if (explicitType) {
      return explicitType as ModuleFile['type'];
    }

    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);

    if (ext === '.tsx' || ext === '.jsx') return 'component';
    if (ext === '.ts' && !fileName.includes('.test.') && !fileName.includes('.spec.')) return 'config';
    if (ext === '.sql' || fileName.includes('migration')) return 'migration';
    if (fileName.includes('.test.') || fileName.includes('.spec.')) return 'test';
    if (ext === '.css' || ext === '.scss' || ext === '.less') return 'style';
    if (fileName === 'schema.graphql' || fileName.includes('schema')) return 'schema';

    return 'config';
  }

  /**
   * Process file content to fix imports and paths
   */
  private async processFileContent(content: string, filePath: string, config: ModuleConfig): Promise<string> {
    let processedContent = content;

    // Fix relative imports for generated modules
    processedContent = processedContent.replace(
      /from ['"]\.\.?\//g,
      `from '../../../`
    );

    // Add module header comment
    const header = `/**
 * Generated Module: ${config.name}
 * Type: ${config.featureType}
 * Generated: ${new Date().toISOString()}
 * 
 * This file was automatically generated by the Modern CRM AI system.
 * Modifications may be overwritten on regeneration.
 */

`;

    // Add header to TypeScript/JavaScript files
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      processedContent = header + processedContent;
    }

    return processedContent;
  }

  /**
   * Add required files if they don't exist
   */
  private async addRequiredFiles(files: ModuleFile[], config: ModuleConfig): Promise<void> {
    const existingPaths = files.map(f => f.path);

    // Add index.ts if missing
    if (!existingPaths.some(p => p.endsWith('index.ts') || p.endsWith('index.tsx'))) {
      files.push({
        path: 'index.ts',
        content: this.generateIndexFile(files, config),
        type: 'config'
      });
    }

    // Add package.json if missing
    if (!existingPaths.some(p => p.endsWith('package.json'))) {
      files.push({
        path: 'package.json',
        content: this.generatePackageJson(config),
        type: 'config'
      });
    }

    // Add README.md if missing
    if (!existingPaths.some(p => p.endsWith('README.md'))) {
      files.push({
        path: 'README.md',
        content: this.generateReadme(config),
        type: 'config'
      });
    }
  }

  /**
   * Generate index.ts file for module exports
   */
  private generateIndexFile(files: ModuleFile[], config: ModuleConfig): string {
    const componentFiles = files.filter(f => f.type === 'component');
    const exports = componentFiles.map(f => {
      const fileName = path.basename(f.path, path.extname(f.path));
      return `export { default as ${fileName} } from './${f.path.replace('.tsx', '').replace('.ts', '')}';`;
    }).join('\n');

    return `/**
 * Generated Module: ${config.name}
 * Main export file for all module components and utilities
 */

${exports}

export const moduleInfo = {
  name: '${config.name}',
  slug: '${config.slug}',
  version: '${config.version}',
  featureType: '${config.featureType}',
  description: '${config.description}'
};
`;
  }

  /**
   * Generate package.json for the module
   */
  private generatePackageJson(config: ModuleConfig): string {
    const packageJson = {
      name: `@modern-crm/plugin-${config.slug}`,
      version: config.version,
      description: config.description,
      main: 'index.ts',
      author: config.author || 'AI Generator',
      license: 'MIT',
      dependencies: config.dependencies.reduce((deps, dep) => {
        deps[dep] = 'latest';
        return deps;
      }, {} as Record<string, string>),
      peerDependencies: {
        'react': '^18.0.0',
        'typescript': '^5.0.0'
      },
      keywords: [
        'modern-crm',
        'plugin',
        config.featureType,
        'ai-generated'
      ]
    };

    return JSON.stringify(packageJson, null, 2);
  }

  /**
   * Generate README.md for the module
   */
  private generateReadme(config: ModuleConfig): string {
    return `# ${config.name}

${config.description}

## Overview

This module was automatically generated by the Modern CRM AI system. It provides ${config.featureType} functionality integrated with Twenty CRM and Webstudio.

## Features

- **Type**: ${config.featureType}
- **Version**: ${config.version}
- **Integration Points**: ${config.integrationPoints.join(', ')}
- **Routes**: ${config.routes.join(', ')}

## Dependencies

${config.dependencies.map(dep => `- ${dep}`).join('\n')}

## Usage

This module is automatically loaded by the Modern CRM plugin system. No manual installation is required.

## Generated Files

- Components: React components for UI functionality
- Services: Backend services and API integrations
- Types: TypeScript type definitions
- Tests: Unit tests for validation
- Styles: CSS styling with design tokens

## Modification

⚠️ **Warning**: This module was automatically generated. Manual modifications may be overwritten when the module is regenerated.

For customizations, consider:
1. Creating a custom plugin based on this generated code
2. Using the AI prompt system to regenerate with modifications
3. Extending the module through the plugin API

---

Generated on: ${new Date().toISOString()}
Generator: Modern CRM AI System (Gemini 2.5 Flash)
`;
  }

  /**
   * Create plugin manifest for the module
   */
  private createPluginManifest(config: ModuleConfig, files: ModuleFile[]): any {
    return {
      id: config.slug,
      name: config.name,
      version: config.version,
      description: config.description,
      type: 'generated-module',
      featureType: config.featureType,
      author: config.author,
      
      // Entry points
      main: 'index.ts',
      components: files
        .filter(f => f.type === 'component')
        .map(f => ({
          name: path.basename(f.path, path.extname(f.path)),
          path: f.path,
          type: 'react-component'
        })),
      
      // Routes and navigation
      routes: config.routes.map(route => ({
        path: route,
        component: config.slug,
        title: config.name
      })),
      
      // CRM integration
      integration: {
        entities: config.integrationPoints,
        permissions: ['read', 'write'],
        hooks: ['onCreate', 'onUpdate']
      },
      
      // Dependencies
      dependencies: config.dependencies,
      
      // Metadata
      metadata: {
        generated: true,
        aiGenerated: true,
        generator: 'gemini-2.5-flash',
        createdAt: new Date().toISOString(),
        tags: [config.featureType, 'ai-generated', 'plugin']
      }
    };
  }

  /**
   * Write module to file system
   */
  private async writeModuleToFileSystem(module: GeneratedModule): Promise<void> {
    const modulePath = path.join(this.generatedModulesPath, module.config.slug);
    
    // Create module directory
    await fs.mkdir(modulePath, { recursive: true });

    // Write all module files
    for (const file of module.files) {
      const filePath = path.join(modulePath, file.path);
      const fileDir = path.dirname(filePath);
      
      // Create subdirectories if needed
      await fs.mkdir(fileDir, { recursive: true });
      
      // Write file content
      await fs.writeFile(filePath, file.content, 'utf-8');
    }

    // Write plugin manifest
    const manifestPath = path.join(modulePath, 'plugin.json');
    await fs.writeFile(manifestPath, JSON.stringify(module.pluginManifest, null, 2), 'utf-8');

    // Write module metadata
    const metadataPath = path.join(modulePath, 'module-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify({
      id: module.id,
      config: module.config,
      metadata: module.metadata
    }, null, 2), 'utf-8');

    console.log(`Module files written to: ${modulePath}`);
  }

  /**
   * Update plugins registry with new module
   */
  private async updatePluginsRegistry(module: GeneratedModule): Promise<void> {
    try {
      // Read existing plugins configuration
      let pluginsConfig: any = { plugins: [] };
      
      try {
        const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
        pluginsConfig = JSON.parse(configContent);
      } catch (error) {
        console.log('Creating new plugins configuration file');
      }

      // Add new module to plugins list
      const newPlugin = {
        id: module.config.slug,
        name: module.config.name,
        version: module.config.version,
        type: 'generated-module',
        path: `./generated/${module.config.slug}`,
        enabled: true,
        metadata: {
          ...module.metadata,
          featureType: module.config.featureType,
          routes: module.config.routes,
          integrationPoints: module.config.integrationPoints
        }
      };

      // Remove existing plugin with same ID if it exists
      pluginsConfig.plugins = pluginsConfig.plugins.filter((p: any) => p.id !== module.config.slug);
      
      // Add new plugin
      pluginsConfig.plugins.push(newPlugin);

      // Write updated configuration
      await fs.writeFile(this.pluginsConfigPath, JSON.stringify(pluginsConfig, null, 2), 'utf-8');
      
      console.log(`Plugin registry updated with module: ${module.config.name}`);
    } catch (error) {
      console.error('Error updating plugins registry:', error);
      throw new Error(`Failed to update plugins registry: ${error.message}`);
    }
  }

  /**
   * List all generated modules
   */
  async listGeneratedModules(): Promise<GeneratedModule[]> {
    try {
      const modules: GeneratedModule[] = [];
      
      // Check if generated modules directory exists
      try {
        await fs.access(this.generatedModulesPath);
      } catch {
        return modules; // Directory doesn't exist, return empty array
      }

      const moduleDirectories = await fs.readdir(this.generatedModulesPath);
      
      for (const dirName of moduleDirectories) {
        const modulePath = path.join(this.generatedModulesPath, dirName);
        const metadataPath = path.join(modulePath, 'module-metadata.json');
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf-8');
          const moduleData = JSON.parse(metadataContent);
          
          // Load module files
          const files = await this.loadModuleFiles(modulePath);
          
          // Load plugin manifest
          const manifestPath = path.join(modulePath, 'plugin.json');
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const pluginManifest = JSON.parse(manifestContent);
          
          modules.push({
            id: moduleData.id,
            config: moduleData.config,
            files,
            pluginManifest,
            metadata: moduleData.metadata
          });
        } catch (error) {
          console.warn(`Could not load module metadata for ${dirName}:`, error.message);
        }
      }
      
      return modules;
    } catch (error) {
      console.error('Error listing generated modules:', error);
      return [];
    }
  }

  /**
   * Load module files from file system
   */
  private async loadModuleFiles(modulePath: string): Promise<ModuleFile[]> {
    const files: ModuleFile[] = [];
    
    const loadFilesRecursively = async (currentPath: string, relativePath: string = '') => {
      const items = await fs.readdir(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const relativeItemPath = path.join(relativePath, item);
        const stat = await fs.stat(itemPath);
        
        if (stat.isDirectory()) {
          await loadFilesRecursively(itemPath, relativeItemPath);
        } else if (!item.startsWith('.') && item !== 'module-metadata.json') {
          const content = await fs.readFile(itemPath, 'utf-8');
          const fileType = this.determineFileType(relativeItemPath);
          
          files.push({
            path: relativeItemPath,
            content,
            type: fileType
          });
        }
      }
    };
    
    await loadFilesRecursively(modulePath);
    return files;
  }

  /**
   * Delete a generated module
   */
  async deleteModule(moduleSlug: string): Promise<boolean> {
    try {
      const modulePath = path.join(this.generatedModulesPath, moduleSlug);
      
      // Check if module exists
      try {
        await fs.access(modulePath);
      } catch {
        console.warn(`Module ${moduleSlug} not found`);
        return false;
      }

      // Remove module directory
      await fs.rm(modulePath, { recursive: true, force: true });
      
      // Update plugins registry
      await this.removeFromPluginsRegistry(moduleSlug);
      
      console.log(`Module ${moduleSlug} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Error deleting module ${moduleSlug}:`, error);
      return false;
    }
  }

  /**
   * Remove module from plugins registry
   */
  private async removeFromPluginsRegistry(moduleSlug: string): Promise<void> {
    try {
      const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
      const pluginsConfig = JSON.parse(configContent);
      
      // Remove plugin from list
      pluginsConfig.plugins = pluginsConfig.plugins.filter((p: any) => p.id !== moduleSlug);
      
      // Write updated configuration
      await fs.writeFile(this.pluginsConfigPath, JSON.stringify(pluginsConfig, null, 2), 'utf-8');
      
      console.log(`Removed ${moduleSlug} from plugins registry`);
    } catch (error) {
      console.error('Error removing from plugins registry:', error);
    }
  }

  /**
   * Activate/deactivate a module
   */
  async toggleModuleStatus(moduleSlug: string, enabled: boolean): Promise<boolean> {
    try {
      const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
      const pluginsConfig = JSON.parse(configContent);
      
      // Find and update plugin status
      const plugin = pluginsConfig.plugins.find((p: any) => p.id === moduleSlug);
      if (!plugin) {
        console.warn(`Plugin ${moduleSlug} not found in registry`);
        return false;
      }
      
      plugin.enabled = enabled;
      
      // Write updated configuration
      await fs.writeFile(this.pluginsConfigPath, JSON.stringify(pluginsConfig, null, 2), 'utf-8');
      
      console.log(`Module ${moduleSlug} ${enabled ? 'activated' : 'deactivated'}`);
      return true;
    } catch (error) {
      console.error(`Error toggling module status for ${moduleSlug}:`, error);
      return false;
    }
  }

  /**
   * Get module information by slug
   */
  async getModule(moduleSlug: string): Promise<GeneratedModule | null> {
    try {
      const modulePath = path.join(this.generatedModulesPath, moduleSlug);
      const metadataPath = path.join(modulePath, 'module-metadata.json');
      
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const moduleData = JSON.parse(metadataContent);
      
      // Load module files
      const files = await this.loadModuleFiles(modulePath);
      
      // Load plugin manifest
      const manifestPath = path.join(modulePath, 'plugin.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const pluginManifest = JSON.parse(manifestContent);
      
      return {
        id: moduleData.id,
        config: moduleData.config,
        files,
        pluginManifest,
        metadata: moduleData.metadata
      };
    } catch (error) {
      console.error(`Error getting module ${moduleSlug}:`, error);
      return null;
    }
  }
}

export default ModuleCreator;
