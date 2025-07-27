import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation Interfaces
export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  column?: number;
  rule?: string;
  severity: 'critical' | 'major' | 'minor';
}

export interface QAValidationResult {
  stage: 'syntax' | 'types' | 'security' | 'performance' | 'dependencies';
  status: 'pass' | 'warning' | 'error';
  issues: ValidationIssue[];
  score: number; // 0-100
  suggestions: string[];
  execution_time_ms: number;
}

export interface ValidationReport {
  overall_score: number;
  overall_status: 'pass' | 'warning' | 'error';
  stages: QAValidationResult[];
  summary: {
    total_issues: number;
    critical_issues: number;
    warnings: number;
    passed_checks: number;
  };
  recommendations: string[];
  timestamp: Date;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'test';
}

// Validation Pipeline Class
export class ValidationEngine {
  private tempDir: string;
  private eslintConfigPath: string;
  private tsconfigPath: string;

  constructor(tempDir: string = './integration/plugins/qa-pipeline/temp') {
    this.tempDir = tempDir;
    this.eslintConfigPath = path.join(__dirname, '../.eslintrc.js');
    this.tsconfigPath = path.join(__dirname, '../tsconfig.json');
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log('✅ QA Validation Engine initialized');
    } catch (error) {
      console.error('❌ Failed to initialize QA Validation Engine:', error);
      throw error;
    }
  }

  // Main validation pipeline
  async validateFiles(files: GeneratedFile[]): Promise<ValidationReport> {
    const startTime = Date.now();
    const stages: QAValidationResult[] = [];

    try {
      // Write files to temp directory for validation
      const tempFiles = await this.writeFilesToTemp(files);

      // Run validation stages in parallel where possible
      const [syntaxResult, typesResult, securityResult] = await Promise.all([
        this.runSyntaxValidation(tempFiles),
        this.runTypeChecking(tempFiles),
        this.runSecurityScan(tempFiles)
      ]);

      stages.push(syntaxResult, typesResult, securityResult);

      // Run performance and dependency checks sequentially
      const performanceResult = await this.runPerformanceAnalysis(tempFiles);
      const dependencyResult = await this.runDependencyCheck(files);

      stages.push(performanceResult, dependencyResult);

      // Calculate overall score and status
      const overallScore = this.calculateOverallScore(stages);
      const overallStatus = this.determineOverallStatus(stages);

      // Generate summary
      const summary = this.generateSummary(stages);
      const recommendations = this.generateRecommendations(stages);

      // Cleanup temp files
      await this.cleanupTempFiles();

      return {
        overall_score: overallScore,
        overall_status: overallStatus,
        stages,
        summary,
        recommendations,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Validation pipeline failed:', error);
      throw error;
    }
  }

  // Syntax validation using ESLint
  async runSyntaxValidation(files: string[]): Promise<QAValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    try {
      for (const filePath of files) {
        if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
          try {
            const { stdout, stderr } = await execAsync(`npx eslint "${filePath}" --format json`, {
              cwd: path.dirname(this.eslintConfigPath)
            });

            if (stdout) {
              const eslintResults = JSON.parse(stdout);
              for (const result of eslintResults) {
                for (const message of result.messages) {
                  issues.push({
                    type: message.severity === 2 ? 'error' : 'warning',
                    message: message.message,
                    line: message.line,
                    column: message.column,
                    rule: message.ruleId,
                    severity: message.severity === 2 ? 'major' : 'minor'
                  });
                }
              }
            }
          } catch (eslintError) {
            // ESLint errors are captured in the JSON output
            if (eslintError.stdout) {
              const eslintResults = JSON.parse(eslintError.stdout);
              for (const result of eslintResults) {
                for (const message of result.messages) {
                  issues.push({
                    type: 'error',
                    message: message.message,
                    line: message.line,
                    column: message.column,
                    rule: message.ruleId,
                    severity: 'critical'
                  });
                }
              }
            }
          }
        }
      }

      const score = this.calculateStageScore(issues);
      const status = issues.some(i => i.type === 'error') ? 'error' : 
                    issues.some(i => i.type === 'warning') ? 'warning' : 'pass';

      return {
        stage: 'syntax',
        status,
        issues,
        score,
        suggestions: this.generateSyntaxSuggestions(issues),
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage: 'syntax',
        status: 'error',
        issues: [{
          type: 'error',
          message: `Syntax validation failed: ${error.message}`,
          severity: 'critical'
        }],
        score: 0,
        suggestions: ['Fix syntax validation setup'],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  // TypeScript type checking
  async runTypeChecking(files: string[]): Promise<QAValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    try {
      const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
      
      if (tsFiles.length > 0) {
        try {
          const { stdout, stderr } = await execAsync(`npx tsc --noEmit --project "${this.tsconfigPath}"`, {
            cwd: path.dirname(this.tsconfigPath)
          });

          // TypeScript errors go to stderr
          if (stderr) {
            const lines = stderr.split('\n');
            for (const line of lines) {
              if (line.includes('error TS')) {
                const match = line.match(/(.+)\((\d+),(\d+)\): error TS(\d+): (.+)/);
                if (match) {
                  issues.push({
                    type: 'error',
                    message: match[5],
                    line: parseInt(match[2]),
                    column: parseInt(match[3]),
                    rule: `TS${match[4]}`,
                    severity: 'major'
                  });
                }
              }
            }
          }
        } catch (tscError) {
          // TypeScript compilation errors
          if (tscError.stderr) {
            issues.push({
              type: 'error',
              message: 'TypeScript compilation failed',
              severity: 'critical'
            });
          }
        }
      }

      const score = this.calculateStageScore(issues);
      const status = issues.some(i => i.type === 'error') ? 'error' : 'pass';

      return {
        stage: 'types',
        status,
        issues,
        score,
        suggestions: this.generateTypeSuggestions(issues),
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage: 'types',
        status: 'error',
        issues: [{
          type: 'error',
          message: `Type checking failed: ${error.message}`,
          severity: 'critical'
        }],
        score: 0,
        suggestions: ['Fix TypeScript configuration'],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  // Security vulnerability scanning
  async runSecurityScan(files: string[]): Promise<QAValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    try {
      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check for common security issues
        const securityChecks = [
          {
            pattern: /eval\s*\(/g,
            message: 'Use of eval() is dangerous and should be avoided',
            severity: 'critical' as const
          },
          {
            pattern: /innerHTML\s*=/g,
            message: 'Direct innerHTML assignment can lead to XSS vulnerabilities',
            severity: 'major' as const
          },
          {
            pattern: /document\.write\s*\(/g,
            message: 'document.write() can be dangerous and should be avoided',
            severity: 'major' as const
          },
          {
            pattern: /dangerouslySetInnerHTML/g,
            message: 'dangerouslySetInnerHTML should be used with caution',
            severity: 'minor' as const
          },
          {
            pattern: /localStorage\.|sessionStorage\./g,
            message: 'Storage APIs should sanitize data to prevent XSS',
            severity: 'minor' as const
          }
        ];

        for (const check of securityChecks) {
          const matches = content.matchAll(check.pattern);
          for (const match of matches) {
            const lines = content.substring(0, match.index).split('\n');
            issues.push({
              type: check.severity === 'critical' ? 'error' : 'warning',
              message: check.message,
              line: lines.length,
              severity: check.severity
            });
          }
        }
      }

      const score = this.calculateStageScore(issues);
      const status = issues.some(i => i.type === 'error') ? 'error' : 
                    issues.some(i => i.type === 'warning') ? 'warning' : 'pass';

      return {
        stage: 'security',
        status,
        issues,
        score,
        suggestions: this.generateSecuritySuggestions(issues),
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage: 'security',
        status: 'error',
        issues: [{
          type: 'error',
          message: `Security scan failed: ${error.message}`,
          severity: 'critical'
        }],
        score: 0,
        suggestions: ['Review security scanning setup'],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  // Performance analysis
  async runPerformanceAnalysis(files: string[]): Promise<QAValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    try {
      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);

        // File size check
        if (stats.size > 100000) { // 100KB
          issues.push({
            type: 'warning',
            message: `Large file size (${Math.round(stats.size / 1024)}KB). Consider code splitting.`,
            severity: 'minor'
          });
        }

        // Performance anti-patterns
        const performanceChecks = [
          {
            pattern: /console\.log\s*\(/g,
            message: 'Console.log statements should be removed in production',
            severity: 'minor' as const
          },
          {
            pattern: /for\s*\(\s*let\s+\w+\s*=\s*0.*\.length/g,
            message: 'Consider caching array length in loops for better performance',
            severity: 'minor' as const
          },
          {
            pattern: /document\.getElementById\s*\(/g,
            message: 'Frequent DOM queries can impact performance',
            severity: 'minor' as const
          }
        ];

        for (const check of performanceChecks) {
          const matches = content.matchAll(check.pattern);
          for (const match of matches) {
            const lines = content.substring(0, match.index).split('\n');
            issues.push({
              type: 'warning',
              message: check.message,
              line: lines.length,
              severity: check.severity
            });
          }
        }
      }

      const score = this.calculateStageScore(issues);
      const status = issues.length > 0 ? 'warning' : 'pass';

      return {
        stage: 'performance',
        status,
        issues,
        score,
        suggestions: this.generatePerformanceSuggestions(issues),
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage: 'performance',
        status: 'error',
        issues: [{
          type: 'error',
          message: `Performance analysis failed: ${error.message}`,
          severity: 'critical'
        }],
        score: 0,
        suggestions: ['Review performance analysis setup'],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  // Dependency validation
  async runDependencyCheck(files: GeneratedFile[]): Promise<QAValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];

    try {
      const dependencies = new Set<string>();
      
      // Extract import statements
      for (const file of files) {
        const importMatches = file.content.matchAll(/import.*from\s+['"]([^'"]+)['"]/g);
        for (const match of importMatches) {
          dependencies.add(match[1]);
        }
      }

      // Check for potentially problematic dependencies
      const problematicDeps = [
        'lodash', // Suggest lodash-es for better tree shaking
        'moment', // Suggest date-fns or dayjs for smaller bundle
        'jquery' // Generally not needed in modern React apps
      ];

      for (const dep of dependencies) {
        if (problematicDeps.includes(dep)) {
          issues.push({
            type: 'warning',
            message: `Consider alternatives to ${dep} for better performance`,
            severity: 'minor'
          });
        }

        // Check for relative imports going up too many levels
        if (dep.startsWith('../../../')) {
          issues.push({
            type: 'warning',
            message: 'Deep relative imports may indicate architectural issues',
            severity: 'minor'
          });
        }
      }

      const score = this.calculateStageScore(issues);
      const status = issues.length > 0 ? 'warning' : 'pass';

      return {
        stage: 'dependencies',
        status,
        issues,
        score,
        suggestions: this.generateDependencySuggestions(Array.from(dependencies)),
        execution_time_ms: Date.now() - startTime
      };

    } catch (error) {
      return {
        stage: 'dependencies',
        status: 'error',
        issues: [{
          type: 'error',
          message: `Dependency check failed: ${error.message}`,
          severity: 'critical'
        }],
        score: 0,
        suggestions: ['Review dependency analysis'],
        execution_time_ms: Date.now() - startTime
      };
    }
  }

  // Helper methods
  private async writeFilesToTemp(files: GeneratedFile[]): Promise<string[]> {
    const tempFiles: string[] = [];

    for (const file of files) {
      const tempFilePath = path.join(this.tempDir, file.path);
      const tempFileDir = path.dirname(tempFilePath);
      
      await fs.mkdir(tempFileDir, { recursive: true });
      await fs.writeFile(tempFilePath, file.content);
      tempFiles.push(tempFilePath);
    }

    return tempFiles;
  }

  private async cleanupTempFiles(): Promise<void> {
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }
  }

  private calculateStageScore(issues: ValidationIssue[]): number {
    if (issues.length === 0) return 100;

    let penalty = 0;
    for (const issue of issues) {
      switch (issue.severity) {
        case 'critical': penalty += 25; break;
        case 'major': penalty += 10; break;
        case 'minor': penalty += 2; break;
      }
    }

    return Math.max(0, 100 - penalty);
  }

  private calculateOverallScore(stages: QAValidationResult[]): number {
    const totalScore = stages.reduce((sum, stage) => sum + stage.score, 0);
    return Math.round(totalScore / stages.length);
  }

  private determineOverallStatus(stages: QAValidationResult[]): 'pass' | 'warning' | 'error' {
    if (stages.some(stage => stage.status === 'error')) return 'error';
    if (stages.some(stage => stage.status === 'warning')) return 'warning';
    return 'pass';
  }

  private generateSummary(stages: QAValidationResult[]) {
    const allIssues = stages.flatMap(stage => stage.issues);
    return {
      total_issues: allIssues.length,
      critical_issues: allIssues.filter(i => i.severity === 'critical').length,
      warnings: allIssues.filter(i => i.type === 'warning').length,
      passed_checks: stages.filter(s => s.status === 'pass').length
    };
  }

  private generateRecommendations(stages: QAValidationResult[]): string[] {
    const recommendations: string[] = [];
    
    for (const stage of stages) {
      if (stage.status !== 'pass') {
        recommendations.push(`Improve ${stage.stage} validation (Score: ${stage.score}/100)`);
      }
    }

    return recommendations;
  }

  private generateSyntaxSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    if (issues.some(i => i.rule?.includes('no-unused-vars'))) {
      suggestions.push('Remove unused variables to clean up code');
    }
    if (issues.some(i => i.rule?.includes('no-console'))) {
      suggestions.push('Remove console statements for production');
    }
    
    return suggestions;
  }

  private generateTypeSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    if (issues.length > 0) {
      suggestions.push('Add proper TypeScript types for better type safety');
      suggestions.push('Consider using strict mode in TypeScript configuration');
    }
    
    return suggestions;
  }

  private generateSecuritySuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    if (issues.some(i => i.message.includes('eval'))) {
      suggestions.push('Replace eval() with safer alternatives');
    }
    if (issues.some(i => i.message.includes('innerHTML'))) {
      suggestions.push('Use textContent or proper React rendering instead of innerHTML');
    }
    
    return suggestions;
  }

  private generatePerformanceSuggestions(issues: ValidationIssue[]): string[] {
    const suggestions: string[] = [];
    
    if (issues.some(i => i.message.includes('Large file'))) {
      suggestions.push('Consider code splitting for large files');
    }
    if (issues.some(i => i.message.includes('console.log'))) {
      suggestions.push('Remove debug statements for production');
    }
    
    return suggestions;
  }

  private generateDependencySuggestions(dependencies: string[]): string[] {
    const suggestions: string[] = [];
    
    if (dependencies.includes('lodash')) {
      suggestions.push('Consider lodash-es for better tree shaking');
    }
    if (dependencies.includes('moment')) {
      suggestions.push('Consider date-fns or dayjs for smaller bundle size');
    }
    
    return suggestions;
  }
}

export default ValidationEngine;
