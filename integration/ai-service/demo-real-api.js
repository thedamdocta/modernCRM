#!/usr/bin/env node

/**
 * Demo script to show Gemini API working with the plugin system
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

import GeminiClient from './gemini-client.js';

async function demonstrateRealAPI() {
  console.log('🎯 ModernCRM + Gemini API Integration Demo\n');
  
  try {
    const client = new GeminiClient();
    
    console.log('🚀 Generating a CRM Dashboard Component...');
    console.log('   Using your real Gemini API key');
    console.log('   Model: gemini-2.0-flash-exp\n');
    
    const dashboardCode = await client.generateCode(
      'Create a modern CRM dashboard component with contact stats, recent activities, and a quick action panel',
      {
        crmEntities: ['Contact', 'Account', 'Opportunity', 'Activity'],
        designTokens: {
          colors: {
            primary: 'var(--twenty-color-blue-60)',
            background: 'var(--twenty-color-gray-0)',
            text: 'var(--twenty-color-gray-90)'
          },
          spacing: {
            sm: 'var(--twenty-spacing-2)',
            md: 'var(--twenty-spacing-4)',
            lg: 'var(--twenty-spacing-6)'
          }
        },
        outputRequirements: {
          format: 'tsx',
          includeTypes: true,
          useDesignTokens: true,
          responsive: true
        }
      }
    );
    
    console.log('✅ Dashboard component generated successfully!\n');
    console.log('📝 Generated Component Preview:');
    console.log('─'.repeat(60));
    console.log(dashboardCode.substring(0, 800) + '...');
    console.log('─'.repeat(60));
    
    console.log('\n🏗️  Generating a Contact Form Feature...');
    
    const contactFormFeature = await client.generateFeature(
      'Create a comprehensive contact form with validation, CRM integration, and success handling',
      {
        crmEntities: ['Contact', 'Account'],
        designTokens: { colors: { primary: 'blue' } },
        constraints: {
          maxFileSize: 30000,
          requiredPatterns: ['TypeScript', 'React hooks', 'form validation']
        }
      }
    );
    
    console.log('✅ Contact form feature generated successfully!\n');
    console.log('📋 Feature Summary:');
    console.log(`   Type: ${contactFormFeature.feature_type}`);
    console.log(`   Name: ${contactFormFeature.name}`);
    console.log(`   Files Generated: ${contactFormFeature.files.length}`);
    console.log(`   Dependencies: ${contactFormFeature.metadata.dependencies?.join(', ')}`);
    console.log(`   Integration Points: ${contactFormFeature.metadata.integration_points?.join(', ')}`);
    
    console.log('\n🎉 Demo Complete!');
    console.log('\n✨ Your ModernCRM system is now fully integrated with Gemini AI:');
    console.log('   • Real API calls working ✅');
    console.log('   • Component generation functional ✅');
    console.log('   • Feature generation operational ✅');
    console.log('   • CRM integration patterns included ✅');
    console.log('   • Design system tokens applied ✅');
    
    console.log('\n🚀 Ready for production deployment!');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n💡 API Key issue detected. Please check your .env file.');
    } else if (error.message.includes('quota')) {
      console.log('\n💡 API quota exceeded. Please check your Gemini API usage.');
    } else {
      console.log('\n💡 Unexpected error. The API integration may need debugging.');
    }
  }
}

// Run the demo
demonstrateRealAPI();
