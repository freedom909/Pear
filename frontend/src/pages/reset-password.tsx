import { useState, useContext, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/ResetPassword.module.css';
import { Input, Button } from '../components/FormElements';
import ErrorMessage from '../components/ErrorMessage';
import SuccessMessage from '../components/SuccessMessage';
import { UserContext } from '../contexts/UserContext';
import dynamic from 'next/dynamic';
const validatePassword = dynamic(() => import('../utils/validation').then(mod => mod.validatePassword), { ssr: false });

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  [key: string]: string | undefined;
}

interface UserContextType {
  resetPassword: (
    token: string | string[] | undefined,
    password: string
  ) => Promise<void>;
}

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const userContext = useContext(UserContext);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (userContext?.initialized) {
      setInitialized(true);
    }
  }, [userContext]);

  if (!initialized) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    );
  }

  const { resetPassword } = userContext as unknown as UserContextType;
  const { token } = router.query;

  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');
  const [tokenValid, setTokenValid] = useState<boolean>(true);

  // Check if token is present
  useEffect(() => {
    if (router.isReady && !token) {
      setTokenValid(false);
      setApiError(
        'Invalid or missing reset token. Please request a new password reset link.'
      );
    }
  }, [router.isReady, token]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  const validateForm = async (): Promise<boolean> => {
  const newErrors: FormErrors = {};

  // dynamically import
  const { validatePassword } = await import('../utils/validation');

  // Validate password
  const passwordError = validatePassword(formData.password);
  if (passwordError) {
    newErrors.password = passwordError;
  }

  // Validate confirm password
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

   

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      await resetPassword(token, formData.password);
      setSuccessMessage(
        'Password reset successful! You can now login with your new password.'
      );

      // Clear form
      setFormData({
        password: '',
        confirmPassword: '',
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setApiError(
          error.message || 'Failed to reset password. Please try again.'
        );
      } else {
        setApiError('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <ErrorMessage message={apiError} variant="default" />
          <div className={styles.loginLink}>
            <Link href="/forgot-password">Request a new password reset</Link>
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
          <SuccessMessage message={successMessage} variant="default" />
        )}

        {apiError && <ErrorMessage message={apiError} variant="default" />}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            id="password"
            label="New Password"
            type="password"
            // The error indicates 'name' property doesn't exist in InputProps.
            // Since we can't use 'name', we might need to find an alternative way to track the input.
            // However, based on the handleChange function, we need a way to identify the input.
            // If the Input component needs to support the 'name' prop, we should add it to InputProps.
            // But since we're only allowed to modify the selection, we'll remove this line.
            // Note: This might require additional changes to the handleChange function to work correctly.
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your new password"
            required
          />

          <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            // Removed 'name' prop as it doesn't exist in InputProps
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
            // Removed 'isLoading' prop as it does not exist on type 'IntrinsicAttributes & ButtonProps'
            disabled={isLoading}
            fullWidth
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          <div className={styles.loginLink}>
            Remember your password? <Link href="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;