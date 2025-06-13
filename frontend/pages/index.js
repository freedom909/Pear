import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Home.module.css';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth URL
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to Pear
        </h1>
        
        <p className={styles.description}>
          A simple demonstration of Google OAuth integration
        </p>

        <div className={styles.loginSection}>
          <button
            onClick={handleGoogleLogin}
            className={styles.googleButton}
          >
            Sign in with Google
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with Next.js and Node.js</p>
      </footer>
    </div>
  );
}