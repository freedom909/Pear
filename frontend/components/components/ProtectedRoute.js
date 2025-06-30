import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 * 
 * A wrapper component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 * @param {Array<string>} [props.allowedRoles] - Optional array of roles allowed to access this route
 * @returns {JSX.Element|null} - Rendered component or null during loading/redirect
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is found, redirect to login
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
    
    // If user exists but doesn't have the required role
    if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      router.push('/unauthorized');
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading spinner while checking authentication
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If user exists and has required role (or no specific role is required)
  if (user && (allowedRoles.length === 0 || allowedRoles.includes(user.role))) {
    return <>{children}</>;
  }

  // Default case - don't render anything while redirecting
  return null;
};

export default ProtectedRoute;