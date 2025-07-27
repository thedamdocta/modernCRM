/**
 * Sprint 3 Demo Script
 * Demonstrates the enhanced code generation and module creation system
 */

import Sprint3Integration from './sprint3-integration.js';

async function runSprint3Demo() {
  console.log('🚀 Sprint 3 Enhanced Code Generation Demo');
  console.log('==========================================\n');

  const integration = new Sprint3Integration();

  try {
    // Initialize the system
    console.log('📋 Initializing Sprint 3 Integration System...');
    await integration.initialize();
    console.log('✅ System initialized successfully!\n');

    // Demo 1: Generate a contact form component
    console.log('🤖 Demo 1: Generating Contact Form Component');
    console.log('--------------------------------------------');
    
    const contactFormResult = await integration.generateModuleWithFallback({
      prompt: 'Create a modern contact form component with name, email, phone, and message fields. Include validation and a submit button.',
      options: {
        featureType: 'contact-form',
        strictValidation: false,
        outputFormat: 'component'
      },
      context: {
        crmEntities: ['Contact', 'Account'],
        designTokens: {
          primaryColor: '#007bff',
          borderRadius: '8px',
          spacing: '16px'
        }
      }
    });

    if (contactFormResult.success) {
      console.log(`✅ Contact form generated successfully!`);
      console.log(`   Module ID: ${contactFormResult.module.id}`);
      console.log(`   Files created: ${contactFormResult.module.files.length}`);
      console.log(`   Generation time: ${contactFormResult.generationTime}ms\n`);
    } else {
      console.log(`❌ Contact form generation failed: ${contactFormResult.error}\n`);
    }

    // Demo 2: Generate a dashboard widget
    console.log('📊 Demo 2: Generating Dashboard Widget');
    console.log('-------------------------------------');
    
    const dashboardResult = await integration.generateModuleWithFallback({
      prompt: 'Create a dashboard widget that displays CRM statistics including total contacts, active deals, and monthly revenue. Use charts and modern styling.',
      options: {
        featureType: 'dashboard-widget',
        strictValidation: false,
        outputFormat: 'widget'
      },
      context: {
        crmEntities: ['Contact', 'Account', 'Opportunity', 'Deal'],
        designTokens: {
          primaryColor: '#28a745',
          backgroundColor: '#f8f9fa',
          textColor: '#333'
        }
      }
    });

    if (dashboardResult.success) {
      console.log(`✅ Dashboard widget generated successfully!`);
      console.log(`   Module ID: ${dashboardResult.module.id}`);
      console.log(`   Files created: ${dashboardResult.module.files.length}`);
      console.log(`   Generation time: ${dashboardResult.generationTime}ms\n`);
    } else {
      console.log(`❌ Dashboard widget generation failed: ${dashboardResult.error}\n`);
    }

    // Demo 3: List all generated modules
    console.log('📁 Demo 3: Listing Generated Modules');
    console.log('-----------------------------------');
    
    const modules = await integration.listModules();
    console.log(`Found ${modules.length} generated modules:`);
    
    modules.forEach((module, index) => {
      console.log(`   ${index + 1}. ${module.config.name} (${module.config.slug})`);
      console.log(`      Type: ${module.config.feature_type}`);
      console.log(`      Files: ${module.files.length}`);
      console.log(`      Created: ${new Date(module.metadata.createdAt).toLocaleString()}`);
    });
    console.log('');

    // Demo 4: System status
    console.log('📊 Demo 4: System Status');
    console.log('------------------------');
    
    const status = integration.getSystemStatus();
    console.log(`System initialized: ${status.initialized ? '✅' : '❌'}`);
    console.log(`Hot-reload active: ${status.hotReload.isWatching ? '✅' : '❌'}`);
    console.log(`Loaded plugins: ${status.hotReload.loadedPlugins}`);
    console.log(`Active watchers: ${status.hotReload.activeWatchers}\n`);

    // Demo 5: Test module operations
    if (modules.length > 0) {
      console.log('🔄 Demo 5: Module Operations');
      console.log('----------------------------');
      
      const testModule = modules[0];
      console.log(`Testing operations on: ${testModule.config.name}`);
      
      // Test disable
      const disableResult = await integration.toggleModule(testModule.config.slug, false);
      console.log(`Disable module: ${disableResult ? '✅' : '❌'}`);
      
      // Test enable
      const enableResult = await integration.toggleModule(testModule.config.slug, true);
      console.log(`Enable module: ${enableResult ? '✅' : '❌'}`);
      
      // Test reload
      const reloadResult = await integration.reloadModule(testModule.config.slug);
      console.log(`Reload module: ${reloadResult ? '✅' : '❌'}\n`);
    }

    console.log('🎉 Sprint 3 Demo Completed Successfully!');
    console.log('========================================');
    console.log('Key achievements demonstrated:');
    console.log('✅ Enhanced AI code generation with context');
    console.log('✅ Automated module creation and file management');
    console.log('✅ Hot-reload system with real-time updates');
    console.log('✅ Module lifecycle management');
    console.log('✅ Integration pipeline working end-to-end');
    console.log('✅ Fallback generation for reliability\n');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Cleanup
    console.log('🧹 Shutting down system...');
    await integration.shutdown();
    console.log('✅ System shutdown complete');
  }
}

// Run the demo
runSprint3Demo().catch(console.error);
