import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';
/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner with customizable size and color.
 *
 * @param {Object} props - Component props
 * @param {'small' | 'medium' | 'large'} [props.size='medium'] - Spinner size
 * @param {'primary' | 'secondary' | 'white'} [props.color='primary'] - Spinner color
 * @param {string} [props.className] - Additional CSS class names
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  className = '',
}) => {
  // Define fallback inline styles for size if needed
  const sizeStyles = {
    small: {
      width: '1rem',
      height: '1rem',
      borderWidth: '2px',
    },
    medium: {
      width: '2rem',
      height: '2rem',
      borderWidth: '3px',
    },
    large: {
      width: '3rem',
      height: '3rem',
      borderWidth: '4px',
    },
  };

  const sizeStyle = sizeStyles[size] || sizeStyles.medium;

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
