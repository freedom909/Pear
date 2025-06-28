import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从localStorage加载用户数据
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 登录函数
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 注销函数
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 更新用户信息
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 检查用户是否已认证
  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// 自定义钩子，用于在组件中访问用户上下文
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// 高阶组件，用于保护需要认证的路由
export function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();
    const { user, isLoading } = useUser();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push(`/login?redirect=${router.pathname}`);
      }
    }, [user, isLoading, router]);

    // 显示加载状态
    if (isLoading) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div>Loading...</div>
        </div>
      );
    }

    // 如果用户未登录，返回null（重定向会在useEffect中处理）
    if (!user) {
      return null;
    }

    // 如果用户已登录，渲染组件
    return <WrappedComponent {...props} />;
  };
}

// 用于API请求的辅助函数
export async function fetchWithAuth(url, options = {}) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    throw new Error('No authenticated user');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.token}`,
    },
  };

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // 如果响应状态是401（未授权），清除用户数据并重定向到登录页面
      if (response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}