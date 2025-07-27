import React, { useEffect, useState, useRef } from 'react';
import { PluginConfig } from '../types';

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
      <div className="webstudio-error">
        <div className="error-container">
          <h3>Webstudio Integration Error</h3>
          <p>{error}</p>
          <button onClick={handleClose} className="btn btn-secondary">
            Close
          </button>
        </div>
        <style jsx>{`
          .webstudio-error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: var(--ws-color-background);
            color: var(--ws-color-text-primary);
          }
          .error-container {
            text-align: center;
            padding: var(--ws-spacing-8);
            border: 1px solid var(--ws-color-border);
            border-radius: var(--ws-border-radius-lg);
            background: var(--ws-color-background);
            box-shadow: var(--ws-shadow-lg);
          }
          .error-container h3 {
            margin-bottom: var(--ws-spacing-4);
            color: var(--ws-color-error);
          }
          .error-container p {
            margin-bottom: var(--ws-spacing-6);
            color: var(--ws-color-text-secondary);
          }
          .btn {
            padding: var(--ws-spacing-2) var(--ws-spacing-4);
            border: none;
            border-radius: var(--ws-border-radius-md);
            cursor: pointer;
            font-family: var(--ws-font-family-primary);
            font-size: var(--ws-font-size-sm);
          }
          .btn-secondary {
            background: var(--ws-color-gray-600);
            color: var(--ws-color-background);
          }
          .btn-secondary:hover {
            background: var(--ws-color-primary-700);
          }
        `}</style>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="webstudio-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Webstudio Builder...</p>
        </div>
        <style jsx>{`
          .webstudio-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: var(--ws-color-background);
            color: var(--ws-color-text-primary);
          }
          .loading-container {
            text-align: center;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--ws-color-border);
            border-top: 3px solid var(--ws-color-primary-600);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto var(--ws-spacing-4);
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-container p {
            color: var(--ws-color-text-secondary);
            font-family: var(--ws-font-family-primary);
            font-size: var(--ws-font-size-base);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="webstudio-integration">
      <div 
        ref={containerRef} 
        className="webstudio-container"
        style={{
          width: '100%',
          height: '100vh',
          position: 'relative',
        }}
      />
      <style jsx>{`
        .webstudio-integration {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: var(--ws-color-background);
        }
        .webstudio-container {
          font-family: var(--ws-font-family-primary);
        }
      `}</style>
    </div>
  );
};

export default WebstudioIntegration;
