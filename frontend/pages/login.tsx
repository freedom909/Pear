import React, { useState, ChangeEvent, FormEvent } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Auth.module.css';

/**
 * 登录表单数据接口
 */
interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 表单错误接口
 */
interface FormErrors {
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

/**
 * 登录页面组件
 *
 * @returns {JSX.Element} 渲染的登录页面组件
 */
const Login: NextPage = (): React.ReactElement => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  /**
   * 处理表单输入变化
   *
   * @param {ChangeEvent<HTMLInputElement>} e - 输入变化事件
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  /**
   * 验证表单数据
   *
   * @returns {boolean} 表单是否有效
   */
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

  /**
   * 处理表单提交
   *
   * @param {FormEvent<HTMLFormElement>} e - 表单提交事件
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Login failed. Please try again.';
        setLoginError(errorMessage);
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
              {loginError}
            </div>
          )}

          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Sign in to your account</h1>
            <p className={styles.authSubtitle}>
              Welcome back! Please enter your details
            </p>
          </div>

          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => {
                window.location.href =
                  'http://localhost:5000/api/v1/auth/google';
              }}
            >
              <svg
                className={styles.socialIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>

            <button
              type="button"
              className={styles.socialButton}
              onClick={() => {
                window.location.href =
                  'http://localhost:5000/api/v1/auth/facebook';
              }}
            >
              <svg
                className={styles.socialIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.676 0H1.326C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.326 24H12.82V14.706h-3.157v-3.62h3.157V8.41c0-3.125 1.908-4.826 4.695-4.826 1.336 0 2.485.099 2.819.143v3.267l-1.935.001c-1.518 0-1.812.722-1.812 1.78v2.334h3.623l-.472 3.62h-3.151V24h6.174C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.676 0z"
                  fill="#1877F2"
                />
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
            Do not have an account?
            <Link href="/register" className={styles.authLink}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
