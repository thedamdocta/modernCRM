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
export declare class ModuleCreator {
    private readonly generatedModulesPath;
    private readonly pluginsConfigPath;
    constructor();
    createModule(moduleData: any): Promise<GeneratedModule>;
    private processModuleFiles;
    private determineFileType;
    private processFileContent;
    private addRequiredFiles;
    private generateIndexFile;
    private generatePackageJson;
    private generateReadme;
    private createPluginManifest;
    private writeModuleToFileSystem;
    private updatePluginsRegistry;
    listGeneratedModules(): Promise<GeneratedModule[]>;
    private loadModuleFiles;
    deleteModule(moduleSlug: string): Promise<boolean>;
    private removeFromPluginsRegistry;
    toggleModuleStatus(moduleSlug: string, enabled: boolean): Promise<boolean>;
    getModule(moduleSlug: string): Promise<GeneratedModule | null>;
}
export default ModuleCreator;
