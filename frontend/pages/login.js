import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Auth.module.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Here you would typically make an API call to your authentication endpoint
        // For example:
        // const response = await fetch('/api/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData)
        // });
        
        // if (!response.ok) {
        //   const error = await response.json();
        //   throw new Error(error.message || 'Login failed');
        // }
        
        // const data = await response.json();
        // localStorage.setItem('token', data.token);
        
        // Simulate successful login for now
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } catch (error) {
        setLoginError(error.message || 'Login failed. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Layout>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          {loginError && (
            <div className={styles.errorAlert}>
              <svg className={styles.errorIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {loginError}
            </div>
          )}
          
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Sign in to your account</h1>
            <p className={styles.authSubtitle}>Welcome back! Please enter your details</p>
          </div>
          
          <div className={styles.socialButtons}>
            <button type="button" className={styles.socialButton}>
              <svg className={styles.socialIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
            
            <button type="button" className={styles.socialButton}>
              <svg className={styles.socialIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill="#1877F2" />
              </svg>
              Sign in with Facebook
            </button>
          </div>
          
          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>
          
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
                className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className={styles.errorText}>{errors.email}</p>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <div className={styles.passwordHeader}>
                <label htmlFor="password" className={styles.formLabel}>
                  Password
                </label>
                <Link href="/forgot-password" className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
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
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.loadingSpinner}></div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          
          <div className={styles.authFooter}>
            Don't have an account?{' '}
            <Link href="/register" className={styles.authLink}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}