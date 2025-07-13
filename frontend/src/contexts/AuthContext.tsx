import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

type OAuthProvider = 'google' | 'facebook' | 'twitter' | 'apple';

interface User {
  id: string;
  email: string;
  username?: {
    firstname: string;
    lastname: string;
  } | string;
}

interface AuthContextType {
  authToken: string |  null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  loading: boolean;
  login: (provider: OAuthProvider) => void;
  logout: () => void;
  setAuthToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start with null until browser loads token
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const setAuthToken = (token: string | null) => {
    setAuthTokenState(token);
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token); // Change 'authToken' to 'token'
      } else {
        localStorage.removeItem('token'); // Change 'authToken' to 'token'
      }
    }
  };

  // Load token after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setAuthTokenState(storedToken);
      } else {
        setIsLoading(false); // Only set loading false if no token exists
      }
    }
  }, []);

  // Fetch user when token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!authToken) {
        setIsLoading(false); // No token means we're done loading
        return;
      }
      
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/v1/auth/verify-token', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setError('Unauthorized');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [authToken]);

  const login = (provider: OAuthProvider) => {
    window.location.href = `http://localhost:5000/api/v1/auth/${provider}`;
  };

  const logout = () => {
    setAuthToken(null);
    router.push('/login');
  };

  const value: AuthContextType = {
    authToken,
    user,
    isLoading,
    error,
    loading: isLoading,
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