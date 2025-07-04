import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import styles from '../styles/Callback.module.css';
import { User } from '../contexts/UserContext';

interface AuthResponse {
  token: string;
  user: User;
}

const Callback: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      try {
        // Get the code from URL query parameters
        const { code } = router.query;

        if (!code || typeof code !== 'string') {
          setLoading(false);
          return;
        }

        // Exchange the code for tokens
        const response = await api.get<AuthResponse>(
          `/auth/google/callback?code=${code}`
        );

        if (response.data && response.data.token) {
          // Store tokens in HTTP-only cookies via API endpoint
          await api.post('/auth/store-tokens', {
            token: response.data.token,
            refreshToken: response.data.user?.refreshToken,
            tokenExpiry: response.data.user?.tokenExpiry
          });

          // Enhance user object with Google avatar if available
          const userWithAvatar = {
            ...response.data.user,
            avatar: response.data.user?.picture || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(
                     response.data.user?.username?.firstname + ' ' + 
                     response.data.user?.username?.lastname
                   )}&background=random`
          };

          // Save sanitized user data to context (localStorage handled by UserProvider)
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify({
              ...userWithAvatar,
              token: undefined, // Don't store token in localStorage
              refreshToken: undefined
            }));
          }

          // Redirect to dashboard or intended page
          const redirectTo = router.query.redirect || '/dashboard';
          router.push(typeof redirectTo === 'string' ? redirectTo : '/dashboard');
        } else {
          setError('Failed to authenticate with Google');
          setLoading(false);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('An error occurred during authentication');
        setLoading(false);
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query, router]);

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.message}>Authenticating...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Authentication Error</h2>
        <p className={`${styles.message} ${styles.error}`}>{error}</p>
        <button onClick={() => router.push('/')} className={styles.button}>
          Return to Home
        </button>
      </div>
    );
  }

  return null;
};

export default Callback;