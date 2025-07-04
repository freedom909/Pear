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

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshToken: () => Promise<boolean>;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

/**
 * ProtectedRoute Component
 *
 * A wrapper component that protects routes requiring authentication.
 * Redirects to login if user is not authenticated.
 * Optionally restricts access by allowedRoles.
 *
 * @param props - Component props
 * @param props.children - Child components to render if authenticated
 * @param props.allowedRoles - Optional array of roles allowed to access this route
 * @returns Rendered component or null during loading/redirect
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
}) => {
  const { user, loading, refreshToken } = useUser() as UserContextType;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!loading) {
      const checkAccess = async () => {
        try {
          if (!user) {
            // No user logged in—redirect to login
            router.push({
              pathname: '/login',
              query: { redirect: router.asPath },
            });
            return;
          }

          // Handle unverified accounts
          // if (user.isVerified === false) {
          //   router.push('/verify-email');
          //   return;
          // }

          // Check role-based access
          if (
            allowedRoles.length > 0 &&
            user.role &&
            !allowedRoles.includes(user.role)
          ) {
            router.push('/unauthorized');
            return;
          }

          // Check token expiry if available
          if (user.tokenExpiry && user.tokenExpiry * 1000 < Date.now() + 300000) {
            // Token expired or about to expire (within 5 minutes)
            const refreshed = await refreshToken();
            if (!refreshed) {
              router.push({
                pathname: '/login',
                query: { redirect: router.asPath, sessionExpired: 'true' },
              });
              return;
            }
          }

          // All checks passed
          setIsChecking(false);
        } catch (error) {
          console.error('Protected route check failed:', error);
          router.push('/500');
        }
      };

      checkAccess();
    }
  }, [user, loading, router, allowedRoles]);

  // Show spinner while checking authentication or redirecting
  if (loading || isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;

/**
 * Higher-order component to wrap protected pages
 *
 * @param Component - The page component to protect
 * @param allowedRoles - Optional allowed roles
 * @returns Protected component
 */
export const withProtection = <P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[] = []
): React.FC<P> => {
  const ProtectedComponent: React.FC<P> = (props) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  // Copy getInitialProps if defined
  if ('getInitialProps' in Component) {
    (ProtectedComponent as any).getInitialProps = (
      Component as any
    ).getInitialProps;
  }

  return ProtectedComponent;
};