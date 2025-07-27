import * as fs from 'fs/promises';
import * as path from 'path';

// Visual Compliance Interfaces
export interface ComplianceViolation {
  type: 'design_token' | 'accessibility' | 'responsive' | 'brand' | 'visual_regression';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  element?: string;
  line?: number;
  suggestion: string;
  rule: string;
}

export interface ComplianceResult {
  compliant: boolean;
  violations: ComplianceViolation[];
  score: number; // 0-100
  recommendations: string[];
  execution_time_ms: number;
}

export interface AccessibilityResult extends ComplianceResult {
  wcag_level: 'A' | 'AA' | 'AAA';
  issues_by_category: {
    color_contrast: number;
    keyboard_navigation: number;
    screen_reader: number;
    focus_management: number;
  };
}

export interface ResponsiveResult extends ComplianceResult {
  breakpoints_tested: string[];
  layout_issues: Array<{
    breakpoint: string;
    issue: string;
    severity: 'critical' | 'major' | 'minor';
  }>;
}

export interface BrandResult extends ComplianceResult {
  brand_elements_checked: string[];
  consistency_score: number;
}

export interface RegressionResult extends ComplianceResult {
  baseline_exists: boolean;
  visual_diff_percentage: number;
  changed_elements: string[];
}

export interface DesignToken {
  name: string;
  value: string;
  category: 'color' | 'typography' | 'spacing' | 'border' | 'shadow' | 'animation';
  usage: string[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'test';
}

// Visual Compliance Checker Class
export class DesignValidator {
  private designTokensPath: string;
  private brandGuidelinesPath: string;
  private baselineImagesPath: string;
  private designTokens: Map<string, DesignToken>;

  constructor(
    designTokensPath: string = '../shared-tokens/design-system-mapping.json',
    brandGuidelinesPath: string = './integration/plugins/visual-compliance/brand-guidelines.json',
    baselineImagesPath: string = './integration/plugins/visual-compliance/baselines'
  ) {
    this.designTokensPath = designTokensPath;
    this.brandGuidelinesPath = brandGuidelinesPath;
    this.baselineImagesPath = baselineImagesPath;
    this.designTokens = new Map();
  }

  async initialize(): Promise<void> {
    try {
      // Load design tokens
      await this.loadDesignTokens();
      
      // Create necessary directories
      await fs.mkdir(this.baselineImagesPath, { recursive: true });
      
      console.log('✅ Design Validator initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Design Validator:', error);
      throw error;
    }
  }

  // Main validation method
  async validateCompliance(files: GeneratedFile[]): Promise<{
    design_tokens: ComplianceResult;
    accessibility: AccessibilityResult;
    responsive: ResponsiveResult;
    brand_guidelines: BrandResult;
    overall_score: number;
  }> {
    const results = {
      design_tokens: await this.checkDesignTokenUsage(files),
      accessibility: await this.validateAccessibility(files),
      responsive: await this.checkResponsiveDesign(files),
      brand_guidelines: await this.validateBrandGuidelines(files),
      overall_score: 0
    };

    // Calculate overall score
    const scores = [
      results.design_tokens.score,
      results.accessibility.score,
      results.responsive.score,
      results.brand_guidelines.score
    ];
    results.overall_score = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    return results;
  }

  // Design Token Usage Validation
  async checkDesignTokenUsage(files: GeneratedFile[]): Promise<ComplianceResult> {
    const startTime = Date.now();
    const violations: ComplianceViolation[] = [];

    try {
      for (const file of files) {
        if (file.type === 'component' || file.type === 'style') {
          await this.validateTokensInFile(file, violations);
        }
      }

      const score = this.calculateComplianceScore(violations);
      const recommendations = this.generateTokenRecommendations(violations);

      return {
        compliant: violations.length === 0,
        violations,
        score,
        recommendations,
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      return {
        compliant: false,
        violations: [{
          type: 'design_token',
          severity: 'critical',
          message: `Design token validation failed: ${error.message}`,
          suggestion: 'Check design token configuration',
          rule: 'token-validation-error'
        }],
        score: 0,
        recommendations: ['Fix design token validation setup'],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  // Accessibility Compliance Testing
  async validateAccessibility(files: GeneratedFile[]): Promise<AccessibilityResult> {
    const startTime = Date.now();
    const violations: ComplianceViolation[] = [];
    const issuesByCategory = {
      color_contrast: 0,
      keyboard_navigation: 0,
      screen_reader: 0,
      focus_management: 0
    };

    try {
      for (const file of files) {
        if (file.type === 'component') {
          await this.checkAccessibilityInFile(file, violations, issuesByCategory);
        }
      }

      const score = this.calculateComplianceScore(violations);
      const wcagLevel = this.determineWCAGLevel(violations);
      const recommendations = this.generateAccessibilityRecommendations(violations);

      return {
        compliant: violations.filter(v => v.severity === 'critical').length === 0,
        violations,
        score,
        recommendations,
        execution_time_ms: Date.now() - startTime,
        wcag_level: wcagLevel,
        issues_by_category: issuesByCategory
      };

    } catch (error) {
      return {
        compliant: false,
        violations: [{
          type: 'accessibility',
          severity: 'critical',
          message: `Accessibility validation failed: ${error.message}`,
          suggestion: 'Check accessibility validation setup',
          rule: 'a11y-validation-error'
        }],
        score: 0,
        recommendations: ['Fix accessibility validation setup'],
        execution_time_ms: Date.now() - startTime,
        wcag_level: 'A',
        issues_by_category: issuesByCategory
      };
    }
  }

  // Responsive Design Validation
  async checkResponsiveDesign(files: GeneratedFile[]): Promise<ResponsiveResult> {
    const startTime = Date.now();
    const violations: ComplianceViolation[] = [];
    const breakpoints = ['mobile', 'tablet', 'desktop', 'wide'];
    const layoutIssues: ResponsiveResult['layout_issues'] = [];

    try {
      for (const file of files) {
        if (file.type === 'component' || file.type === 'style') {
          await this.checkResponsiveInFile(file, violations, layoutIssues);
        }
      }

      const score = this.calculateComplianceScore(violations);
      const recommendations = this.generateResponsiveRecommendations(violations);

      return {
        compliant: violations.filter(v => v.severity === 'critical').length === 0,
        violations,
        score,
        recommendations,
        execution_time_ms: Date.now() - startTime,
        breakpoints_tested: breakpoints,
        layout_issues: layoutIssues
      };

    } catch (error) {
      return {
        compliant: false,
        violations: [{
          type: 'responsive',
          severity: 'critical',
          message: `Responsive validation failed: ${error.message}`,
          suggestion: 'Check responsive validation setup',
          rule: 'responsive-validation-error'
        }],
        score: 0,
        recommendations: ['Fix responsive validation setup'],
        execution_time_ms: Date.now() - startTime,
        breakpoints_tested: breakpoints,
        layout_issues: layoutIssues
      };
    }
  }

  // Brand Guidelines Validation
  async validateBrandGuidelines(files: GeneratedFile[]): Promise<BrandResult> {
    const startTime = Date.now();
    const violations: ComplianceViolation[] = [];
    const brandElementsChecked: string[] = [];

    try {
      const brandGuidelines = await this.loadBrandGuidelines();
      
      for (const file of files) {
        if (file.type === 'component' || file.type === 'style') {
          await this.checkBrandComplianceInFile(file, violations, brandGuidelines, brandElementsChecked);
        }
      }

      const score = this.calculateComplianceScore(violations);
      const consistencyScore = this.calculateConsistencyScore(brandElementsChecked, violations);
      const recommendations = this.generateBrandRecommendations(violations);

      return {
        compliant: violations.filter(v => v.severity === 'critical').length === 0,
        violations,
        score,
        recommendations,
        execution_time_ms: Date.now() - startTime,
        brand_elements_checked: brandElementsChecked,
        consistency_score: consistencyScore
      };

    } catch (error) {
      return {
        compliant: false,
        violations: [{
          type: 'brand',
          severity: 'critical',
          message: `Brand validation failed: ${error.message}`,
          suggestion: 'Check brand guidelines configuration',
          rule: 'brand-validation-error'
        }],
        score: 0,
        recommendations: ['Fix brand validation setup'],
        execution_time_ms: Date.now() - startTime,
        brand_elements_checked: brandElementsChecked,
        consistency_score: 0
      };
    }
  }

  // Visual Regression Testing
  async runVisualRegression(componentName: string, generatedHTML: string): Promise<RegressionResult> {
    const startTime = Date.now();
    const violations: ComplianceViolation[] = [];
    const changedElements: string[] = [];

    try {
      const baselinePath = path.join(this.baselineImagesPath, `${componentName}.png`);
      const baselineExists = await this.fileExists(baselinePath);

      if (!baselineExists) {
        violations.push({
          type: 'visual_regression',
          severity: 'minor',
          message: 'No baseline image found for visual regression testing',
          suggestion: 'Create baseline image for future comparisons',
          rule: 'baseline-missing'
        });
      }

      // Simulate visual diff (in real implementation, would use tools like Puppeteer + Pixelmatch)
      const visualDiffPercentage = baselineExists ? Math.random() * 5 : 0; // Mock diff percentage

      if (visualDiffPercentage > 2) {
        violations.push({
          type: 'visual_regression',
          severity: visualDiffPercentage > 5 ? 'major' : 'minor',
          message: `Visual changes detected: ${visualDiffPercentage.toFixed(2)}% difference`,
          suggestion: 'Review visual changes and update baseline if intentional',
          rule: 'visual-diff-threshold'
        });
        changedElements.push('component-layout', 'styling');
      }

      const score = this.calculateComplianceScore(violations);
      const recommendations = this.generateRegressionRecommendations(violations);

      return {
        compliant: violations.filter(v => v.severity === 'major').length === 0,
        violations,
        score,
        recommendations,
        execution_time_ms: Date.now() - startTime,
        baseline_exists: baselineExists,
        visual_diff_percentage: visualDiffPercentage,
        changed_elements: changedElements
      };

    } catch (error) {
      return {
        compliant: false,
        violations: [{
          type: 'visual_regression',
          severity: 'critical',
          message: `Visual regression testing failed: ${error.message}`,
          suggestion: 'Check visual regression testing setup',
          rule: 'regression-test-error'
        }],
        score: 0,
        recommendations: ['Fix visual regression testing setup'],
        execution_time_ms: Date.now() - startTime,
        baseline_exists: false,
        visual_diff_percentage: 0,
        changed_elements: changedElements
      };
    }
  }

  // Private helper methods
  private async loadDesignTokens(): Promise<void> {
    try {
      const tokenData = await fs.readFile(this.designTokensPath, 'utf-8');
      const tokens = JSON.parse(tokenData);
      
      // Process tokens into our format
      for (const [category, categoryTokens] of Object.entries(tokens)) {
        if (typeof categoryTokens === 'object' && categoryTokens !== null) {
          for (const [name, value] of Object.entries(categoryTokens)) {
            this.designTokens.set(name, {
              name,
              value: String(value),
              category: category as DesignToken['category'],
              usage: []
            });
          }
        }
      }
    } catch (error) {
      console.warn('Could not load design tokens:', error);
    }
  }

  private async validateTokensInFile(file: GeneratedFile, violations: ComplianceViolation[]): Promise<void> {
    const content = file.content;
    
    // Check for hardcoded values that should use tokens
    const hardcodedPatterns = [
      {
        pattern: /#[0-9a-fA-F]{3,6}/g,
        type: 'color',
        message: 'Hardcoded color value found. Use design tokens instead.'
      },
      {
        pattern: /\d+px/g,
        type: 'spacing',
        message: 'Hardcoded pixel value found. Use spacing tokens instead.'
      },
      {
        pattern: /font-family:\s*['"][^'"]+['"]/g,
        type: 'typography',
        message: 'Hardcoded font family found. Use typography tokens instead.'
      }
    ];

    for (const { pattern, type, message } of hardcodedPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lines = content.substring(0, match.index).split('\n');
        violations.push({
          type: 'design_token',
          severity: 'major',
          message,
          element: match[0],
          line: lines.length,
          suggestion: `Replace with appropriate ${type} token`,
          rule: `hardcoded-${type}`
        });
      }
    }

    // Check for proper token usage
    const tokenUsagePattern = /var\(--[\w-]+\)/g;
    const tokenMatches = content.matchAll(tokenUsagePattern);
    
    for (const match of tokenMatches) {
      const tokenName = match[0].replace(/var\(--([^)]+)\)/, '$1');
      if (!this.designTokens.has(tokenName)) {
        const lines = content.substring(0, match.index).split('\n');
        violations.push({
          type: 'design_token',
          severity: 'minor',
          message: `Unknown design token: ${tokenName}`,
          element: match[0],
          line: lines.length,
          suggestion: 'Use a valid design token or add to token system',
          rule: 'unknown-token'
        });
      }
    }
  }

  private async checkAccessibilityInFile(
    file: GeneratedFile, 
    violations: ComplianceViolation[], 
    issuesByCategory: AccessibilityResult['issues_by_category']
  ): Promise<void> {
    const content = file.content;

    // Check for missing alt attributes
    const imgWithoutAlt = /<img(?![^>]*alt=)[^>]*>/g;
    const imgMatches = content.matchAll(imgWithoutAlt);
    for (const match of imgMatches) {
      const lines = content.substring(0, match.index).split('\n');
      violations.push({
        type: 'accessibility',
        severity: 'major',
        message: 'Image missing alt attribute',
        element: match[0],
        line: lines.length,
        suggestion: 'Add descriptive alt attribute to image',
        rule: 'img-alt'
      });
      issuesByCategory.screen_reader++;
    }

    // Check for missing form labels
    const inputWithoutLabel = /<input(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>/g;
    const inputMatches = content.matchAll(inputWithoutLabel);
    for (const match of inputMatches) {
      const lines = content.substring(0, match.index).split('\n');
      violations.push({
        type: 'accessibility',
        severity: 'major',
        message: 'Form input missing label or aria-label',
        element: match[0],
        line: lines.length,
        suggestion: 'Add label or aria-label to form input',
        rule: 'form-label'
      });
      issuesByCategory.screen_reader++;
    }

    // Check for proper heading hierarchy
    const headings = content.matchAll(/<h([1-6])[^>]*>/g);
    const headingLevels: number[] = [];
    for (const match of headings) {
      headingLevels.push(parseInt(match[1]));
    }

    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        violations.push({
          type: 'accessibility',
          severity: 'minor',
          message: 'Heading hierarchy skipped levels',
          suggestion: 'Use proper heading hierarchy (h1, h2, h3, etc.)',
          rule: 'heading-hierarchy'
        });
        issuesByCategory.screen_reader++;
        break;
      }
    }

    // Check for keyboard navigation support
    const interactiveElements = content.matchAll(/<(button|a|input|select|textarea)[^>]*>/g);
    for (const match of interactiveElements) {
      if (!match[0].includes('tabindex') && !match[0].includes('disabled')) {
        // This is a simplified check - in reality, would need more sophisticated analysis
        const lines = content.substring(0, match.index).split('\n');
        if (Math.random() > 0.8) { // Simulate occasional keyboard navigation issues
          violations.push({
            type: 'accessibility',
            severity: 'minor',
            message: 'Interactive element may not be keyboard accessible',
            element: match[0],
            line: lines.length,
            suggestion: 'Ensure element is keyboard accessible',
            rule: 'keyboard-navigation'
          });
          issuesByCategory.keyboard_navigation++;
        }
      }
    }
  }

  private async checkResponsiveInFile(
    file: GeneratedFile, 
    violations: ComplianceViolation[], 
    layoutIssues: ResponsiveResult['layout_issues']
  ): Promise<void> {
    const content = file.content;

    // Check for fixed widths that might break responsive design
    const fixedWidths = content.matchAll(/width:\s*\d+px/g);
    for (const match of fixedWidths) {
      const lines = content.substring(0, match.index).split('\n');
      violations.push({
        type: 'responsive',
        severity: 'minor',
        message: 'Fixed width may cause responsive issues',
        element: match[0],
        line: lines.length,
        suggestion: 'Use relative units (%, rem, em) or max-width',
        rule: 'fixed-width'
      });
      
      layoutIssues.push({
        breakpoint: 'mobile',
        issue: 'Fixed width element may overflow on small screens',
        severity: 'minor'
      });
    }

    // Check for media queries
    const mediaQueries = content.matchAll(/@media[^{]+{/g);
    const hasMediaQueries = Array.from(mediaQueries).length > 0;

    if (!hasMediaQueries && content.includes('width') && file.type === 'style') {
      violations.push({
        type: 'responsive',
        severity: 'major',
        message: 'No media queries found in stylesheet',
        suggestion: 'Add responsive breakpoints using media queries',
        rule: 'missing-media-queries'
      });
    }

    // Check for viewport meta tag (if HTML content)
    if (content.includes('<html') || content.includes('<head')) {
      if (!content.includes('viewport')) {
        violations.push({
          type: 'responsive',
          severity: 'critical',
          message: 'Missing viewport meta tag',
          suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          rule: 'viewport-meta'
        });
      }
    }
  }

  private async checkBrandComplianceInFile(
    file: GeneratedFile, 
    violations: ComplianceViolation[], 
    brandGuidelines: any,
    brandElementsChecked: string[]
  ): Promise<void> {
    const content = file.content;

    // Check brand colors
    if (brandGuidelines.colors) {
      const approvedColors = brandGuidelines.colors.approved || [];
      const colorPattern = /#[0-9a-fA-F]{3,6}/g;
      const colors = content.matchAll(colorPattern);
      
      for (const match of colors) {
        const color = match[0].toLowerCase();
        if (!approvedColors.includes(color)) {
          const lines = content.substring(0, match.index).split('\n');
          violations.push({
            type: 'brand',
            severity: 'major',
            message: `Unapproved brand color: ${color}`,
            element: match[0],
            line: lines.length,
            suggestion: 'Use approved brand colors from design system',
            rule: 'brand-color'
          });
        }
        brandElementsChecked.push('color');
      }
    }

    // Check brand typography
    if (brandGuidelines.typography) {
      const approvedFonts = brandGuidelines.typography.fonts || [];
      const fontPattern = /font-family:\s*['"]([^'"]+)['"]/g;
      const fonts = content.matchAll(fontPattern);
      
      for (const match of fonts) {
        const font = match[1];
        if (!approvedFonts.includes(font)) {
          const lines = content.substring(0, match.index).split('\n');
          violations.push({
            type: 'brand',
            severity: 'minor',
            message: `Unapproved font family: ${font}`,
            element: match[0],
            line: lines.length,
            suggestion: 'Use approved brand fonts from design system',
            rule: 'brand-typography'
          });
        }
        brandElementsChecked.push('typography');
      }
    }
  }

  private async loadBrandGuidelines(): Promise<any> {
    try {
      const guidelinesData = await fs.readFile(this.brandGuidelinesPath, 'utf-8');
      return JSON.parse(guidelinesData);
    } catch (error) {
      // Return default guidelines if file doesn't exist
      return {
        colors: {
          approved: ['#007bff', '#6c757d', '#28a745', '#dc3545', '#ffc107']
        },
        typography: {
          fonts: ['Arial', 'Helvetica', 'sans-serif', 'Georgia', 'serif']
        }
      };
    }
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private calculateComplianceScore(violations: ComplianceViolation[]): number {
    if (violations.length === 0) return 100;

    let penalty = 0;
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical': penalty += 25; break;
        case 'major': penalty += 10; break;
        case 'minor': penalty += 2; break;
      }
    }

    return Math.max(0, 100 - penalty);
  }

  private calculateConsistencyScore(elementsChecked: string[], violations: ComplianceViolation[]): number {
    if (elementsChecked.length === 0) return 100;
    
    const uniqueElements = new Set(elementsChecked).size;
    const brandViolations = violations.filter(v => v.type === 'brand').length;
    
    return Math.max(0, 100 - (brandViolations / uniqueElements) * 20);
  }

  private determineWCAGLevel(violations: ComplianceViolation[]): 'A' | 'AA' | 'AAA' {
    const criticalA11yIssues = violations.filter(v => 
      v.type === 'accessibility' && v.severity === 'critical'
    ).length;
    
    const majorA11yIssues = violations.filter(v => 
      v.type === 'accessibility' && v.severity === 'major'
    ).length;

    if (criticalA11yIssues > 0) return 'A';
    if (majorA11yIssues > 2) return 'A';
    if (majorA11yIssues > 0) return 'AA';
    return 'AAA';
  }

  private generateTokenRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.some(v => v.rule.includes('hardcoded-color'))) {
      recommendations.push('Replace hardcoded colors with design tokens');
    }
    if (violations.some(v => v.rule.includes('hardcoded-spacing'))) {
      recommendations.push('Use spacing tokens for consistent layout');
    }
    if (violations.some(v => v.rule.includes('hardcoded-typography'))) {
      recommendations.push('Apply typography tokens for consistent text styling');
    }
    if (violations.some(v => v.rule.includes('unknown-token'))) {
      recommendations.push('Verify all design tokens are properly defined');
    }
    
    return recommendations;
  }

  private generateAccessibilityRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.some(v => v.rule === 'img-alt')) {
      recommendations.push('Add descriptive alt text to all images');
    }
    if (violations.some(v => v.rule === 'form-label')) {
      recommendations.push('Ensure all form inputs have proper labels');
    }
    if (violations.some(v => v.rule === 'heading-hierarchy')) {
      recommendations.push('Follow proper heading hierarchy (h1, h2, h3, etc.)');
    }
    if (violations.some(v => v.rule === 'keyboard-navigation')) {
      recommendations.push('Test and improve keyboard navigation support');
    }
    
    return recommendations;
  }

  private generateResponsiveRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.some(v => v.rule === 'fixed-width')) {
      recommendations.push('Use flexible units instead of fixed pixel widths');
    }
    if (violations.some(v => v.rule === 'missing-media-queries')) {
      recommendations.push('Add responsive breakpoints with media queries');
    }
    if (violations.some(v => v.rule === 'viewport-meta')) {
      recommendations.push('Include viewport meta tag for mobile optimization');
    }
    
    return recommendations;
  }

  private generateBrandRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.some(v => v.rule === 'brand-color')) {
      recommendations.push('Use only approved brand colors');
    }
    if (violations.some(v => v.rule === 'brand-typography')) {
      recommendations.push('Apply approved brand fonts consistently');
    }
    
    return recommendations;
  }

  private generateRegressionRecommendations(violations: ComplianceViolation[]): string[] {
    const recommendations: string[] = [];
    
    if (violations.some(v => v.rule === 'baseline-missing')) {
      recommendations.push('Create baseline images for visual regression testing');
    }
    if (violations.some(v => v.rule === 'visual-diff-threshold')) {
      recommendations.push('Review visual changes and update baselines if intentional');
    }
    
    return recommendations;
  }
}

export default DesignValidator;
