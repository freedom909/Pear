// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username?: {
    firstname: string;
    lastname: string;
  } | string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginRedirect: (provider: 'google' | 'facebook' | 'twitter' | 'apple' | 'local') => void;
  logout: () => void;
  refetchUser: () => void;
  setAuthToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/v1/auth/status', {
        withCredentials: true,
      });

      if (res.data.authenticated) {
        setIsAuthenticated(true);
        setUser(res.data.user); // 注意：你后端 `/auth/status` 需要返回 `user` 对象
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      setError('Authentication check failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const loginRedirect = (provider: 'google' | 'facebook' | 'twitter' | 'apple' | 'local') => {
    window.location.href = `http://localhost:5000/api/v1/auth/${provider}`;
  };

  const logout = async () => {
    await axios.post('http://localhost:5000/api/v1/auth/logout', {}, {
      withCredentials: true,
    });
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    loginRedirect,
    logout,
    refetchUser: fetchUser,
    setAuthToken: (token: string | null) => {
      if (typeof window !== 'undefined') {
        if (token) {
          localStorage.setItem('authToken', token);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
