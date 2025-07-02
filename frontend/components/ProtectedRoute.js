// import { useContext, useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import { UserContext } from '../contexts/UserContext';
// import LoadingSpinner from './LoadingSpinner';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * ProtectedRoute Component
 *
 * A wrapper component that protects routes requiring authentication.
 * Redirects to login if user is not authenticated.
 * Optionally restricts access by allowedRoles.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array<string>} [props.allowedRoles] - Optional array of roles allowed to access this route
 * @returns {JSX.Element|null} - Rendered component or null during loading/redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user logged in—redirect to login
        router.push({
          pathname: '/login',
          query: { redirect: router.asPath },
        });
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
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
 * @param {React.ComponentType<any>} Component - The page component to protect
 * @param {Array<string>} [allowedRoles] - Optional allowed roles
 * @returns {React.ComponentType<any>}
 */
export const withProtection = (Component, allowedRoles = []) => {
  const ProtectedComponent = (props) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );

  // Copy getInitialProps if defined
  if (Component.getInitialProps) {
    ProtectedComponent.getInitialProps = Component.getInitialProps;
  }

  return ProtectedComponent;
};
