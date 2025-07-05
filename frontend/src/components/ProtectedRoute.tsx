import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserRole } from '../types/user';

interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  tokenExpiry?: number;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute Component for Next.js
 */
export default function ProtectedRoute({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const { user, loading, refreshToken } = useUser();
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      if (user.tokenExpiry && user.tokenExpiry * 1000 < Date.now() + 300000) {
        // Token expiring soon—attempt to refresh
        try {
          const refreshed = await refreshToken?.();
          if (!refreshed) {
            console.warn('Token refresh failed.');
          }
        } catch (err) {
          console.error('Error refreshing token:', err);
        }
      }

      setChecking(false);
    };

    if (!loading) {
      checkAuth();
    }
  }, [user, loading, refreshToken]);

  if (loading || checking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!user) {
    // Not logged in—redirect to login
    if (typeof window !== 'undefined') {
      router.replace({
        pathname: '/login',
        query: { redirect: router.asPath },
      });
    }
    return null;
  }

  if (
    allowedRoles.length > 0 &&
    user.role &&
    !allowedRoles.includes(user.role)
  ) {
    // Role not permitted—redirect to unauthorized page
    if (typeof window !== 'undefined') {
      router.replace('/unauthorized');
    }
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap protected pages
 */
export function withProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[] = []
): React.FC<P> {
  const ProtectedComponent: React.FC<P> = (props) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  return ProtectedComponent;
}
