/**
 * Plugin Hot-Reload System for Modern CRM Integration Project
 * Enables real-time plugin loading without server restart
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';
import { watch } from 'fs';

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  type: string;
  path: string;
  enabled: boolean;
  metadata?: any;
}

export interface ReloadEvent {
  type: 'added' | 'updated' | 'removed' | 'enabled' | 'disabled';
  plugin: PluginInfo;
  timestamp: string;
}

export class PluginHotReload extends EventEmitter {
  private readonly pluginsConfigPath: string;
  private readonly generatedModulesPath: string;
  private loadedPlugins: Map<string, PluginInfo> = new Map();
  private watchers: Map<string, any> = new Map();
  private isWatching: boolean = false;

  constructor() {
    super();
    this.pluginsConfigPath = path.join(process.cwd(), 'integration/plugins/plugins.json');
    this.generatedModulesPath = path.join(process.cwd(), 'integration/plugins/generated');
  }

  /**
   * Start the hot-reload system
   */
  async start(): Promise<void> {
    try {
      console.log('Starting Plugin Hot-Reload System...');

      // Load initial plugins
      await this.loadAllPlugins();

      // Start watching for changes
      await this.startWatching();

      this.isWatching = true;
      console.log('Plugin Hot-Reload System started successfully');

      this.emit('system-started', {
        timestamp: new Date().toISOString(),
        loadedPlugins: this.loadedPlugins.size
      });

    } catch (error) {
      console.error('Failed to start Plugin Hot-Reload System:', error);
      throw error;
    }
  }

  /**
   * Stop the hot-reload system
   */
  async stop(): Promise<void> {
    try {
      console.log('Stopping Plugin Hot-Reload System...');

      // Stop all watchers
      for (const [path, watcher] of this.watchers) {
        watcher.close();
        console.log(`Stopped watching: ${path}`);
      }

      this.watchers.clear();
      this.isWatching = false;

      console.log('Plugin Hot-Reload System stopped');

      this.emit('system-stopped', {
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error stopping Plugin Hot-Reload System:', error);
    }
  }

  /**
   * Load all plugins from configuration
   */
  private async loadAllPlugins(): Promise<void> {
    try {
      const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
      const config = JSON.parse(configContent);

      this.loadedPlugins.clear();

      for (const plugin of config.plugins || []) {
        await this.loadPlugin(plugin);
      }

      console.log(`Loaded ${this.loadedPlugins.size} plugins`);
    } catch (error) {
      console.warn('Could not load plugins configuration:', error.message);
      // Create empty configuration if it doesn't exist
      await this.createEmptyConfig();
    }
  }

  /**
   * Load a single plugin
   */
  private async loadPlugin(pluginConfig: any): Promise<void> {
    try {
      const pluginInfo: PluginInfo = {
        id: pluginConfig.id,
        name: pluginConfig.name,
        version: pluginConfig.version || '1.0.0',
        type: pluginConfig.type || 'unknown',
        path: pluginConfig.path,
        enabled: pluginConfig.enabled !== false,
        metadata: pluginConfig.metadata
      };

      // Validate plugin exists
      if (pluginConfig.path) {
        const fullPath = path.resolve(path.dirname(this.pluginsConfigPath), pluginConfig.path);
        try {
          await fs.access(fullPath);
        } catch {
          console.warn(`Plugin path not found: ${fullPath}`);
          pluginInfo.enabled = false;
        }
      }

      this.loadedPlugins.set(pluginInfo.id, pluginInfo);

      if (pluginInfo.enabled) {
        this.emit('plugin-loaded', {
          type: 'added',
          plugin: pluginInfo,
          timestamp: new Date().toISOString()
        } as ReloadEvent);
      }

    } catch (error) {
      console.error(`Error loading plugin ${pluginConfig.id}:`, error);
    }
  }

  /**
   * Start watching for file changes
   */
  private async startWatching(): Promise<void> {
    // Watch plugins configuration file
    this.watchFile(this.pluginsConfigPath, 'config');

    // Watch generated modules directory
    try {
      await fs.access(this.generatedModulesPath);
      this.watchDirectory(this.generatedModulesPath, 'generated-modules');
    } catch {
      console.log('Generated modules directory does not exist yet, will create watcher when needed');
    }
  }

  /**
   * Watch a specific file for changes
   */
  private watchFile(filePath: string, watcherName: string): void {
    try {
      const watcher = watch(filePath, { persistent: true }, async (eventType, filename) => {
        if (eventType === 'change') {
          console.log(`Configuration file changed: ${filename}`);
          await this.handleConfigChange();
        }
      });

      this.watchers.set(watcherName, watcher);
      console.log(`Started watching file: ${filePath}`);
    } catch (error) {
      console.error(`Error watching file ${filePath}:`, error);
    }
  }

  /**
   * Watch a directory for changes
   */
  private watchDirectory(dirPath: string, watcherName: string): void {
    try {
      const watcher = watch(dirPath, { recursive: true, persistent: true }, async (eventType, filename) => {
        if (filename && (filename.endsWith('.json') || filename.endsWith('.ts') || filename.endsWith('.tsx'))) {
          console.log(`Generated module file changed: ${filename}`);
          await this.handleModuleChange(filename, eventType);
        }
      });

      this.watchers.set(watcherName, watcher);
      console.log(`Started watching directory: ${dirPath}`);
    } catch (error) {
      console.error(`Error watching directory ${dirPath}:`, error);
    }
  }

  /**
   * Handle configuration file changes
   */
  private async handleConfigChange(): Promise<void> {
    try {
      console.log('Reloading plugins configuration...');

      const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
      const config = JSON.parse(configContent);

      const previousPlugins = new Map(this.loadedPlugins);
      const currentPluginIds = new Set();

      // Process current plugins
      for (const plugin of config.plugins || []) {
        currentPluginIds.add(plugin.id);

        const existingPlugin = this.loadedPlugins.get(plugin.id);
        
        if (!existingPlugin) {
          // New plugin added
          await this.loadPlugin(plugin);
          console.log(`New plugin detected: ${plugin.name}`);
        } else {
          // Check for updates
          const hasChanges = 
            existingPlugin.version !== plugin.version ||
            existingPlugin.enabled !== (plugin.enabled !== false) ||
            JSON.stringify(existingPlugin.metadata) !== JSON.stringify(plugin.metadata);

          if (hasChanges) {
            await this.loadPlugin(plugin);
            console.log(`Plugin updated: ${plugin.name}`);

            this.emit('plugin-updated', {
              type: 'updated',
              plugin: this.loadedPlugins.get(plugin.id)!,
              timestamp: new Date().toISOString()
            } as ReloadEvent);
          }
        }
      }

      // Check for removed plugins
      for (const [pluginId, plugin] of previousPlugins) {
        if (!currentPluginIds.has(pluginId)) {
          this.loadedPlugins.delete(pluginId);
          console.log(`Plugin removed: ${plugin.name}`);

          this.emit('plugin-removed', {
            type: 'removed',
            plugin,
            timestamp: new Date().toISOString()
          } as ReloadEvent);
        }
      }

    } catch (error) {
      console.error('Error handling configuration change:', error);
    }
  }

  /**
   * Handle module file changes
   */
  private async handleModuleChange(filename: string, eventType: string): Promise<void> {
    try {
      // Extract module name from file path
      const pathParts = filename.split(path.sep);
      const moduleName = pathParts[0];

      if (!moduleName) return;

      const plugin = Array.from(this.loadedPlugins.values())
        .find(p => p.path.includes(moduleName));

      if (plugin) {
        console.log(`Module file changed for plugin: ${plugin.name}`);

        // Emit module change event
        this.emit('module-changed', {
          type: 'updated',
          plugin,
          timestamp: new Date().toISOString(),
          changedFile: filename,
          changeType: eventType
        });

        // Trigger hot reload for frontend if needed
        await this.triggerFrontendReload(plugin);
      }

    } catch (error) {
      console.error('Error handling module change:', error);
    }
  }

  /**
   * Trigger frontend hot reload
   */
  private async triggerFrontendReload(plugin: PluginInfo): Promise<void> {
    try {
      // This would typically integrate with a frontend hot-reload system
      // For now, we'll emit an event that the frontend can listen to
      this.emit('frontend-reload-required', {
        pluginId: plugin.id,
        pluginName: plugin.name,
        timestamp: new Date().toISOString()
      });

      console.log(`Frontend reload triggered for plugin: ${plugin.name}`);
    } catch (error) {
      console.error('Error triggering frontend reload:', error);
    }
  }

  /**
   * Create empty configuration file
   */
  private async createEmptyConfig(): Promise<void> {
    const emptyConfig = {
      plugins: [],
      metadata: {
        version: '1.0.0',
        lastUpdated: new Date().toISOString()
      }
    };

    await fs.writeFile(this.pluginsConfigPath, JSON.stringify(emptyConfig, null, 2), 'utf-8');
    console.log('Created empty plugins configuration');
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): PluginInfo[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): PluginInfo | undefined {
    return this.loadedPlugins.get(pluginId);
  }

  /**
   * Enable/disable a plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<boolean> {
    try {
      const plugin = this.loadedPlugins.get(pluginId);
      if (!plugin) {
        console.warn(`Plugin not found: ${pluginId}`);
        return false;
      }

      // Update in-memory state
      plugin.enabled = enabled;

      // Update configuration file
      const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
      const config = JSON.parse(configContent);

      const pluginConfig = config.plugins.find((p: any) => p.id === pluginId);
      if (pluginConfig) {
        pluginConfig.enabled = enabled;
        await fs.writeFile(this.pluginsConfigPath, JSON.stringify(config, null, 2), 'utf-8');
      }

      // Emit event
      this.emit('plugin-toggled', {
        type: enabled ? 'enabled' : 'disabled',
        plugin,
        timestamp: new Date().toISOString()
      } as ReloadEvent);

      console.log(`Plugin ${plugin.name} ${enabled ? 'enabled' : 'disabled'}`);
      return true;

    } catch (error) {
      console.error(`Error toggling plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Force reload a specific plugin
   */
  async reloadPlugin(pluginId: string): Promise<boolean> {
    try {
      const configContent = await fs.readFile(this.pluginsConfigPath, 'utf-8');
      const config = JSON.parse(configContent);

      const pluginConfig = config.plugins.find((p: any) => p.id === pluginId);
      if (!pluginConfig) {
        console.warn(`Plugin configuration not found: ${pluginId}`);
        return false;
      }

      await this.loadPlugin(pluginConfig);

      this.emit('plugin-reloaded', {
        type: 'updated',
        plugin: this.loadedPlugins.get(pluginId)!,
        timestamp: new Date().toISOString()
      } as ReloadEvent);

      console.log(`Plugin reloaded: ${pluginId}`);
      return true;

    } catch (error) {
      console.error(`Error reloading plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Get system status
   */
  getStatus(): any {
    return {
      isWatching: this.isWatching,
      loadedPlugins: this.loadedPlugins.size,
      activeWatchers: this.watchers.size,
      plugins: this.getLoadedPlugins().map(p => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        type: p.type
      }))
    };
  }
}

export default PluginHotReload;
