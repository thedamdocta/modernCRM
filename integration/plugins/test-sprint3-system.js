/**
 * Sprint 3 System Test
 * Comprehensive test of enhanced code generation, module creation, and hot-reload
 */

import Sprint3Integration from './sprint3-integration.js';
import fs from 'fs/promises';
import path from 'path';

class Sprint3SystemTest {
  constructor() {
    this.integration = new Sprint3Integration();
    this.testResults = [];
    this.generatedModules = [];
  }

  /**
   * Run all Sprint 3 tests
   */
  async runAllTests() {
    console.log('🚀 Starting Sprint 3 System Tests');
    console.log('==================================================');

    try {
      // Initialize system
      await this.testSystemInitialization();
      
      // Test enhanced code generation
      await this.testEnhancedCodeGeneration();
      
      // Test module creation
      await this.testModuleCreation();
      
      // Test hot-reload functionality
      await this.testHotReload();
      
      // Test integration pipeline
      await this.testIntegrationPipeline();
      
      // Test error handling
      await this.testErrorHandling();
      
      // Generate test report
      await this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.addTestResult('System Test Suite', false, error.message);
    } finally {
      // Cleanup
      await this.cleanup();
    }
  }

  /**
   * Test system initialization
   */
  async testSystemInitialization() {
    console.log('\n📋 Testing System Initialization...');
    
    try {
      const startTime = Date.now();
      await this.integration.initialize();
      const initTime = Date.now() - startTime;
      
      const status = this.integration.getSystemStatus();
      
      const success = status.initialized && status.hotReload.isWatching;
      
      this.addTestResult('System Initialization', success, 
        success ? `Initialized in ${initTime}ms` : 'Failed to initialize');
      
      console.log(success ? '✅ System initialized successfully' : '❌ System initialization failed');
      
    } catch (error) {
      this.addTestResult('System Initialization', false, error.message);
      console.log('❌ System initialization failed:', error.message);
    }
  }

  /**
   * Test enhanced code generation
   */
  async testEnhancedCodeGeneration() {
    console.log('\n🤖 Testing Enhanced Code Generation...');
    
    const testCases = [
      {
        name: 'Contact Form Generation',
        prompt: 'Create a contact form component with name, email, and message fields',
        options: { featureType: 'contact-form', strictValidation: false }
      },
      {
        name: 'Dashboard Widget Generation',
        prompt: 'Create a dashboard widget showing CRM statistics',
        options: { featureType: 'dashboard-widget', strictValidation: false }
      },
      {
        name: 'Landing Page Generation',
        prompt: 'Create a real estate agent landing page with lead capture',
        options: { featureType: 'landing-page', strictValidation: false }
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`  Testing: ${testCase.name}`);
        
        const startTime = Date.now();
        const result = await this.integration.generateModuleWithFallback({
          prompt: testCase.prompt,
          options: testCase.options,
          context: {
            crmEntities: ['Contact', 'Account', 'Opportunity'],
            designTokens: {}
          }
        });
        
        const generationTime = Date.now() - startTime;
        
        if (result.success && result.module) {
          this.generatedModules.push(result.module);
          this.addTestResult(testCase.name, true, 
            `Generated in ${generationTime}ms, ${result.module.files.length} files created`);
          console.log(`    ✅ ${testCase.name} - Generated successfully`);
        } else {
          this.addTestResult(testCase.name, false, result.error || 'Unknown error');
          console.log(`    ❌ ${testCase.name} - Failed: ${result.error}`);
        }
        
      } catch (error) {
        this.addTestResult(testCase.name, false, error.message);
        console.log(`    ❌ ${testCase.name} - Error: ${error.message}`);
      }
    }
  }

  /**
   * Test module creation and file system operations
   */
  async testModuleCreation() {
    console.log('\n📁 Testing Module Creation...');
    
    try {
      // Test module listing
      const modules = await this.integration.listModules();
      const moduleCount = modules.length;
      
      this.addTestResult('Module Listing', true, `Found ${moduleCount} modules`);
      console.log(`  ✅ Module listing - Found ${moduleCount} modules`);
      
      // Test individual module retrieval
      if (this.generatedModules.length > 0) {
        const testModule = this.generatedModules[0];
        const retrievedModule = await this.integration.getModule(testModule.config.slug);
        
        const retrievalSuccess = retrievedModule && retrievedModule.id === testModule.id;
        this.addTestResult('Module Retrieval', retrievalSuccess, 
          retrievalSuccess ? 'Module retrieved successfully' : 'Failed to retrieve module');
        
        console.log(retrievalSuccess ? 
          '  ✅ Module retrieval - Success' : 
          '  ❌ Module retrieval - Failed');
      }
      
      // Test file system structure
      await this.testFileSystemStructure();
      
    } catch (error) {
      this.addTestResult('Module Creation Tests', false, error.message);
      console.log('  ❌ Module creation tests failed:', error.message);
    }
  }

  /**
   * Test file system structure
   */
  async testFileSystemStructure() {
    console.log('  📂 Testing file system structure...');
    
    try {
      const generatedPath = path.join(process.cwd(), 'integration/plugins/generated');
      
      // Check if generated directory exists
      try {
        await fs.access(generatedPath);
        console.log('    ✅ Generated modules directory exists');
      } catch {
        console.log('    ❌ Generated modules directory not found');
        return;
      }
      
      // Check module directories
      const moduleDirectories = await fs.readdir(generatedPath);
      
      for (const moduleDir of moduleDirectories) {
        const modulePath = path.join(generatedPath, moduleDir);
        const stat = await fs.stat(modulePath);
        
        if (stat.isDirectory()) {
          // Check for required files
          const requiredFiles = ['plugin.json', 'module-metadata.json', 'index.ts'];
          let allFilesExist = true;
          
          for (const file of requiredFiles) {
            try {
              await fs.access(path.join(modulePath, file));
            } catch {
              allFilesExist = false;
              break;
            }
          }
          
          console.log(`    ${allFilesExist ? '✅' : '❌'} Module ${moduleDir} - Required files ${allFilesExist ? 'present' : 'missing'}`);
        }
      }
      
      this.addTestResult('File System Structure', true, `Validated ${moduleDirectories.length} module directories`);
      
    } catch (error) {
      this.addTestResult('File System Structure', false, error.message);
      console.log('    ❌ File system structure test failed:', error.message);
    }
  }

  /**
   * Test hot-reload functionality
   */
  async testHotReload() {
    console.log('\n🔄 Testing Hot-Reload Functionality...');
    
    try {
      const hotReloadStatus = this.integration.getSystemStatus().hotReload;
      
      const isActive = hotReloadStatus.isWatching;
      this.addTestResult('Hot-Reload Active', isActive, 
        isActive ? 'Hot-reload system is active' : 'Hot-reload system not active');
      
      console.log(isActive ? 
        '  ✅ Hot-reload system is active' : 
        '  ❌ Hot-reload system not active');
      
      // Test module toggle
      if (this.generatedModules.length > 0) {
        const testModule = this.generatedModules[0];
        
        // Disable module
        const disableSuccess = await this.integration.toggleModule(testModule.config.slug, false);
        this.addTestResult('Module Disable', disableSuccess, 
          disableSuccess ? 'Module disabled successfully' : 'Failed to disable module');
        
        // Re-enable module
        const enableSuccess = await this.integration.toggleModule(testModule.config.slug, true);
        this.addTestResult('Module Enable', enableSuccess, 
          enableSuccess ? 'Module enabled successfully' : 'Failed to enable module');
        
        console.log(`  ${disableSuccess && enableSuccess ? '✅' : '❌'} Module toggle functionality`);
      }
      
    } catch (error) {
      this.addTestResult('Hot-Reload Tests', false, error.message);
      console.log('  ❌ Hot-reload tests failed:', error.message);
    }
  }

  /**
   * Test integration pipeline
   */
  async testIntegrationPipeline() {
    console.log('\n🔗 Testing Integration Pipeline...');
    
    try {
      const pipelineTest = await this.integration.testPipeline();
      
      const success = pipelineTest.success && pipelineTest.moduleCreated;
      this.addTestResult('Integration Pipeline', success, 
        success ? `Pipeline test completed in ${pipelineTest.generationTime}ms` : pipelineTest.error);
      
      console.log(success ? 
        '  ✅ Integration pipeline test passed' : 
        `  ❌ Integration pipeline test failed: ${pipelineTest.error}`);
      
    } catch (error) {
      this.addTestResult('Integration Pipeline', false, error.message);
      console.log('  ❌ Integration pipeline test failed:', error.message);
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    console.log('\n⚠️  Testing Error Handling...');
    
    try {
      // Test invalid prompt
      const invalidResult = await this.integration.generateModuleWithFallback({
        prompt: '', // Empty prompt
        options: { strictValidation: true }
      });
      
      // Should still work with fallback
      const fallbackWorked = invalidResult.success;
      this.addTestResult('Fallback Generation', fallbackWorked, 
        fallbackWorked ? 'Fallback generation worked' : 'Fallback generation failed');
      
      console.log(fallbackWorked ? 
        '  ✅ Fallback generation works' : 
        '  ❌ Fallback generation failed');
      
      // Test non-existent module operations
      const nonExistentToggle = await this.integration.toggleModule('non-existent-module', true);
      this.addTestResult('Non-existent Module Handling', !nonExistentToggle, 
        !nonExistentToggle ? 'Correctly handled non-existent module' : 'Should have failed');
      
      console.log(!nonExistentToggle ? 
        '  ✅ Non-existent module handling works' : 
        '  ❌ Non-existent module handling failed');
      
    } catch (error) {
      this.addTestResult('Error Handling Tests', false, error.message);
      console.log('  ❌ Error handling tests failed:', error.message);
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, success, details) {
    this.testResults.push({
      test: testName,
      success,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate test report
   */
  async generateTestReport() {
    console.log('\n📊 Generating Test Report...');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults,
      generatedModules: this.generatedModules.map(m => ({
        id: m.id,
        name: m.config.name,
        slug: m.config.slug,
        fileCount: m.files.length,
        createdAt: m.metadata.createdAt
      }))
    };
    
    // Write report to file
    const reportPath = path.join(process.cwd(), 'integration/plugins/test-output/sprint3-test-report.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n📈 Test Summary');
    console.log('==================================================');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Success Rate: ${successRate}%`);
    console.log(`📁 Generated Modules: ${this.generatedModules.length}`);
    console.log(`📄 Report saved to: ${reportPath}`);
    
    return report;
  }

  /**
   * Cleanup test resources
   */
  async cleanup() {
    console.log('\n🧹 Cleaning up test resources...');
    
    try {
      // Shutdown integration system
      await this.integration.shutdown();
      console.log('  ✅ Integration system shutdown');
      
      // Note: We're keeping generated modules for inspection
      // In a real scenario, you might want to clean them up
      
    } catch (error) {
      console.log('  ⚠️ Cleanup error:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new Sprint3SystemTest();
  test.runAllTests().catch(console.error);
}

export default Sprint3SystemTest;
