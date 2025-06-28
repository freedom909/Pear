import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

/**
 * LoadingSpinner component
 * @param {Object} props - Component props
 * @param {string} [props.size='medium'] - Size of the spinner (small, medium, large)
 * @param {string} [props.color='primary'] - Color of the spinner (primary, secondary, white)
 * @param {string} [props.className] - Additional CSS class names
 */
const LoadingSpinner = ({ size = 'medium', color = 'primary', className = '' }) => {
  const spinnerClasses = [
    styles.spinner,
    styles[`spinner-${size}`],
    styles[`spinner-${color}`],
    className
  ].join(' ');

  return (
    <div className={spinnerClasses} role="status" aria-label="Loading">
      <span className={styles.visuallyHidden}>Loading...</span>
    </div>
  );
};

export default LoadingSpinner;