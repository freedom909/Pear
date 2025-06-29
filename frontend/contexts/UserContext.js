import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';

// 用户数据脱敏函数
const sanitizeUserData = (userData) => {
  if (!userData) return null;
  
  // 创建用户数据的副本
  const sanitized = { ...userData };
  
  // 脱敏邮箱
  if (sanitized.email) {
    const [localPart, domain] = sanitized.email.split('@');
    sanitized.email = `${localPart.charAt(0)}${'*'.repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`;
  }
  
  // 脱敏手机号码
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2');
  }
  
  // 脱敏身份证号
  if (sanitized.idNumber) {
    sanitized.idNumber = sanitized.idNumber.replace(/^(\d{6})\d{8}(\d{4})$/, '$1********$2');
  }
  
  // 保留必要的认证信息
  const preservedFields = ['token', 'id', 'username', 'role', 'permissions'];
  preservedFields.forEach(field => {
    if (userData[field]) {
      sanitized[field] = userData[field];
    }
  });
  
  return sanitized;
};

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从localStorage加载用户数据
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // 加载完整用户数据到状态中
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 登录函数
  const login = (userData) => {
    // 存储完整用户数据到状态中
    setUser(userData);
    
    // 存储到localStorage前进行脱敏
    const sanitizedForStorage = sanitizeUserData(userData);
    localStorage.setItem('user', JSON.stringify(sanitizedForStorage));
  };

  // 注销函数
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 更新用户信息
  const updateUser = (updates) => {
    // 更新完整用户数据到状态中
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    
    // 存储到localStorage前进行脱敏
    const sanitizedForStorage = sanitizeUserData(updatedUser);
    localStorage.setItem('user', JSON.stringify(sanitizedForStorage));
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