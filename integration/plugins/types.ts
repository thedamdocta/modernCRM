export interface PluginRoute {
  path: string;
  component: string;
  title: string;
  icon?: string;
  dynamic?: boolean;
  permissions: string[];
}

export interface PluginBackendConfig {
  graphql?: {
    types: string[];
    resolvers: string[];
    mutations: string[];
    queries: string[];
  };
  services: string[];
  controllers: string[];
  endpoints: Array<{
    path: string;
    method: string;
    handler: string;
    permissions: string[];
  }>;
}

export interface PluginDatabaseConfig {
  entities: string[];
  migrations: string[];
}

export interface PluginDependencies {
  frontend: string[];
  backend: string[];
}

export interface PluginConfig {
  id: string;
  name: string;
  version: string;
  description: string;
  type: 'ui-plugin' | 'backend-plugin' | 'full-stack-plugin';
  status: 'active' | 'inactive' | 'development';
  routes?: PluginRoute[];
  backend?: PluginBackendConfig;
  database?: PluginDatabaseConfig;
  dependencies?: PluginDependencies;
  config?: Record<string, any>;
  designTokens?: {
    source: string;
    mapping: Record<string, string>;
  };
  metadata?: {
    author: string;
    license: string;
    repository: string;
    documentation: string;
    tags: string[];
  };
}

export interface LoadedPlugin {
  config: PluginConfig;
  routes: PluginRoute[];
  services: Map<string, any>;
  controllers: Map<string, any>;
  resolvers: Map<string, any>;
  entities: Map<string, any>;
  isLoaded: boolean;
  loadedAt: Date;
  error?: Error;
}

export interface PluginManifest {
  version: string;
  plugins: PluginConfig[];
  generated: {
    lastUpdate: string;
    totalPlugins: number;
    activePlugins: number;
    developmentPlugins: number;
  };
}

export interface PluginRegistryService {
  loadPlugins(): Promise<void>;
  getPlugin(id: string): LoadedPlugin | undefined;
  getAllPlugins(): LoadedPlugin[];
  reloadPlugin(id: string): Promise<void>;
  updatePluginStatus(id: string, status: PluginConfig['status']): Promise<void>;
}

export interface DesignToken {
  twenty: string;
  webstudio: string;
  value: string;
  description?: string;
}

export interface DesignTokenMapping {
  version: string;
  description: string;
  lastUpdated: string;
  tokenMapping: {
    colors: Record<string, DesignToken>;
    typography: Record<string, Record<string, DesignToken>>;
    spacing: Record<string, DesignToken>;
    borderRadius: Record<string, DesignToken>;
    shadows: Record<string, DesignToken>;
  };
  components: Record<string, any>;
  integration: {
    cssVariables: {
      generateFor: string[];
      prefix: Record<string, string>;
    };
    buildTools: Record<string, any>;
    validation: Record<string, any>;
  };
}

export interface GeneratedModule {
  id: string;
  name: string;
  slug: string;
  type: string;
  prompt: string;
  generatedFiles: string[];
  status: 'generating' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface WebTemplate {
  id: string;
  name: string;
  slug: string;
  templateType: string;
  schema: Record<string, any>;
  renderPage: string;
  linkedCrmRecord?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptLog {
  id: string;
  prompt: string;
  generatedFiles: string[];
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  featureType: string;
  error?: string;
  metadata?: Record<string, any>;
}
