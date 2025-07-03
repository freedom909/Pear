import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
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
  const { user, loading } = useUser() as UserContextType;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user logged in—redirect to login
        router.push({
          pathname: '/login',
          query: { redirect: router.asPath },
        });
      } else if (
        allowedRoles.length > 0 &&
        user.role &&
        !allowedRoles.includes(user.role)
      ) {
        // User logged in but lacks the required role
        router.push('/unauthorized');
      } else {
        // Authenticated and has access
        setIsChecking(false);
      }
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
  allowedRoles: string[] = []
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