import { EventEmitter } from 'events';
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
export declare class PluginHotReload extends EventEmitter {
    private readonly pluginsConfigPath;
    private readonly generatedModulesPath;
    private loadedPlugins;
    private watchers;
    private isWatching;
    constructor();
    start(): Promise<void>;
    stop(): Promise<void>;
    private loadAllPlugins;
    private loadPlugin;
    private startWatching;
    private watchFile;
    private watchDirectory;
    private handleConfigChange;
    private handleModuleChange;
    private triggerFrontendReload;
    private createEmptyConfig;
    getLoadedPlugins(): PluginInfo[];
    getPlugin(pluginId: string): PluginInfo | undefined;
    togglePlugin(pluginId: string, enabled: boolean): Promise<boolean>;
    reloadPlugin(pluginId: string): Promise<boolean>;
    getStatus(): any;
}
export default PluginHotReload;
