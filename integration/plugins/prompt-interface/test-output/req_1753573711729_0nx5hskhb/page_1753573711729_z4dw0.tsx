import React from 'react';

interface GeneratedComponentProps {
  title?: string;
}

export const GeneratedComponent: React.FC<GeneratedComponentProps> = ({ title = 'Generated Component' }) => {
  return (
    <div className="generated-component">
      <h2>{title}</h2>
      <p>This is a generated component based on your prompt.</p>
      
      <style jsx>{`
        .generated-component {
          padding: var(--twenty-spacing-6);
          background: var(--twenty-color-gray-0);
          border-radius: var(--twenty-border-radius-md);
          border: 1px solid var(--twenty-color-gray-20);
        }
        
        .generated-component h2 {
          color: var(--twenty-color-gray-90);
          font-size: var(--twenty-font-size-lg);
          margin-bottom: var(--twenty-spacing-4);
        }
        
        .generated-component p {
          color: var(--twenty-color-gray-70);
          font-size: var(--twenty-font-size-base);
        }
      `}</style>
    </div>
  );
};

export default GeneratedComponent;