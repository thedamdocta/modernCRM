/**
 * Mock Gemini Client for testing purposes
 * This bypasses the import issues while maintaining functionality
 */

export default class GeminiClient {
  constructor() {
    console.log('Using mock Gemini client for testing');
  }

  async generateFeature(prompt: string, context?: any): Promise<any> {
    return {
      name: 'Mock Generated Feature',
      slug: `mock-${Date.now()}`,
      feature_type: 'component',
      files: [
        {
          path: 'component.tsx',
          content: `// Mock generated component for: ${prompt}`,
          type: 'component'
        }
      ],
      metadata: {
        description: 'Mock generated feature',
        dependencies: [],
        routes: [],
        integration_points: []
      }
    };
  }

  async generateCode(prompt: string, context?: any): Promise<string> {
    return `// Mock generated code for: ${prompt}\nexport const MockComponent = () => <div>Mock Component</div>;`;
  }

  async generateModule(prompt: string, options?: any): Promise<any> {
    return {
      name: 'Mock Module',
      slug: `mock-module-${Date.now()}`,
      feature_type: options?.constraints?.featureType || 'component',
      files: [
        {
          path: 'component.tsx',
          content: `// Mock module for: ${prompt}`,
          type: 'component'
        }
      ],
      metadata: {
        description: 'Mock generated module',
        dependencies: [],
        routes: [],
        integration_points: []
      },
      validation: {
        results: [],
        passed: true,
        timestamp: new Date().toISOString()
      }
    };
  }

  async generateWithFallback(prompt: string, context?: any): Promise<string> {
    return `// Fallback mock code for: ${prompt}\nexport const FallbackComponent = () => <div>Fallback Component</div>;`;
  }

  async testConnection(): Promise<boolean> {
    console.log('Mock Gemini connection test - always returns true');
    return true;
  }
}
