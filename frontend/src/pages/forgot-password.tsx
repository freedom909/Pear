import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Auth.module.css';

interface FormErrors {
  email?: string;
  [key: string]: string | undefined;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);

    // Clear error when user starts typing
    if (errors.email) {
      setErrors({
        ...errors,
        email: '',
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSubmitError('');

    if (validateForm()) {
      setIsSubmitting(true);

      try {
       // Here you would typically make an API call to your password reset endpoint
       
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to send reset link');
        }

        // Simulate successful submission
        setTimeout(() => {
          setIsSubmitted(true);
          setIsSubmitting(false);
        }, 1000);
      } catch (error) {
        if (error instanceof Error) {
          setSubmitError(
            error.message || 'Failed to send reset link. Please try again.'
          );
        } else {
          setSubmitError('Failed to send reset link. Please try again.');
        }
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Layout>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {submitError && (
            <div className={styles.errorAlert}>
              <svg
                className={styles.errorIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {submitError}
            </div>
          )}

          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Reset your password</h1>
            <p className={styles.authSubtitle}>
              {isSubmitted
                ? "We've sent you an email with a link to reset your password."
                : "Enter your email address and we'll send you a link to reset your password."}
            </p>
          </div>

          {isSubmitted ? (
            <div className={styles.successMessage}>
              <div className={styles.successIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className={styles.successText}>
                Please check your email for a link to reset your password. If it
                does not appear within a few minutes, check your spam folder.
              </p>
              <Link href="/login" className={styles.submitButton}>
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.formLabel}>
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className={styles.errorText}>{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className={styles.loadingSpinner}></div>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}

          <div className={styles.authFooter}>
            Remember your password?{' '}
            <Link href="/login" className={styles.authLink}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
