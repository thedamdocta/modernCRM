/**
 * Test Script for Prompt Round-trip Functionality
 * Sprint 2 Deliverable: Test Prompt Round-trip
 */

const fs = require('fs').promises;
const path = require('path');

// Mock the NestJS dependencies for testing
const mockGeminiClient = {
  async generateCode(prompt, context) {
    console.log('🤖 Mock Gemini generating code for prompt:', prompt.substring(0, 100) + '...');
    
    // Simulate AI response based on prompt content
    if (prompt.toLowerCase().includes('contact form')) {
      return `
\`\`\`tsx
import React, { useState } from 'react';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleChange('message')}
            rows={4}
            required
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Send Message'}
        </button>
      </form>
      
      <style jsx>{\`
        .contact-form {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--twenty-spacing-6);
          background: var(--twenty-color-gray-0);
          border-radius: var(--twenty-border-radius-lg);
          box-shadow: var(--twenty-shadow-md);
        }
        
        .contact-form h2 {
          margin-bottom: var(--twenty-spacing-6);
          font-size: var(--twenty-font-size-xl);
          font-weight: var(--twenty-font-weight-semibold);
          color: var(--twenty-color-gray-90);
          text-align: center;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--twenty-spacing-4);
        }
        
        .form-group {
          margin-bottom: var(--twenty-spacing-4);
        }
        
        .form-group label {
          display: block;
          margin-bottom: var(--twenty-spacing-1);
          font-size: var(--twenty-font-size-sm);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: var(--twenty-spacing-3);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-md);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-base);
          transition: border-color 0.2s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--twenty-color-blue-60);
          box-shadow: 0 0 0 3px var(--twenty-color-blue-60)20;
        }
        
        button[type="submit"] {
          width: 100%;
          padding: var(--twenty-spacing-3) var(--twenty-spacing-6);
          background: var(--twenty-color-blue-60);
          color: var(--twenty-color-gray-0);
          border: none;
          border-radius: var(--twenty-border-radius-md);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-base);
          font-weight: var(--twenty-font-weight-medium);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        button[type="submit"]:hover:not(:disabled) {
          background: var(--twenty-color-blue-70);
        }
        
        button[type="submit"]:disabled {
          background: var(--twenty-color-gray-20);
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      \`}</style>
    </div>
  );
};

export default ContactForm;
\`\`\`
      `;
    } else if (prompt.toLowerCase().includes('dashboard')) {
      return `
\`\`\`tsx
import React, { useState, useEffect } from 'react';

interface DashboardProps {
  title?: string;
}

interface DashboardData {
  totalContacts: number;
  totalOpportunities: number;
  totalRevenue: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ title = 'CRM Dashboard' }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setData({
        totalContacts: 1247,
        totalOpportunities: 89,
        totalRevenue: 2450000,
        recentActivities: [
          { id: '1', type: 'contact', description: 'New contact added: John Doe', timestamp: '2 hours ago' },
          { id: '2', type: 'opportunity', description: 'Opportunity updated: ABC Corp Deal', timestamp: '4 hours ago' },
          { id: '3', type: 'meeting', description: 'Meeting scheduled with Jane Smith', timestamp: '1 day ago' }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>{title}</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Contacts</h3>
          <p className="stat-number">{data?.totalContacts.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Opportunities</h3>
          <p className="stat-number">{data?.totalOpportunities}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-number">$\{data?.totalRevenue.toLocaleString()}</p>
        </div>
      </div>
      
      <div className="recent-activities">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {data?.recentActivities.map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <p>{activity.description}</p>
                <span className="activity-time">{activity.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{\`
        .dashboard {
          padding: var(--twenty-spacing-6);
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .dashboard h1 {
          margin-bottom: var(--twenty-spacing-6);
          font-size: var(--twenty-font-size-2xl);
          font-weight: var(--twenty-font-weight-bold);
          color: var(--twenty-color-gray-90);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: var(--twenty-spacing-4);
          margin-bottom: var(--twenty-spacing-8);
        }
        
        .stat-card {
          background: var(--twenty-color-gray-0);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-lg);
          padding: var(--twenty-spacing-6);
          text-align: center;
          box-shadow: var(--twenty-shadow-sm);
        }
        
        .stat-card h3 {
          margin-bottom: var(--twenty-spacing-2);
          font-size: var(--twenty-font-size-sm);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-70);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-number {
          font-size: var(--twenty-font-size-2xl);
          font-weight: var(--twenty-font-weight-bold);
          color: var(--twenty-color-blue-60);
          margin: 0;
        }
        
        .recent-activities {
          background: var(--twenty-color-gray-0);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-lg);
          padding: var(--twenty-spacing-6);
          box-shadow: var(--twenty-shadow-sm);
        }
        
        .recent-activities h2 {
          margin-bottom: var(--twenty-spacing-4);
          font-size: var(--twenty-font-size-lg);
          font-weight: var(--twenty-font-weight-semibold);
          color: var(--twenty-color-gray-90);
        }
        
        .activities-list {
          space-y: var(--twenty-spacing-3);
        }
        
        .activity-item {
          padding: var(--twenty-spacing-3);
          border-left: 3px solid var(--twenty-color-blue-60);
          background: var(--twenty-color-gray-10);
          border-radius: var(--twenty-border-radius-sm);
          margin-bottom: var(--twenty-spacing-3);
        }
        
        .activity-content p {
          margin: 0 0 var(--twenty-spacing-1) 0;
          font-size: var(--twenty-font-size-base);
          color: var(--twenty-color-gray-90);
        }
        
        .activity-time {
          font-size: var(--twenty-font-size-sm);
          color: var(--twenty-color-gray-50);
        }
        
        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 400px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--twenty-color-gray-20);
          border-top: 3px solid var(--twenty-color-blue-60);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--twenty-spacing-4);
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      \`}</style>
    </div>
  );
};

export default Dashboard;
\`\`\`
      `;
    }
    
    // Default response for other prompts
    return `
\`\`\`tsx
import React from 'react';

interface GeneratedComponentProps {
  title?: string;
}

export const GeneratedComponent: React.FC<GeneratedComponentProps> = ({ title = 'Generated Component' }) => {
  return (
    <div className="generated-component">
      <h2>{title}</h2>
      <p>This is a generated component based on your prompt.</p>
      
      <style jsx>{\`
        .generated-component {
          padding: var(--twenty-spacing-6);
          background: var(--twenty-color-gray-0);
          border-radius: var(--twenty-border-radius-md);
          border: 1px solid var(--twenty-color-gray-20);
        }
        
        .generated-component h2 {
          color: var(--twenty-color-gray-90);
          font-size: var(--twenty-font-size-lg);
          margin-bottom: var(--twenty-spacing-4);
        }
        
        .generated-component p {
          color: var(--twenty-color-gray-70);
          font-size: var(--twenty-font-size-base);
        }
      \`}</style>
    </div>
  );
};

export default GeneratedComponent;
\`\`\`
    `;
  }
};

// Mock PromptService for testing
class MockPromptService {
  constructor() {
    this.geminiClient = mockGeminiClient;
  }

  async generateFromPrompt(request) {
    const requestId = this.generateRequestId();
    
    try {
      console.log(`[${requestId}] 🚀 Processing prompt generation request`);
      console.log(`[${requestId}] 📝 Prompt: "${request.prompt.substring(0, 100)}..."`);
      console.log(`[${requestId}] ⚙️  Options:`, request.options);
      
      // Build context for the AI model
      const context = await this.buildGenerationContext(request);
      console.log(`[${requestId}] 🧠 Built generation context`);
      
      // Generate code using Gemini
      const generatedContent = await this.geminiClient.generateCode(
        request.prompt,
        context
      );
      console.log(`[${requestId}] ✨ Generated content received`);
      
      // Parse and validate the generated content
      const parsedContent = await this.parseGeneratedContent(generatedContent);
      console.log(`[${requestId}] 📋 Parsed generated content`);
      
      // Create file structure
      const files = await this.createFileStructure(parsedContent, request.options);
      console.log(`[${requestId}] 📁 Created ${files.length} files`);
      
      // Generate blueprint for plugin registration
      const blueprint = this.createBlueprint(request, files);
      console.log(`[${requestId}] 🏗️  Generated blueprint`);
      
      // Create metadata for CRM integration
      const metadata = this.createMetadata(request, blueprint);
      console.log(`[${requestId}] 📊 Created metadata`);
      
      console.log(`[${requestId}] ✅ Successfully generated ${files.length} files`);
      
      return {
        success: true,
        data: {
          generatedCode: generatedContent,
          blueprint,
          metadata,
          files
        },
        requestId
      };
      
    } catch (error) {
      console.error(`[${requestId}] ❌ Error generating from prompt:`, error);
      
      return {
        success: false,
        error: error.message || 'Failed to generate content from prompt',
        requestId
      };
    }
  }

  async buildGenerationContext(request) {
    return {
      crmEntities: {
        Contact: {
          fields: ['id', 'firstName', 'lastName', 'email', 'phone', 'company'],
          relationships: ['accounts', 'opportunities', 'activities']
        },
        Account: {
          fields: ['id', 'name', 'industry', 'website', 'employees'],
          relationships: ['contacts', 'opportunities']
        }
      },
      designTokens: {
        colors: {
          primary: 'var(--twenty-color-blue-60)',
          secondary: 'var(--twenty-color-gray-60)',
          background: 'var(--twenty-color-gray-0)',
          text: 'var(--twenty-color-gray-90)',
          border: 'var(--twenty-color-gray-20)'
        },
        spacing: {
          xs: 'var(--twenty-spacing-1)',
          sm: 'var(--twenty-spacing-2)',
          md: 'var(--twenty-spacing-4)',
          lg: 'var(--twenty-spacing-6)',
          xl: 'var(--twenty-spacing-8)'
        }
      },
      outputRequirements: {
        format: request.options.outputFormat,
        targetEntity: request.options.targetEntity,
        includeTests: request.options.generateTests,
        includeDataBinding: request.options.includeDataBinding
      }
    };
  }

  async parseGeneratedContent(content) {
    // Extract code blocks from the generated content
    const codeBlocks = content.match(/```(\w+)?\n([\s\S]*?)\n```/g);
    if (codeBlocks) {
      const parsed = {
        components: [],
        styles: [],
        tests: [],
        config: {}
      };
      
      codeBlocks.forEach(block => {
        const match = block.match(/```(\w+)?\n([\s\S]*?)\n```/);
        if (match) {
          const language = match[1] || 'text';
          const code = match[2];
          
          if (language === 'tsx' || language === 'jsx') {
            parsed.components.push(code);
          } else if (language === 'css' || language === 'scss') {
            parsed.styles.push(code);
          }
        }
      });
      
      return parsed;
    }
    
    return {
      components: [content],
      styles: [],
      tests: [],
      config: {}
    };
  }

  async createFileStructure(parsedContent, options) {
    const files = [];
    const moduleName = this.generateModuleName(options.outputFormat);
    
    // Generate main component file
    if (parsedContent.components && parsedContent.components.length > 0) {
      files.push({
        path: `integration/plugins/generated/${moduleName}/${moduleName}.tsx`,
        content: parsedContent.components[0],
        type: 'component'
      });
    }
    
    // Generate plugin configuration
    const pluginConfig = {
      id: moduleName,
      name: `Generated ${options.outputFormat}`,
      version: '1.0.0',
      description: `AI-generated ${options.outputFormat} module`,
      author: 'AI Assistant',
      createdAt: new Date().toISOString(),
      type: options.outputFormat
    };
    
    files.push({
      path: `integration/plugins/generated/${moduleName}/plugin.json`,
      content: JSON.stringify(pluginConfig, null, 2),
      type: 'config'
    });
    
    return files;
  }

  createBlueprint(request, files) {
    return {
      id: this.generateModuleName(request.options.outputFormat),
      type: request.options.outputFormat,
      prompt: request.prompt,
      options: request.options,
      files: files.map(f => ({
        path: f.path,
        type: f.type
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  createMetadata(request, blueprint) {
    return {
      webTemplate: {
        name: blueprint.id,
        slug: blueprint.id.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        templateType: request.options.outputFormat,
        status: 'generated',
        createdAt: new Date().toISOString()
      },
      promptLog: {
        prompt: request.prompt,
        generatedFiles: blueprint.files,
        timestamp: new Date().toISOString(),
        status: 'success',
        featureType: request.options.outputFormat
      }
    };
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateModuleName(outputFormat) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `${outputFormat}_${timestamp}_${random}`;
  }
}

// Test scenarios
const testScenarios = [
  {
    name: 'Contact Form Generation',
    prompt: 'Create a contact form with first name, last name, email, phone, and message fields that integrates with CRM contacts',
    options: {
      moduleType: 'component',
      targetEntity: 'Contact',
      includeDataBinding: true,
      generateTests: false,
      outputFormat: 'component'
    }
  },
  {
    name: 'Dashboard Widget Generation',
    prompt: 'Build a dashboard widget showing contact statistics, recent activities, and opportunity metrics',
    options: {
      moduleType: 'widget',
      targetEntity: 'Contact',
      includeDataBinding: true,
      generateTests: false,
      outputFormat: 'widget'
    }
  },
  {
    name: 'Landing Page Generation',
    prompt: 'Create a landing page for real estate agents with hero section, services, and lead capture form',
    options: {
      moduleType: 'page',
      targetEntity: 'Lead',
      includeDataBinding: true,
      generateTests: false,
      outputFormat: 'page'
    }
  }
];

// Main test function
async function runPromptRoundtripTests() {
  console.log('🧪 Starting Prompt Round-trip Tests');
  console.log('=' .repeat(50));
  
  const promptService = new MockPromptService();
  const results = [];
  
  for (let i = 0; i < testScenarios.length; i++) {
    const scenario = testScenarios[i];
    console.log(`\n📋 Test ${i + 1}: ${scenario.name}`);
    console.log('-'.repeat(30));
    
    try {
      const startTime = Date.now();
      const result = await promptService.generateFromPrompt({
        prompt: scenario.prompt,
        options: scenario.options
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (result.success) {
        console.log(`✅ Test passed in ${duration}ms`);
        console.log(`📁 Generated ${result.data.files.length} files`);
        console.log(`🆔 Request ID: ${result.requestId}`);
        
        // Save generated files for inspection
        const outputDir = `test-output/${result.requestId}`;
        try {
          await fs.mkdir(outputDir, { recursive: true });
          
          for (const file of result.data.files) {
            const filePath = path.join(outputDir, path.basename(file.path));
            await fs.writeFile(filePath, file.content);
            console.log(`💾 Saved: ${filePath}`);
          }
          
          // Save metadata
          await fs.writeFile(
            path.join(outputDir, 'metadata.json'),
            JSON.stringify(result.data.metadata, null, 2)
          );
          
          console.log(`📊 Metadata saved to: ${outputDir}/metadata.json`);
        } catch (saveError) {
          console.warn(`⚠️  Could not save files: ${saveError.message}`);
        }
        
        results.push({
          scenario: scenario.name,
          success: true,
          duration,
          filesGenerated: result.data.files.length,
          requestId: result.requestId
        });
      } else {
        console.log(`❌ Test failed: ${result.error}`);
        results.push({
          scenario: scenario.name,
          success: false,
          error: result.error,
          requestId: result.requestId
        });
      }
    } catch (error) {
      console.log(`💥 Test crashed: ${error.message}`);
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Print summary
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  
  if (passed > 0) {
    const avgDuration = results
      .filter(r => r.success && r.duration)
      .reduce((sum, r) => sum + r.duration, 0) / passed;
    console.log(`⏱️  Average Duration: ${avgDuration.toFixed(0)}ms`);
  }
  
  // Save test results
  try {
    await fs.mkdir('test-output', { recursive: true });
    await fs.writeFile(
      'test-output/test-results.json',
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { passed, failed, successRate: (passed / results.length) * 100 },
        results
      }, null, 2)
    );
    console.log('\n💾 Test results saved to: test-output/test-results.json');
  } catch (saveError) {
    console.warn(`⚠️  Could not save test results: ${saveError.message}`);
  }
  
  console.log('\n🏁 Prompt Round-trip Tests Complete!');
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runPromptRoundtripTests()
    .then(results => {
      const success = results.every(r => r.success);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runPromptRoundtripTests, MockPromptService };
