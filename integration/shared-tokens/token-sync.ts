import * as fs from 'fs/promises';
import * as path from 'path';
import { DesignTokenMapping, DesignToken } from '../plugins/types';

export class DesignTokenSync {
  private tokenMapping: DesignTokenMapping | null = null;
  private readonly mappingPath: string;

  constructor() {
    this.mappingPath = path.join(process.cwd(), 'integration/shared-tokens/design-system-mapping.json');
  }

  /**
   * Load the design token mapping from JSON file
   */
  async loadTokenMapping(): Promise<void> {
    try {
      const mappingContent = await fs.readFile(this.mappingPath, 'utf-8');
      this.tokenMapping = JSON.parse(mappingContent);
      console.log('Design token mapping loaded successfully');
    } catch (error) {
      console.error('Failed to load design token mapping:', error);
      throw error;
    }
  }

  /**
   * Generate CSS variables for Twenty CRM
   */
  async generateTwentyCSSVariables(): Promise<string> {
    if (!this.tokenMapping) {
      await this.loadTokenMapping();
    }

    const cssVariables: string[] = [
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
          if ('lineHeight' in token && token.lineHeight) {
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

  /**
   * Generate CSS variables for Webstudio
   */
  async generateWebstudioCSSVariables(): Promise<string> {
    if (!this.tokenMapping) {
      await this.loadTokenMapping();
    }

    const cssVariables: string[] = [
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
          if ('lineHeight' in token && token.lineHeight) {
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

  /**
   * Generate component styles based on token mapping
   */
  async generateComponentStyles(): Promise<string> {
    if (!this.tokenMapping) {
      await this.loadTokenMapping();
    }

    const componentStyles: string[] = [
      '/* Generated Component Styles */',
      '/* Auto-generated from design-system-mapping.json */',
      '',
    ];

    if (this.tokenMapping?.components) {
      for (const [componentName, componentConfig] of Object.entries(this.tokenMapping.components)) {
        componentStyles.push(`/* ${componentName.charAt(0).toUpperCase() + componentName.slice(1)} Component */`);
        
        for (const [variant, styles] of Object.entries(componentConfig as Record<string, any>)) {
          const className = `.${componentName}--${variant}`;
          componentStyles.push(`${className} {`);
          
          for (const [property, value] of Object.entries(styles as Record<string, any>)) {
            if (property === 'hover' || property === 'focus' || property === 'active') {
              continue; // Handle pseudo-states separately
            }
            
            const cssProperty = this.camelToKebab(property);
            const cssValue = this.resolveTokenValue(value as string);
            componentStyles.push(`  ${cssProperty}: ${cssValue};`);
          }
          
          componentStyles.push('}');
          
          // Handle pseudo-states
          const stylesObj = styles as Record<string, any>;
          if ('hover' in stylesObj && stylesObj.hover) {
            componentStyles.push(`${className}:hover {`);
            for (const [property, value] of Object.entries(stylesObj.hover as Record<string, string>)) {
              const cssProperty = this.camelToKebab(property);
              const cssValue = this.resolveTokenValue(value);
              componentStyles.push(`  ${cssProperty}: ${cssValue};`);
            }
            componentStyles.push('}');
          }
          
          if ('focus' in stylesObj && stylesObj.focus) {
            componentStyles.push(`${className}:focus {`);
            for (const [property, value] of Object.entries(stylesObj.focus as Record<string, string>)) {
              const cssProperty = this.camelToKebab(property);
              const cssValue = this.resolveTokenValue(value);
              componentStyles.push(`  ${cssProperty}: ${cssValue};`);
            }
            componentStyles.push('}');
          }
          
          componentStyles.push('');
        }
      }
    }

    return componentStyles.join('\n');
  }

  /**
   * Convert camelCase to kebab-case
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Resolve token reference to actual value
   */
  private resolveTokenValue(value: string): string {
    if (!value.includes('.')) {
      return value;
    }

    const [category, tokenName] = value.split('.');
    
    if (!this.tokenMapping?.tokenMapping) {
      return value;
    }

    const tokenCategory = this.tokenMapping.tokenMapping[category as keyof typeof this.tokenMapping.tokenMapping];
    if (!tokenCategory) {
      return value;
    }

    if (category === 'typography') {
      // Handle nested typography tokens
      for (const [subCategory, tokens] of Object.entries(tokenCategory)) {
        if (tokens[tokenName]) {
          return tokens[tokenName].value;
        }
      }
    } else {
      // Handle flat token categories
      const token = (tokenCategory as Record<string, DesignToken>)[tokenName];
      if (token) {
        return token.value;
      }
    }

    return value;
  }

  /**
   * Sync design tokens to both systems
   */
  async syncTokens(): Promise<void> {
    try {
      console.log('Starting design token synchronization...');

      // Generate CSS variables for Twenty CRM
      const twentyCSS = await this.generateTwentyCSSVariables();
      const twentyOutputPath = path.join(process.cwd(), 'integration/shared-tokens/twenty-tokens.css');
      await fs.writeFile(twentyOutputPath, twentyCSS);
      console.log('Generated Twenty CRM CSS variables');

      // Generate CSS variables for Webstudio
      const webstudioCSS = await this.generateWebstudioCSSVariables();
      const webstudioOutputPath = path.join(process.cwd(), 'integration/shared-tokens/webstudio-tokens.css');
      await fs.writeFile(webstudioOutputPath, webstudioCSS);
      console.log('Generated Webstudio CSS variables');

      // Generate component styles
      const componentCSS = await this.generateComponentStyles();
      const componentOutputPath = path.join(process.cwd(), 'integration/shared-tokens/component-styles.css');
      await fs.writeFile(componentOutputPath, componentCSS);
      console.log('Generated component styles');

      console.log('Design token synchronization completed successfully');
    } catch (error) {
      console.error('Failed to sync design tokens:', error);
      throw error;
    }
  }

  /**
   * Validate token consistency
   */
  async validateTokens(): Promise<{ isValid: boolean; errors: string[] }> {
    if (!this.tokenMapping) {
      await this.loadTokenMapping();
    }

    const errors: string[] = [];

    // Validate that all tokens have both Twenty and Webstudio mappings
    if (this.tokenMapping?.tokenMapping) {
      for (const [category, tokens] of Object.entries(this.tokenMapping.tokenMapping)) {
        if (category === 'typography') {
          for (const [subCategory, subTokens] of Object.entries(tokens)) {
            for (const [tokenName, token] of Object.entries(subTokens)) {
              const designToken = token as DesignToken;
              if (!designToken.twenty || !designToken.webstudio || !designToken.value) {
                errors.push(`Missing mapping for ${category}.${subCategory}.${tokenName}`);
              }
            }
          }
        } else {
          for (const [tokenName, token] of Object.entries(tokens as Record<string, DesignToken>)) {
            const designToken = token as DesignToken;
            if (!designToken.twenty || !designToken.webstudio || !designToken.value) {
              errors.push(`Missing mapping for ${category}.${tokenName}`);
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get token mapping
   */
  getTokenMapping(): DesignTokenMapping | null {
    return this.tokenMapping;
  }
}
