import React, { useEffect, useState, useRef } from 'react';
import { PluginConfig } from '../types';
import styles from './webstudio-integration.module.css';

interface WebstudioIntegrationProps {
  config: PluginConfig;
  onSave?: (data: any) => void;
  onClose?: () => void;
  initialData?: any;
}

interface WebstudioInstance {
  init: (container: HTMLElement, config: any) => void;
  destroy: () => void;
  getData: () => any;
  setData: (data: any) => void;
  on: (event: string, callback: Function) => void;
}

declare global {
  interface Window {
    Webstudio: {
      create: (config: any) => WebstudioInstance;
    };
  }
}

export const WebstudioIntegration: React.FC<WebstudioIntegrationProps> = ({
  config,
  onSave,
  onClose,
  initialData
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webstudioRef = useRef<WebstudioInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWebstudio = async () => {
      try {
        // Load Webstudio CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = '/webstudio/dist/webstudio.css';
        document.head.appendChild(cssLink);

        // Load design tokens
        const tokensCssLink = document.createElement('link');
        tokensCssLink.rel = 'stylesheet';
        tokensCssLink.href = '/integration/shared-tokens/webstudio-tokens.css';
        document.head.appendChild(tokensCssLink);

        // Load Webstudio JavaScript
        const script = document.createElement('script');
        script.src = '/webstudio/dist/webstudio.js';
        script.onload = () => {
          initializeWebstudio();
        };
        script.onerror = () => {
          setError('Failed to load Webstudio');
          setIsLoading(false);
        };
        document.head.appendChild(script);

      } catch (err) {
        setError('Failed to initialize Webstudio');
        setIsLoading(false);
      }
    };

    const initializeWebstudio = () => {
      if (!containerRef.current || !window.Webstudio) {
        setError('Webstudio container or library not available');
        setIsLoading(false);
        return;
      }

      try {
        // Create Webstudio instance with CRM integration config
        const webstudioInstance = window.Webstudio.create({
          container: containerRef.current,
          theme: 'modern-crm',
          designTokens: {
            colors: {
              primary: 'var(--ws-color-primary-600)',
              secondary: 'var(--ws-color-gray-600)',
              background: 'var(--ws-color-background)',
              text: 'var(--ws-color-text-primary)',
              border: 'var(--ws-color-border)',
            },
            typography: {
              fontFamily: 'var(--ws-font-family-primary)',
              fontSize: {
                sm: 'var(--ws-font-size-sm)',
                base: 'var(--ws-font-size-base)',
                lg: 'var(--ws-font-size-lg)',
              },
            },
            spacing: {
              sm: 'var(--ws-spacing-2)',
              md: 'var(--ws-spacing-4)',
              lg: 'var(--ws-spacing-6)',
            },
            borderRadius: {
              sm: 'var(--ws-border-radius-sm)',
              md: 'var(--ws-border-radius-md)',
              lg: 'var(--ws-border-radius-lg)',
            },
          },
          plugins: [
            'crm-data-binding',
            'ai-generation',
            'template-library'
          ],
          crmIntegration: {
            apiEndpoint: '/api/crm',
            entities: ['Contact', 'Account', 'Opportunity', 'Lead'],
            customFields: true,
            workflows: true,
          },
          aiIntegration: {
            enabled: true,
            provider: 'gemini',
            endpoint: '/api/prompt-generate',
            features: ['code-generation', 'design-suggestions', 'content-creation'],
          },
          toolbar: {
            position: 'top',
            items: [
              'undo',
              'redo',
              'separator',
              'elements',
              'styles',
              'data',
              'separator',
              'ai-assistant',
              'templates',
              'separator',
              'preview',
              'save',
              'publish'
            ],
          },
          panels: {
            left: ['elements', 'templates'],
            right: ['styles', 'data', 'ai-assistant'],
          },
          canvas: {
            responsive: true,
            breakpoints: ['mobile', 'tablet', 'desktop'],
            grid: true,
            rulers: true,
          },
        });

        // Set initial data if provided
        if (initialData) {
          webstudioInstance.setData(initialData);
        }

        // Set up event listeners
        webstudioInstance.on('save', (data: any) => {
          if (onSave) {
            onSave(data);
          }
        });

        webstudioInstance.on('close', () => {
          if (onClose) {
            onClose();
          }
        });

        webstudioInstance.on('error', (error: any) => {
          console.error('Webstudio error:', error);
          setError(error.message || 'An error occurred in Webstudio');
        });

        webstudioRef.current = webstudioInstance;
        setIsLoading(false);

      } catch (err) {
        console.error('Failed to initialize Webstudio:', err);
        setError('Failed to initialize Webstudio builder');
        setIsLoading(false);
      }
    };

    loadWebstudio();

    // Cleanup
    return () => {
      if (webstudioRef.current) {
        webstudioRef.current.destroy();
      }
    };
  }, [initialData, onSave, onClose]);

  const handleSave = () => {
    if (webstudioRef.current && onSave) {
      const data = webstudioRef.current.getData();
      onSave(data);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (error) {
    return (
      <div className={styles.errorState}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorMessage}>Webstudio Integration Error</div>
        <div className={styles.errorDetails}>{error}</div>
        <button onClick={handleClose} className={`${styles.actionButton} ${styles.primary}`}>
          Close
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading Webstudio Builder...</p>
      </div>
    );
  }

  return (
    <div className={styles.webstudioIntegration}>
      <div 
        ref={containerRef} 
        style={{
          width: '100%',
          height: '100vh',
          position: 'relative',
          fontFamily: 'var(--ws-font-family-primary)',
        }}
      />
    </div>
  );
};

export default WebstudioIntegration;
