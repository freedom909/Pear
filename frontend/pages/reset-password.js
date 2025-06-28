import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/ResetPassword.module.css';
import { Input, Button } from '../components/FormElements';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { UserContext } from '../contexts/UserContext';
import { validatePassword } from '../utils/validation';

export default function ResetPassword() {
  const router = useRouter();
  const { resetPassword } = useContext(UserContext);
  const { token } = router.query;
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  // Check if token is present
  useEffect(() => {
    if (router.isReady && !token) {
      setTokenValid(false);
      setApiError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [router.isReady, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      await resetPassword(token, formData.password);
      setSuccessMessage('Password reset successful! You can now login with your new password.');
      
      // Clear form
      setFormData({
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setApiError(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <ErrorMessage 
            message={apiError} 
            variant="default"
          />
          <div className={styles.loginLink}>
            <Link href="/forgot-password">
              Request a new password reset
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Reset Your Password</h1>
        
        <p className={styles.description}>
          Please enter your new password below.
        </p>

        {successMessage && (
          <SuccessMessage 
            message={successMessage} 
            variant="default"
          />
        )}

        {apiError && (
          <ErrorMessage 
            message={apiError} 
            variant="default"
          />
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="New Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your new password"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your new password"
            required
          />

          <div className={styles.passwordRequirements}>
            <p>Password must:</p>
            <ul>
              <li>Be at least 8 characters long</li>
              <li>Include at least one uppercase letter</li>
              <li>Include at least one lowercase letter</li>
              <li>Include at least one number</li>
              <li>Include at least one special character</li>
            </ul>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          <div className={styles.loginLink}>
            Remember your password?{' '}
            <Link href="/login">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}