import React, { useState, useRef, useEffect } from 'react';
import { PluginConfig } from '../types';
import styles from './prompt-input-widget.module.css';

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
    <div className={styles.promptInputWidget}>
      <div className={styles.widgetHeader}>
        <div className={styles.headerContent}>
          <h2>AI Website Builder</h2>
          <p>Describe what you want to build and AI will generate it for you</p>
        </div>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            ×
          </button>
        )}
      </div>

      <div className={styles.widgetContent}>
        {showSuggestions && (
          <div className={styles.suggestionsSection}>
            <h3>Popular Templates</h3>
            <div className={styles.suggestionsGrid}>
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className={`${styles.suggestionCard} ${selectedSuggestion === suggestion.id ? styles.selected : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className={styles.suggestionHeader}>
                    <h4>{suggestion.title}</h4>
                    <span className={styles.moduleType}>{suggestion.moduleType}</span>
                  </div>
                  <p className={styles.suggestionDescription}>{suggestion.description}</p>
                  <div className={styles.suggestionTags}>
                    {suggestion.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.promptSection}>
          <div className={styles.promptInputContainer}>
            <label htmlFor="prompt-input" className={styles.promptLabel}>
              Describe your website or component
            </label>
            <textarea
              ref={textareaRef}
              id="prompt-input"
              className={styles.promptInput}
              placeholder="Example: Create a real estate listing page with property search, image gallery, and contact form that integrates with our CRM..."
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={3}
            />
            <div className={styles.inputFooter}>
              <span className={styles.charCount}>
                {prompt.length} characters
              </span>
              <span className={styles.keyboardHint}>
                Press ⌘+Enter to generate
              </span>
            </div>
          </div>

          {(prompt.length > 0 || isExpanded) && (
            <div className={styles.optionsSection}>
              <h4>Generation Options</h4>
              <div className={styles.optionsGrid}>
                <div className={styles.optionGroup}>
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

                <div className={styles.optionGroup}>
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

                <div className={`${styles.optionGroup} ${styles.checkboxGroup}`}>
                  <label className={styles.checkboxLabel}>
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

                <div className={`${styles.optionGroup} ${styles.checkboxGroup}`}>
                  <label className={styles.checkboxLabel}>
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

          <div className={styles.actionSection}>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`${styles.generateButton} ${canSubmit ? styles.primary : styles.disabled}`}
            >
              {isLoading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Generating...
                </>
              ) : (
                <>
                  <span className={styles.aiIcon}>✨</span>
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PromptInputWidget;
