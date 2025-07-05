import React from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Variant of the error (default, toast, inline) */
  variant?: 'default' | 'toast' | 'inline';
  /** Optional function to call when dismissing the error */
  onDismiss?: () => void;
}

/**
 * Error message component for displaying error messages
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = 'default',
  onDismiss,
}) => {
  if (!message) {
    return null;
  }

  return (
    <div className={`${styles.errorContainer} ${styles[variant]}`}>
      <div className={styles.iconContainer}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={styles.icon}
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm0-10v6h2V7h-2z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className={styles.messageContainer}>
        <p className={styles.message}>{message}</p>
      </div>
      {onDismiss && (
        <button
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss error message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={styles.dismissIcon}
          >
            <path
              fillRule="evenodd"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
