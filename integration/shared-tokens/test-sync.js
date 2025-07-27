const fs = require('fs').promises;
const path = require('path');

class DesignTokenSync {
  constructor() {
    this.tokenMapping = null;
    this.mappingPath = path.join(process.cwd(), 'design-system-mapping.json');
  }

  async loadTokenMapping() {
    try {
      const mappingContent = await fs.readFile(this.mappingPath, 'utf-8');
      this.tokenMapping = JSON.parse(mappingContent);
      console.log('Design token mapping loaded successfully');
    } catch (error) {
      console.error('Failed to load design token mapping:', error);
      throw error;
    }
  }

  async generateTwentyCSSVariables() {
    if (!this.tokenMapping) {
      await this.loadTokenMapping();
    }

    const cssVariables = [
      '/* Generated CSS Variables for Twenty CRM */',
      '/* Auto-generated from design-system-mapping.json */',
      '',
      ':root {',
    ];

    // Generate color variables
    if (this.tokenMapping?.tokenMapping.colors) {
      cssVariables.push('  /* Colors */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.colors)) {
        const variableName = token.twenty.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${token.description || tokenName} */`);
      }
      cssVariables.push('');
    }

    // Generate typography variables
    if (this.tokenMapping?.tokenMapping.typography) {
      cssVariables.push('  /* Typography */');
      for (const [category, tokens] of Object.entries(this.tokenMapping.tokenMapping.typography)) {
        for (const [tokenName, token] of Object.entries(tokens)) {
          const variableName = token.twenty.replace('var(', '').replace(')', '');
          cssVariables.push(`  ${variableName}: ${token.value}; /* ${category} ${tokenName} */`);
          if (token.lineHeight) {
            const lineHeightVar = variableName.replace('size', 'line-height');
            cssVariables.push(`  ${lineHeightVar}: ${token.lineHeight};`);
          }
        }
      }
      cssVariables.push('');
    }

    // Generate spacing variables
    if (this.tokenMapping?.tokenMapping.spacing) {
      cssVariables.push('  /* Spacing */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.spacing)) {
        const variableName = token.twenty.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${tokenName} */`);
      }
      cssVariables.push('');
    }

    // Generate border radius variables
    if (this.tokenMapping?.tokenMapping.borderRadius) {
      cssVariables.push('  /* Border Radius */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.borderRadius)) {
        const variableName = token.twenty.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${tokenName} */`);
      }
      cssVariables.push('');
    }

    // Generate shadow variables
    if (this.tokenMapping?.tokenMapping.shadows) {
      cssVariables.push('  /* Shadows */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.shadows)) {
        const variableName = token.twenty.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${tokenName} */`);
      }
      cssVariables.push('');
    }

    cssVariables.push('}');
    cssVariables.push('');

    return cssVariables.join('\n');
  }

  async generateWebstudioCSSVariables() {
    if (!this.tokenMapping) {
      await this.loadTokenMapping();
    }

    const cssVariables = [
      '/* Generated CSS Variables for Webstudio */',
      '/* Auto-generated from design-system-mapping.json */',
      '',
      ':root {',
    ];

    // Generate color variables
    if (this.tokenMapping?.tokenMapping.colors) {
      cssVariables.push('  /* Colors */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.colors)) {
        const variableName = token.webstudio.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${token.description || tokenName} */`);
      }
      cssVariables.push('');
    }

    // Generate typography variables
    if (this.tokenMapping?.tokenMapping.typography) {
      cssVariables.push('  /* Typography */');
      for (const [category, tokens] of Object.entries(this.tokenMapping.tokenMapping.typography)) {
        for (const [tokenName, token] of Object.entries(tokens)) {
          const variableName = token.webstudio.replace('var(', '').replace(')', '');
          cssVariables.push(`  ${variableName}: ${token.value}; /* ${category} ${tokenName} */`);
          if (token.lineHeight) {
            const lineHeightVar = variableName.replace('size', 'line-height');
            cssVariables.push(`  ${lineHeightVar}: ${token.lineHeight};`);
          }
        }
      }
      cssVariables.push('');
    }

    // Generate spacing variables
    if (this.tokenMapping?.tokenMapping.spacing) {
      cssVariables.push('  /* Spacing */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.spacing)) {
        const variableName = token.webstudio.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${tokenName} */`);
      }
      cssVariables.push('');
    }

    // Generate border radius variables
    if (this.tokenMapping?.tokenMapping.borderRadius) {
      cssVariables.push('  /* Border Radius */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.borderRadius)) {
        const variableName = token.webstudio.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${tokenName} */`);
      }
      cssVariables.push('');
    }

    // Generate shadow variables
    if (this.tokenMapping?.tokenMapping.shadows) {
      cssVariables.push('  /* Shadows */');
      for (const [tokenName, token] of Object.entries(this.tokenMapping.tokenMapping.shadows)) {
        const variableName = token.webstudio.replace('var(', '').replace(')', '');
        cssVariables.push(`  ${variableName}: ${token.value}; /* ${tokenName} */`);
      }
      cssVariables.push('');
    }

    cssVariables.push('}');
    cssVariables.push('');

    return cssVariables.join('\n');
  }

  async syncTokens() {
    try {
      console.log('Starting design token synchronization...');

      // Generate CSS variables for Twenty CRM
      const twentyCSS = await this.generateTwentyCSSVariables();
      const twentyOutputPath = path.join(process.cwd(), 'twenty-tokens.css');
      await fs.writeFile(twentyOutputPath, twentyCSS);
      console.log('Generated Twenty CRM CSS variables');

      // Generate CSS variables for Webstudio
      const webstudioCSS = await this.generateWebstudioCSSVariables();
      const webstudioOutputPath = path.join(process.cwd(), 'webstudio-tokens.css');
      await fs.writeFile(webstudioOutputPath, webstudioCSS);
      console.log('Generated Webstudio CSS variables');

      console.log('Design token synchronization completed successfully');
    } catch (error) {
      console.error('Failed to sync design tokens:', error);
      throw error;
    }
  }
}

// Run the sync
const sync = new DesignTokenSync();
sync.syncTokens().then(() => {
  console.log('✅ Token synchronization completed successfully');
}).catch(error => {
  console.error('❌ Token synchronization failed:', error);
});
