import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  /** Spinner size */
  size?: 'small' | 'medium' | 'large';
  /** Spinner color */
  color?: 'primary' | 'secondary' | 'white';
  /** Additional CSS class names */
  className?: string;
}

/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner with customizable size and color.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  className = '',
}) => {
  // Combine classes
  const spinnerClasses = [
    styles.spinner,
    styles[`spinner-${size}`], // e.g., spinner-small
    styles[`spinner-${color}`], // e.g., spinner-primary
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={spinnerClasses} role="status" aria-label="Loading">
      <span className={styles.visuallyHidden}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
