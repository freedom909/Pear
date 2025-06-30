import styles from '../styles/LoadingSpinner.module.css';

/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component with customizable size
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Size of the spinner: 'small', 'medium', or 'large'
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  // Define spinner sizes
  const sizes = {
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

  // Get size configuration
  const sizeConfig = sizes[size] || sizes.medium;

  return (
    <div className={`${styles.spinnerContainer} ${className}`}>
      <div
        className={styles.spinner}
        style={{
          width: sizeConfig.width,
          height: sizeConfig.height,
          borderStyle: 'solid',
          borderWidth: sizeConfig.borderWidth,
        }}
      />
    </div>
  );
};

export default LoadingSpinner;