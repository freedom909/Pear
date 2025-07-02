import React from 'react';
import styles from './FormElements.module.css';

/**
 * Input component with label and error message
 */
export const Input = ({
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

/**
 * Button component with different variants
 */
export const Button = ({
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

/**
 * Form component wrapper
 */
export const Form = ({ children, onSubmit, className = '' }) => {
  return (
    <form onSubmit={onSubmit} className={`${styles.form} ${className}`}>
      {children}
    </form>
  );
};

/**
 * Form section with title and optional description
 */
export const FormSection = ({ title, description, children }) => {
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

/**
 * Checkbox component
 */
export const Checkbox = ({ id, label, checked, onChange, error }) => {
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

/**
 * Select dropdown component
 */
export const Select = ({
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

/**
 * Textarea component
 */
export const Textarea = ({
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
