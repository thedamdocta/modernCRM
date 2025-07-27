declare class GeminiClient {
  constructor();
  generateFeature(prompt: string, context?: any): Promise<any>;
  generateCode(prompt: string, context?: any): Promise<string>;
  generateModule(prompt: string, options?: any): Promise<any>;
  generateWithFallback(prompt: string, context?: any): Promise<string>;
  testConnection(): Promise<boolean>;
}

export default GeminiClient;
