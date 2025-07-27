#!/usr/bin/env node

/**
 * Test script to verify Gemini API connection
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

import GeminiClient from './gemini-client.js';

async function testGeminiConnection() {
  console.log('🧪 Testing Gemini API Connection...\n');
  
  try {
    // Check if API key is loaded
    console.log('📋 Configuration Check:');
    console.log(`   API Key: ${process.env.GEMINI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
    console.log(`   Model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'}`);
    console.log(`   Context Window: ${process.env.CONTEXT_WINDOW_SIZE || '1000000'}\n`);
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    
    // Initialize client
    console.log('🚀 Initializing Gemini Client...');
    const client = new GeminiClient();
    
    // Test basic connection
    console.log('🔗 Testing API Connection...');
    const connectionTest = await client.testConnection();
    
    if (connectionTest) {
      console.log('✅ Connection successful!\n');
    } else {
      console.log('❌ Connection failed!\n');
      return;
    }
    
    // Test code generation
    console.log('🎨 Testing Code Generation...');
    const testPrompt = 'Create a simple React button component with TypeScript';
    
    console.log(`   Prompt: "${testPrompt}"`);
    console.log('   Generating...');
    
    const generatedCode = await client.generateCode(testPrompt, {
      outputRequirements: {
        format: 'tsx',
        includeTypes: true,
        useDesignTokens: true
      }
    });
    
    console.log('✅ Code generation successful!');
    console.log('\n📝 Generated Code Preview:');
    console.log('─'.repeat(50));
    console.log(generatedCode.substring(0, 500) + (generatedCode.length > 500 ? '...' : ''));
    console.log('─'.repeat(50));
    
    // Test feature generation
    console.log('\n🏗️  Testing Feature Generation...');
    const featurePrompt = 'Create a contact form for CRM integration';
    
    console.log(`   Prompt: "${featurePrompt}"`);
    console.log('   Generating...');
    
    const feature = await client.generateFeature(featurePrompt, {
      crmEntities: ['Contact', 'Account'],
      designTokens: { colors: { primary: 'blue' } }
    });
    
    console.log('✅ Feature generation successful!');
    console.log('\n📋 Feature Details:');
    console.log(`   Type: ${feature.feature_type}`);
    console.log(`   Name: ${feature.name}`);
    console.log(`   Files: ${feature.files.length}`);
    console.log(`   Dependencies: ${feature.metadata.dependencies?.length || 0}`);
    
    console.log('\n🎉 All tests passed! Your Gemini API is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.message.includes('API_KEY')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure your .env file is in the root directory');
      console.log('   2. Verify your API key is correct');
      console.log('   3. Check that the API key has proper permissions');
    }
    
    process.exit(1);
  }
}

// Run the test
testGeminiConnection();
