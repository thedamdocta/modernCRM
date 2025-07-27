import React, { useState, useRef, useEffect } from 'react';
import { PluginConfig } from '../types';

interface PromptInputWidgetProps {
  config: PluginConfig;
  onPromptSubmit?: (prompt: string, options: PromptOptions) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

interface PromptOptions {
  moduleType: string;
  targetEntity?: string;
  includeDataBinding: boolean;
  generateTests: boolean;
  outputFormat: 'component' | 'page' | 'widget';
}

interface PromptSuggestion {
  id: string;
  title: string;
  prompt: string;
  moduleType: string;
  description: string;
  tags: string[];
}

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: 'idx-listing',
    title: 'IDX Real Estate Listing Page',
    prompt: 'Create an IDX listing page with property search, filters, and lead capture form integrated with CRM contacts',
    moduleType: 'page',
    description: 'Real estate listing page with MLS integration',
    tags: ['real-estate', 'listings', 'forms', 'crm-integration']
  },
  {
    id: 'lead-capture',
    title: 'Lead Capture Landing Page',
    prompt: 'Build a conversion-optimized landing page with lead capture form that creates new contacts in CRM',
    moduleType: 'page',
    description: 'High-converting landing page with CRM integration',
    tags: ['marketing', 'forms', 'conversion', 'crm-integration']
  },
  {
    id: 'contact-dashboard',
    title: 'Contact Management Dashboard',
    prompt: 'Create a contact management dashboard widget with recent activity, notes, and quick actions',
    moduleType: 'widget',
    description: 'Dashboard widget for contact management',
    tags: ['dashboard', 'contacts', 'management', 'widgets']
  },
  {
    id: 'appointment-booking',
    title: 'Appointment Booking System',
    prompt: 'Build an appointment booking component with calendar integration and automatic CRM opportunity creation',
    moduleType: 'component',
    description: 'Booking system with calendar and CRM integration',
    tags: ['scheduling', 'calendar', 'appointments', 'crm-integration']
  },
  {
    id: 'email-template',
    title: 'Email Campaign Template',
    prompt: 'Design a responsive email template for marketing campaigns with CRM contact segmentation',
    moduleType: 'component',
    description: 'Email template with segmentation features',
    tags: ['email', 'marketing', 'templates', 'segmentation']
  }
];

export const PromptInputWidget: React.FC<PromptInputWidgetProps> = ({
  config,
  onPromptSubmit,
  onClose,
  isLoading = false
}) => {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<PromptOptions>({
    moduleType: 'page',
    targetEntity: 'Contact',
    includeDataBinding: true,
    generateTests: false,
    outputFormat: 'page'
  });
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    setSelectedSuggestion(null);
    if (value.length > 0) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: PromptSuggestion) => {
    setPrompt(suggestion.prompt);
    setSelectedSuggestion(suggestion.id);
    setOptions(prev => ({
      ...prev,
      moduleType: suggestion.moduleType as any,
      outputFormat: suggestion.moduleType as any
    }));
    setShowSuggestions(false);
    setIsExpanded(true);
  };

  const handleSubmit = () => {
    if (prompt.trim() && onPromptSubmit) {
      onPromptSubmit(prompt.trim(), options);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = prompt.trim().length > 10 && !isLoading;

  return (
    <div className="prompt-input-widget">
      <div className="widget-header">
        <div className="header-content">
          <h2>AI Website Builder</h2>
          <p>Describe what you want to build and AI will generate it for you</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-button" aria-label="Close">
            ×
          </button>
        )}
      </div>

      <div className="widget-content">
        {showSuggestions && (
          <div className="suggestions-section">
            <h3>Popular Templates</h3>
            <div className="suggestions-grid">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`suggestion-card ${selectedSuggestion === suggestion.id ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-header">
                    <h4>{suggestion.title}</h4>
                    <span className="module-type">{suggestion.moduleType}</span>
                  </div>
                  <p className="suggestion-description">{suggestion.description}</p>
                  <div className="suggestion-tags">
                    {suggestion.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="prompt-section">
          <div className="prompt-input-container">
            <label htmlFor="prompt-input" className="prompt-label">
              Describe your website or component
            </label>
            <textarea
              ref={textareaRef}
              id="prompt-input"
              className="prompt-input"
              placeholder="Example: Create a real estate listing page with property search, image gallery, and contact form that integrates with our CRM..."
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={3}
            />
            <div className="input-footer">
              <span className="char-count">
                {prompt.length} characters
              </span>
              <span className="keyboard-hint">
                Press ⌘+Enter to generate
              </span>
            </div>
          </div>

          {(prompt.length > 0 || isExpanded) && (
            <div className="options-section">
              <h4>Generation Options</h4>
              <div className="options-grid">
                <div className="option-group">
                  <label htmlFor="module-type">Output Type</label>
                  <select
                    id="module-type"
                    value={options.outputFormat}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      outputFormat: e.target.value as any,
                      moduleType: e.target.value
                    }))}
                    disabled={isLoading}
                  >
                    <option value="page">Full Page</option>
                    <option value="component">Component</option>
                    <option value="widget">Dashboard Widget</option>
                  </select>
                </div>

                <div className="option-group">
                  <label htmlFor="target-entity">CRM Entity</label>
                  <select
                    id="target-entity"
                    value={options.targetEntity || ''}
                    onChange={(e) => setOptions(prev => ({
                      ...prev,
                      targetEntity: e.target.value || undefined
                    }))}
                    disabled={isLoading}
                  >
                    <option value="">None</option>
                    <option value="Contact">Contact</option>
                    <option value="Account">Account</option>
                    <option value="Opportunity">Opportunity</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>

                <div className="option-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={options.includeDataBinding}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        includeDataBinding: e.target.checked
                      }))}
                      disabled={isLoading}
                    />
                    <span>Include CRM Data Binding</span>
                  </label>
                </div>

                <div className="option-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={options.generateTests}
                      onChange={(e) => setOptions(prev => ({
                        ...prev,
                        generateTests: e.target.checked
                      }))}
                      disabled={isLoading}
                    />
                    <span>Generate Tests</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="action-section">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`generate-button ${canSubmit ? 'primary' : 'disabled'}`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className="ai-icon">✨</span>
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .prompt-input-widget {
          background: var(--twenty-color-gray-0);
          border-radius: var(--twenty-border-radius-lg);
          box-shadow: var(--twenty-shadow-xl);
          max-width: 800px;
          margin: 0 auto;
          font-family: var(--twenty-font-family);
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: var(--twenty-spacing-6);
          border-bottom: 1px solid var(--twenty-color-gray-20);
        }

        .header-content h2 {
          margin: 0 0 var(--twenty-spacing-2) 0;
          font-size: var(--twenty-font-size-xl);
          font-weight: var(--twenty-font-weight-semibold);
          color: var(--twenty-color-gray-90);
        }

        .header-content p {
          margin: 0;
          font-size: var(--twenty-font-size-sm);
          color: var(--twenty-color-gray-70);
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          color: var(--twenty-color-gray-50);
          cursor: pointer;
          padding: var(--twenty-spacing-1);
          border-radius: var(--twenty-border-radius-sm);
        }

        .close-button:hover {
          background: var(--twenty-color-gray-10);
          color: var(--twenty-color-gray-70);
        }

        .widget-content {
          padding: var(--twenty-spacing-6);
        }

        .suggestions-section {
          margin-bottom: var(--twenty-spacing-8);
        }

        .suggestions-section h3 {
          margin: 0 0 var(--twenty-spacing-4) 0;
          font-size: var(--twenty-font-size-lg);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }

        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--twenty-spacing-4);
        }

        .suggestion-card {
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-md);
          padding: var(--twenty-spacing-4);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .suggestion-card:hover {
          border-color: var(--twenty-color-blue-60);
          box-shadow: var(--twenty-shadow-sm);
        }

        .suggestion-card.selected {
          border-color: var(--twenty-color-blue-60);
          background: var(--twenty-color-blue-60)08;
        }

        .suggestion-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--twenty-spacing-2);
        }

        .suggestion-header h4 {
          margin: 0;
          font-size: var(--twenty-font-size-base);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }

        .module-type {
          background: var(--twenty-color-gray-10);
          color: var(--twenty-color-gray-70);
          padding: var(--twenty-spacing-1) var(--twenty-spacing-2);
          border-radius: var(--twenty-border-radius-sm);
          font-size: var(--twenty-font-size-xs);
          font-weight: var(--twenty-font-weight-medium);
        }

        .suggestion-description {
          margin: 0 0 var(--twenty-spacing-3) 0;
          font-size: var(--twenty-font-size-sm);
          color: var(--twenty-color-gray-70);
          line-height: 1.4;
        }

        .suggestion-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--twenty-spacing-1);
        }

        .tag {
          background: var(--twenty-color-gray-10);
          color: var(--twenty-color-gray-60);
          padding: 2px var(--twenty-spacing-2);
          border-radius: var(--twenty-border-radius-sm);
          font-size: var(--twenty-font-size-xs);
        }

        .prompt-section {
          space-y: var(--twenty-spacing-6);
        }

        .prompt-input-container {
          margin-bottom: var(--twenty-spacing-6);
        }

        .prompt-label {
          display: block;
          margin-bottom: var(--twenty-spacing-2);
          font-size: var(--twenty-font-size-sm);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }

        .prompt-input {
          width: 100%;
          min-height: 120px;
          padding: var(--twenty-spacing-3);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-md);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-base);
          line-height: 1.5;
          resize: none;
          transition: border-color 0.2s ease;
        }

        .prompt-input:focus {
          outline: none;
          border-color: var(--twenty-color-blue-60);
          box-shadow: 0 0 0 3px var(--twenty-color-blue-60)20;
        }

        .prompt-input:disabled {
          background: var(--twenty-color-gray-10);
          color: var(--twenty-color-gray-50);
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: var(--twenty-spacing-2);
          font-size: var(--twenty-font-size-xs);
          color: var(--twenty-color-gray-50);
        }

        .options-section {
          margin-bottom: var(--twenty-spacing-6);
          padding: var(--twenty-spacing-4);
          background: var(--twenty-color-gray-10);
          border-radius: var(--twenty-border-radius-md);
        }

        .options-section h4 {
          margin: 0 0 var(--twenty-spacing-4) 0;
          font-size: var(--twenty-font-size-base);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--twenty-spacing-4);
        }

        .option-group label {
          display: block;
          margin-bottom: var(--twenty-spacing-1);
          font-size: var(--twenty-font-size-sm);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }

        .option-group select {
          width: 100%;
          padding: var(--twenty-spacing-2);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-sm);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-sm);
          background: var(--twenty-color-gray-0);
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          margin: 0 !important;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: var(--twenty-spacing-2);
        }

        .action-section {
          display: flex;
          justify-content: center;
        }

        .generate-button {
          display: flex;
          align-items: center;
          gap: var(--twenty-spacing-2);
          padding: var(--twenty-spacing-3) var(--twenty-spacing-6);
          border: none;
          border-radius: var(--twenty-border-radius-md);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-base);
          font-weight: var(--twenty-font-weight-medium);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .generate-button.primary {
          background: var(--twenty-color-blue-60);
          color: var(--twenty-color-gray-0);
        }

        .generate-button.primary:hover {
          background: var(--twenty-color-blue-70);
          transform: translateY(-1px);
          box-shadow: var(--twenty-shadow-md);
        }

        .generate-button.disabled {
          background: var(--twenty-color-gray-20);
          color: var(--twenty-color-gray-50);
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .ai-icon {
          font-size: var(--twenty-font-size-lg);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .suggestions-grid {
            grid-template-columns: 1fr;
          }
          
          .options-grid {
            grid-template-columns: 1fr;
          }
          
          .widget-header {
            padding: var(--twenty-spacing-4);
          }
          
          .widget-content {
            padding: var(--twenty-spacing-4);
          }
        }
      `}</style>
    </div>
  );
};

export default PromptInputWidget;
