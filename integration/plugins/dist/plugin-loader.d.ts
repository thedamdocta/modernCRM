import { ModuleRef } from '@nestjs/core';
import { PluginManifest, LoadedPlugin } from './types';
export declare class PluginLoader {
    private moduleRef;
    private readonly logger;
    private loadedPlugins;
    private pluginManifest;
    constructor(moduleRef: ModuleRef);
    loadPlugins(): Promise<void>;
    private loadPlugin;
    private validatePluginConfig;
    private ensurePluginDirectories;
    private loadBackendComponents;
    private loadDatabaseComponents;
    getPlugin(pluginId: string): LoadedPlugin | undefined;
    getAllPlugins(): LoadedPlugin[];
    getPluginRoutes(): Array<{
        pluginId: string;
        routes: any[];
    }>;
    reloadPlugin(pluginId: string): Promise<void>;
    reloadAllPlugins(): Promise<void>;
    getManifest(): PluginManifest | null;
    updatePluginStatus(pluginId: string, status: 'active' | 'inactive' | 'development'): Promise<void>;
}
