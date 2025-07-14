import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * 注册表单数据接口
 */
interface RegisterFormData {
  username: {
    firstname: string;
    lastname: string;
  };
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 表单错误接口
 */
interface FormErrors {
  username?: {
    firstname?: string;
    lastname?: string;
  };
  email?: string;
  password?: string;
  confirmPassword?: string;
}

/**
 * 注册结果接口
 */
interface RegisterResult {
  success: boolean;
  message?: string;
  details?: any;
}

/**
 * Register Page Component
 *
 * Handles new user registration process
 *
 * @returns {JSX.Element} Register page component
 */
const Register: NextPage = (): React.ReactElement => {
  // Form state
  const [formData, setFormData] = useState<RegisterFormData>({
    username: { //something wrong here?
      firstname: '',
      lastname: '',
    },
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //const [isSubmitted, setIsSubmitted] = useState<boolean>(false);


  const router = useRouter();
  const { redirect } = router.query;

  const { user, loading } = useUser();

  // Redirect if already logged in
  useEffect(() => {

    if (!loading && user) {//替换loading
      router.push((redirect as string) || '/dashboard');
    }
  }, [user, loading, router, redirect]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    if (name === 'firstname' || name === 'lastname') {
      setFormData((prev) => ({
        ...prev,
        username: {
          ...prev.username,
          [name]: value,
        },
      }));
      // Clear nested error
      if (errors.username?.[name]) {
        setErrors((prev) => ({
          ...prev,
          username: { ...prev.username, [name]: '' },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }

    if (generalError) {
      setGeneralError('');
    }
  };


  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.firstname.trim()) {
      newErrors.username = { ...newErrors.username, firstname: '名字为必填项' };
    }
    if (!formData.username.lastname.trim()) {
      newErrors.username = { ...newErrors.username, lastname: '姓氏为必填项' };
    }

    if (!formData.email.trim()) {
      newErrors.email = '电子邮箱为必填项';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '电子邮箱格式不正确';
    }
    if (!formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password.length < 8) {
      newErrors.password = '密码长度至少为8个字符';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
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
    setGeneralError('');

    try {

const response = await fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    firstname: formData.username.firstname.trim(),
    lastname: formData.username.lastname.trim(),
    email: formData.email.trim(),
    password: formData.password,
    passwordConfirm: formData.confirmPassword
  })
});


   

      if (!response.ok) {
        let errorMessage = '注册失败，请稍后重试';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // ignore JSON parsing error
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Registration success:', result);

      // Optionally auto-login or redirect
      router.push((redirect as string) || '/login');
    } catch (err) {
      console.error('Registration error:', err);
      setGeneralError(
        err instanceof Error ? err.message : '注册过程中发生错误，请重试'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            创建新账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            或{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              登录现有账户
            </Link>
          </p>
        </div>

        {generalError && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            {generalError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="firstname"
                name="firstname"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.username?.firstname ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="名字"
                value={formData.username?.firstname?.trim()}
                onChange={handleChange}
              />


              {errors.username?.firstname && (
                <p className="mt-1 text-sm text-red-600">{errors.username.firstname}</p>
              )}
              <input
                id="lastname"
                name="lastname"
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.username?.lastname ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="姓氏"
                value={formData.username?.lastname?.trim()}
                onChange={handleChange}
              />
              {errors.username?.lastname && (
                <p className="mt-1 text-sm text-red-600">{errors.username.lastname}</p>
              )}              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="电子邮箱"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}

            </div>
            <div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="密码"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="确认密码"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LoadingSpinner size="small" />
                </span>
              ) : (
                '注册'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            注册即表示您同意我们的{' '}
            <Link
              href="/terms"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              服务条款
            </Link>{' '}
            和{' '}
            <Link
              href="/privacy"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              隐私政策
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;