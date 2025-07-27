import React, { useState } from 'react';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      console.log('Form submitted:', formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ContactFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange('firstName')}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange('lastName')}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={formData.message}
            onChange={handleChange('message')}
            rows={4}
            required
          />
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Send Message'}
        </button>
      </form>
      
      <style jsx>{`
        .contact-form {
          max-width: 600px;
          margin: 0 auto;
          padding: var(--twenty-spacing-6);
          background: var(--twenty-color-gray-0);
          border-radius: var(--twenty-border-radius-lg);
          box-shadow: var(--twenty-shadow-md);
        }
        
        .contact-form h2 {
          margin-bottom: var(--twenty-spacing-6);
          font-size: var(--twenty-font-size-xl);
          font-weight: var(--twenty-font-weight-semibold);
          color: var(--twenty-color-gray-90);
          text-align: center;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--twenty-spacing-4);
        }
        
        .form-group {
          margin-bottom: var(--twenty-spacing-4);
        }
        
        .form-group label {
          display: block;
          margin-bottom: var(--twenty-spacing-1);
          font-size: var(--twenty-font-size-sm);
          font-weight: var(--twenty-font-weight-medium);
          color: var(--twenty-color-gray-90);
        }
        
        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: var(--twenty-spacing-3);
          border: 1px solid var(--twenty-color-gray-20);
          border-radius: var(--twenty-border-radius-md);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-base);
          transition: border-color 0.2s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--twenty-color-blue-60);
          box-shadow: 0 0 0 3px var(--twenty-color-blue-60)20;
        }
        
        button[type="submit"] {
          width: 100%;
          padding: var(--twenty-spacing-3) var(--twenty-spacing-6);
          background: var(--twenty-color-blue-60);
          color: var(--twenty-color-gray-0);
          border: none;
          border-radius: var(--twenty-border-radius-md);
          font-family: var(--twenty-font-family);
          font-size: var(--twenty-font-size-base);
          font-weight: var(--twenty-font-weight-medium);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        button[type="submit"]:hover:not(:disabled) {
          background: var(--twenty-color-blue-70);
        }
        
        button[type="submit"]:disabled {
          background: var(--twenty-color-gray-20);
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactForm;