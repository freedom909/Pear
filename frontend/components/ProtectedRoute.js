import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../contexts/UserContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute component that checks if user is authenticated
 * and redirects to login page if not
 */
const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useContext(UserContext);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If user context is no longer loading, we can check authentication
    if (!loading) {
      if (!user) {
        // Redirect to login page with return URL
        router.push({
          pathname: '/login',
          query: { returnUrl: router.asPath },
        });
      } else {
        // User is authenticated, stop checking
        setIsChecking(false);
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner size="large" />
        <style jsx>{`
          .protected-route-loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100%;
          }
        `}</style>
      </div>
    );
  }

  // If we get here, the user is authenticated
  return children;
};

export default ProtectedRoute;

/**
 * Higher-order component to wrap protected pages
 */
export const withProtection = (Component) => {
  const ProtectedComponent = (props) => {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  // Copy getInitialProps so it works with Next.js data fetching
  if (Component.getInitialProps) {
    ProtectedComponent.getInitialProps = Component.getInitialProps;
  }

  return ProtectedComponent;
};