"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PluginLoader_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
let PluginLoader = PluginLoader_1 = class PluginLoader {
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger(PluginLoader_1.name);
        this.loadedPlugins = new Map();
        this.pluginManifest = null;
    }
    async loadPlugins() {
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
        }
        catch (error) {
            this.logger.error('Failed to load plugins:', error);
            throw error;
        }
    }
    async loadPlugin(config) {
        try {
            this.logger.log(`Loading plugin: ${config.name} (${config.id})`);
            this.validatePluginConfig(config);
            await this.ensurePluginDirectories(config);
            const loadedPlugin = {
                config,
                routes: config.routes || [],
                services: new Map(),
                controllers: new Map(),
                resolvers: new Map(),
                entities: new Map(),
                isLoaded: false,
                loadedAt: new Date(),
            };
            if (config.backend) {
                await this.loadBackendComponents(config, loadedPlugin);
            }
            if (config.database) {
                await this.loadDatabaseComponents(config, loadedPlugin);
            }
            loadedPlugin.isLoaded = true;
            this.loadedPlugins.set(config.id, loadedPlugin);
            this.logger.log(`Plugin ${config.name} loaded successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to load plugin ${config.name}:`, error);
            throw error;
        }
    }
    validatePluginConfig(config) {
        if (!config.id || !config.name || !config.version) {
            throw new Error(`Invalid plugin configuration: missing required fields`);
        }
        if (this.loadedPlugins.has(config.id)) {
            throw new Error(`Plugin with ID ${config.id} is already loaded`);
        }
    }
    async ensurePluginDirectories(config) {
        const pluginDir = path.join(process.cwd(), 'integration/plugins', config.id);
        const generatedDir = path.join(pluginDir, 'generated');
        const templatesDir = path.join(pluginDir, 'templates');
        try {
            await fs.mkdir(pluginDir, { recursive: true });
            await fs.mkdir(generatedDir, { recursive: true });
            await fs.mkdir(templatesDir, { recursive: true });
        }
        catch (error) {
            this.logger.warn(`Could not create directories for plugin ${config.id}:`, error);
        }
    }
    async loadBackendComponents(config, plugin) {
        if (!config.backend)
            return;
        if (config.backend.services) {
            for (const serviceName of config.backend.services) {
                try {
                    const servicePath = path.join(process.cwd(), 'integration/plugins', config.id, 'services', `${serviceName}.ts`);
                    this.logger.log(`Registered service: ${serviceName} for plugin ${config.id}`);
                }
                catch (error) {
                    this.logger.warn(`Could not load service ${serviceName} for plugin ${config.id}:`, error);
                }
            }
        }
        if (config.backend.controllers) {
            for (const controllerName of config.backend.controllers) {
                try {
                    const controllerPath = path.join(process.cwd(), 'integration/plugins', config.id, 'controllers', `${controllerName}.ts`);
                    this.logger.log(`Registered controller: ${controllerName} for plugin ${config.id}`);
                }
                catch (error) {
                    this.logger.warn(`Could not load controller ${controllerName} for plugin ${config.id}:`, error);
                }
            }
        }
        if (config.backend.graphql?.resolvers) {
            for (const resolverName of config.backend.graphql.resolvers) {
                try {
                    const resolverPath = path.join(process.cwd(), 'integration/plugins', config.id, 'resolvers', `${resolverName}.ts`);
                    this.logger.log(`Registered resolver: ${resolverName} for plugin ${config.id}`);
                }
                catch (error) {
                    this.logger.warn(`Could not load resolver ${resolverName} for plugin ${config.id}:`, error);
                }
            }
        }
    }
    async loadDatabaseComponents(config, plugin) {
        if (!config.database)
            return;
        if (config.database.entities) {
            for (const entityName of config.database.entities) {
                try {
                    const entityPath = path.join(process.cwd(), 'integration/plugins', config.id, 'entities', `${entityName}.ts`);
                    this.logger.log(`Registered entity: ${entityName} for plugin ${config.id}`);
                }
                catch (error) {
                    this.logger.warn(`Could not load entity ${entityName} for plugin ${config.id}:`, error);
                }
            }
        }
        if (config.database.migrations) {
            this.logger.log(`Found ${config.database.migrations.length} migrations for plugin ${config.id}`);
        }
    }
    getPlugin(pluginId) {
        return this.loadedPlugins.get(pluginId);
    }
    getAllPlugins() {
        return Array.from(this.loadedPlugins.values());
    }
    getPluginRoutes() {
        return Array.from(this.loadedPlugins.values()).map(plugin => ({
            pluginId: plugin.config.id,
            routes: plugin.routes,
        }));
    }
    async reloadPlugin(pluginId) {
        const existingPlugin = this.loadedPlugins.get(pluginId);
        if (!existingPlugin) {
            throw new Error(`Plugin ${pluginId} is not loaded`);
        }
        this.loadedPlugins.delete(pluginId);
        await this.loadPlugin(existingPlugin.config);
        this.logger.log(`Plugin ${pluginId} reloaded successfully`);
    }
    async reloadAllPlugins() {
        this.logger.log('Reloading all plugins...');
        this.loadedPlugins.clear();
        await this.loadPlugins();
    }
    getManifest() {
        return this.pluginManifest;
    }
    async updatePluginStatus(pluginId, status) {
        if (!this.pluginManifest) {
            throw new Error('Plugin manifest not loaded');
        }
        const plugin = this.pluginManifest.plugins.find(p => p.id === pluginId);
        if (!plugin) {
            throw new Error(`Plugin ${pluginId} not found in manifest`);
        }
        plugin.status = status;
        const manifestPath = path.join(process.cwd(), 'integration/plugins/plugins.json');
        await fs.writeFile(manifestPath, JSON.stringify(this.pluginManifest, null, 2));
        if (status === 'active' && !this.loadedPlugins.has(pluginId)) {
            await this.loadPlugin(plugin);
        }
        else if (status === 'inactive' && this.loadedPlugins.has(pluginId)) {
            this.loadedPlugins.delete(pluginId);
        }
        this.logger.log(`Plugin ${pluginId} status updated to ${status}`);
    }
};
exports.PluginLoader = PluginLoader;
exports.PluginLoader = PluginLoader = PluginLoader_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], PluginLoader);
//# sourceMappingURL=plugin-loader.js.map