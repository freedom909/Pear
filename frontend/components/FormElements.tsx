import React, { ChangeEvent, FormEvent } from 'react';
import styles from './FormElements.module.css';

interface InputProps {
  /** Input field ID */
  id: string;
  /** Label text */
  label: string;
  /** Input type (text, email, password, etc.) */
  type?: string;
  /** Input value */
  value: string;
  /** Change handler function */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Error message */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** HTML autocomplete attribute */
  autoComplete?: string;
}

/**
 * Input component with label and error message
 */
export const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder = '',
  required = false,
  autoComplete = 'on',
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        required={required}
        autoComplete={autoComplete}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Click handler function */
  onClick?: () => void;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Button variant (primary, secondary, etc.) */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Button component with different variants
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.fullWidth : ''} ${className}`}
    >
      {children}
    </button>
  );
};

interface FormProps {
  /** Form content */
  children: React.ReactNode;
  /** Form submit handler */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Form component wrapper
 */
export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  className = '',
}) => {
  return (
    <form onSubmit={onSubmit} className={`${styles.form} ${className}`}>
      {children}
    </form>
  );
};

interface FormSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Section content */
  children: React.ReactNode;
}

/**
 * Form section with title and optional description
 */
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className={styles.formSection}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      {description && (
        <p className={styles.sectionDescription}>{description}</p>
      )}
      {children}
    </div>
  );
};

interface CheckboxProps {
  /** Checkbox ID */
  id: string;
  /** Label text */
  label: React.ReactNode;
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Change handler function */
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Error message */
  error?: string;
}

/**
 * Checkbox component
 */
export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  error,
}) => {
  return (
    <div className={styles.checkboxGroup}>
      <div className={styles.checkboxWrapper}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className={styles.checkbox}
        />
        <label htmlFor={id} className={styles.checkboxLabel}>
          {label}
        </label>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  /** Select field ID */
  id: string;
  /** Label text */
  label: string;
  /** Selected value */
  value: string;
  /** Change handler function */
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  /** Available options */
  options: SelectOption[];
  /** Error message */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
}

/**
 * Select dropdown component
 */
export const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.inputError : ''}`}
        required={required}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

interface TextareaProps {
  /** Textarea field ID */
  id: string;
  /** Label text */
  label: string;
  /** Textarea value */
  value: string;
  /** Change handler function */
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Error message */
  error?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Number of rows */
  rows?: number;
}

/**
 * Textarea component
 */
export const Textarea: React.FC<TextareaProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  placeholder = '',
  required = false,
  rows = 4,
}) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.textarea} ${error ? styles.inputError : ''}`}
        required={required}
        rows={rows}
      />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};
