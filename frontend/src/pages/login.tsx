import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';

import { useAuth } from '../contexts/AuthContext';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import CircularProgress from '@mui/material/CircularProgress';
import styles from '../styles/Auth.module.css';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSocial, setIsLoadingSocial] = useState(false);
  const router = useRouter();
const { error: errorParam } = router.query;

  const { login } = useAuth();

  useEffect(() => {
    const errorParam = router.query.error as string;
    if (errorParam) {
      setLoginError(
        errorParam === 'authentication_failed'
          ? 'Login failed. Please try again.'
          : 'An error occurred during authentication.'
      );
    }
  }, [errorParam]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');

    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Example: Call your login function
        // await login(formData);
        // Simulate success for now
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Login failed. Please try again.';
        setLoginError(errorMessage);
        setIsSubmitting(false);
      }
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoadingSocial(true);
    window.location.href = `http://localhost:5000/api/v1/auth/${provider}`;
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
          Welcome to Our App
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Sign in to your account
        </Typography>

        {loginError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {loginError}
          </Alert>
        )}

        <Box sx={{ width: '100%', mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            fullWidth
            onClick={() => handleSocialLogin('google')}
            disabled={isLoadingSocial}
            sx={{ mb: 1 }}
          >
            {isLoadingSocial ? 'Redirecting...' : 'Sign in with Google'}
          </Button>
          <Button
            variant="contained"
            startIcon={<FacebookIcon />}
            fullWidth
            onClick={() => handleSocialLogin('facebook')}
            disabled={isLoadingSocial}
            sx={{ backgroundColor: '#1877F2' }}
          >
            {isLoadingSocial ? 'Redirecting...' : 'Sign in with Facebook'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ my: 1 }}>
          or sign in with email
        </Typography>

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
              value={formData.email}
              onChange={handleChange}
              className={`${styles.formInput} ${
                errors.email ? styles.inputError : ''
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className={styles.errorText}>{errors.email}</p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.formInput} ${
                errors.password ? styles.inputError : ''
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className={styles.errorText}>{errors.password}</p>
            )}
          </div>

          <div className={styles.rememberMe}>
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className={styles.checkbox}
            />
            <label htmlFor="rememberMe" className={styles.checkboxLabel}>
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Don&apos;t have an account?{' '}
          <a href="/register" className={styles.authLink}>
            Sign up
          </a>
        </Typography>
      </Box>
    </Container>
  );
}
