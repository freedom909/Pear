import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

type OAuthProvider = 'google' | 'facebook' | 'twitter' | 'apple';

interface AuthContextType {
  authToken: string | null;
  isLoading: boolean;
  login: (provider: OAuthProvider) => void;
  logout: () => void;
  setAuthToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthToken(token);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (authToken) {
      localStorage.setItem('auth_token', authToken);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [authToken]);

  const login = (provider: OAuthProvider) => {
    window.location.href = `/api/v1/auth/${provider}`;// login wrong will redirect to /login?
  };

  const logout = () => {
    setAuthToken(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    authToken,
    isLoading,
    login,
    logout,
    setAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
