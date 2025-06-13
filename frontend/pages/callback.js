import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import styles from '../styles/Callback.module.css';

export default function Callback() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL query parameters
        const { code } = router.query;
        
        if (!code) {
          setLoading(false);
          return;
        }

        // Exchange the code for a token
        const response = await api.get(`/auth/google/callback?code=${code}`);
        
        if (response.data && response.data.token) {
          // Save the token to localStorage
          localStorage.setItem('token', response.data.token);
          
          // Redirect to home page
          router.push('/');
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
  }, [router.isReady, router.query]);

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
        <button 
          onClick={() => router.push('/')}
          className={styles.button}
        >
          Return to Home
        </button>
      </div>
    );
  }

  return null;
}