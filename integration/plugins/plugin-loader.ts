import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PluginConfig, PluginManifest, LoadedPlugin } from './types';

@Injectable()
export class PluginLoader {
  private readonly logger = new Logger(PluginLoader.name);
  private loadedPlugins = new Map<string, LoadedPlugin>();
  private pluginManifest: PluginManifest | null = null;

  constructor(private moduleRef: ModuleRef) {}

  /**
   * Load all plugins from the plugins.json manifest
   */
  async loadPlugins(): Promise<void> {
    try {
      const manifestPath = path.join(process.cwd(), 'integration/plugins/plugins.json');
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      this.pluginManifest = JSON.parse(manifestContent);

      this.logger.log(`Loading ${this.pluginManifest.plugins.length} plugins...`);

      for (const plugin of this.pluginManifest.plugins) {
        if (plugin.status === 'active' || plugin.status === 'development') {
          await this.loadPlugin(plugin);
        }
      }

      this.logger.log(`Successfully loaded ${this.loadedPlugins.size} plugins`);
    } catch (error) {
      this.logger.error('Failed to load plugins:', error);
      throw error;
    }
  }

  /**
   * Load a single plugin
   */
  private async loadPlugin(config: PluginConfig): Promise<void> {
    try {
      this.logger.log(`Loading plugin: ${config.name} (${config.id})`);

      // Validate plugin configuration
      this.validatePluginConfig(config);

      // Create plugin directory structure if it doesn't exist
      await this.ensurePluginDirectories(config);

      // Load plugin components
      const loadedPlugin: LoadedPlugin = {
        config,
        routes: config.routes || [],
        services: new Map(),
        controllers: new Map(),
        resolvers: new Map(),
        entities: new Map(),
        isLoaded: false,
        loadedAt: new Date(),
      };

      // Register backend services if they exist
      if (config.backend) {
        await this.loadBackendComponents(config, loadedPlugin);
      }

      // Register database entities if they exist
      if (config.database) {
        await this.loadDatabaseComponents(config, loadedPlugin);
      }

      loadedPlugin.isLoaded = true;
      this.loadedPlugins.set(config.id, loadedPlugin);

      this.logger.log(`Plugin ${config.name} loaded successfully`);
    } catch (error) {
      this.logger.error(`Failed to load plugin ${config.name}:`, error);
      throw error;
    }
  }

  /**
   * Validate plugin configuration
   */
  private validatePluginConfig(config: PluginConfig): void {
    if (!config.id || !config.name || !config.version) {
      throw new Error(`Invalid plugin configuration: missing required fields`);
    }

    if (this.loadedPlugins.has(config.id)) {
      throw new Error(`Plugin with ID ${config.id} is already loaded`);
    }
  }

  /**
   * Ensure plugin directories exist
   */
  private async ensurePluginDirectories(config: PluginConfig): Promise<void> {
    const pluginDir = path.join(process.cwd(), 'integration/plugins', config.id);
    const generatedDir = path.join(pluginDir, 'generated');
    const templatesDir = path.join(pluginDir, 'templates');

    try {
      await fs.mkdir(pluginDir, { recursive: true });
      await fs.mkdir(generatedDir, { recursive: true });
      await fs.mkdir(templatesDir, { recursive: true });
    } catch (error) {
      this.logger.warn(`Could not create directories for plugin ${config.id}:`, error);
    }
  }

  /**
   * Load backend components (services, controllers, resolvers)
   */
  private async loadBackendComponents(config: PluginConfig, plugin: LoadedPlugin): Promise<void> {
    if (!config.backend) return;

    // Load services
    if (config.backend.services) {
      for (const serviceName of config.backend.services) {
        try {
          const servicePath = path.join(process.cwd(), 'integration/plugins', config.id, 'services', `${serviceName}.ts`);
          // In a real implementation, you would dynamically import the service
          // const ServiceClass = await import(servicePath);
          // plugin.services.set(serviceName, ServiceClass);
          this.logger.log(`Registered service: ${serviceName} for plugin ${config.id}`);
        } catch (error) {
          this.logger.warn(`Could not load service ${serviceName} for plugin ${config.id}:`, error);
        }
      }
    }

    // Load controllers
    if (config.backend.controllers) {
      for (const controllerName of config.backend.controllers) {
        try {
          const controllerPath = path.join(process.cwd(), 'integration/plugins', config.id, 'controllers', `${controllerName}.ts`);
          // In a real implementation, you would dynamically import the controller
          // const ControllerClass = await import(controllerPath);
          // plugin.controllers.set(controllerName, ControllerClass);
          this.logger.log(`Registered controller: ${controllerName} for plugin ${config.id}`);
        } catch (error) {
          this.logger.warn(`Could not load controller ${controllerName} for plugin ${config.id}:`, error);
        }
      }
    }

    // Load GraphQL resolvers
    if (config.backend.graphql?.resolvers) {
      for (const resolverName of config.backend.graphql.resolvers) {
        try {
          const resolverPath = path.join(process.cwd(), 'integration/plugins', config.id, 'resolvers', `${resolverName}.ts`);
          // In a real implementation, you would dynamically import the resolver
          // const ResolverClass = await import(resolverPath);
          // plugin.resolvers.set(resolverName, ResolverClass);
          this.logger.log(`Registered resolver: ${resolverName} for plugin ${config.id}`);
        } catch (error) {
          this.logger.warn(`Could not load resolver ${resolverName} for plugin ${config.id}:`, error);
        }
      }
    }
  }

  /**
   * Load database components (entities, migrations)
   */
  private async loadDatabaseComponents(config: PluginConfig, plugin: LoadedPlugin): Promise<void> {
    if (!config.database) return;

    // Load entities
    if (config.database.entities) {
      for (const entityName of config.database.entities) {
        try {
          const entityPath = path.join(process.cwd(), 'integration/plugins', config.id, 'entities', `${entityName}.ts`);
          // In a real implementation, you would dynamically import the entity
          // const EntityClass = await import(entityPath);
          // plugin.entities.set(entityName, EntityClass);
          this.logger.log(`Registered entity: ${entityName} for plugin ${config.id}`);
        } catch (error) {
          this.logger.warn(`Could not load entity ${entityName} for plugin ${config.id}:`, error);
        }
      }
    }

    // Run migrations if needed
    if (config.database.migrations) {
      this.logger.log(`Found ${config.database.migrations.length} migrations for plugin ${config.id}`);
      // In a real implementation, you would run the migrations
    }
  }

  /**
   * Get a loaded plugin by ID
   */
  getPlugin(pluginId: string): LoadedPlugin | undefined {
    return this.loadedPlugins.get(pluginId);
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): LoadedPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Get plugin routes for frontend routing
   */
  getPluginRoutes(): Array<{ pluginId: string; routes: any[] }> {
    return Array.from(this.loadedPlugins.values()).map(plugin => ({
      pluginId: plugin.config.id,
      routes: plugin.routes,
    }));
  }

  /**
   * Reload a specific plugin
   */
  async reloadPlugin(pluginId: string): Promise<void> {
    const existingPlugin = this.loadedPlugins.get(pluginId);
    if (!existingPlugin) {
      throw new Error(`Plugin ${pluginId} is not loaded`);
    }

    // Unload the plugin
    this.loadedPlugins.delete(pluginId);

    // Reload the plugin
    await this.loadPlugin(existingPlugin.config);
    
    this.logger.log(`Plugin ${pluginId} reloaded successfully`);
  }

  /**
   * Reload all plugins (useful for development)
   */
  async reloadAllPlugins(): Promise<void> {
    this.logger.log('Reloading all plugins...');
    this.loadedPlugins.clear();
    await this.loadPlugins();
  }

  /**
   * Get plugin manifest
   */
  getManifest(): PluginManifest | null {
    return this.pluginManifest;
  }

  /**
   * Update plugin status
   */
  async updatePluginStatus(pluginId: string, status: 'active' | 'inactive' | 'development'): Promise<void> {
    if (!this.pluginManifest) {
      throw new Error('Plugin manifest not loaded');
    }

    const plugin = this.pluginManifest.plugins.find(p => p.id === pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found in manifest`);
    }

    plugin.status = status;

    // Save updated manifest
    const manifestPath = path.join(process.cwd(), 'integration/plugins/plugins.json');
    await fs.writeFile(manifestPath, JSON.stringify(this.pluginManifest, null, 2));

    // Reload plugins if needed
    if (status === 'active' && !this.loadedPlugins.has(pluginId)) {
      await this.loadPlugin(plugin);
    } else if (status === 'inactive' && this.loadedPlugins.has(pluginId)) {
      this.loadedPlugins.delete(pluginId);
    }

    this.logger.log(`Plugin ${pluginId} status updated to ${status}`);
  }
}
