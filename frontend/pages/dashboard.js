import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/Dashboard.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading, error, logout } = useUser();

  // Redirect to home if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Error: {error}</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Dashboard</h1>
        
        <div className={styles.userInfo}>
          <h2>Welcome, {user.name}!</h2>
          {user.picture && (
            <img 
              src={user.picture} 
              alt={user.name} 
              className={styles.userImage} 
            />
          )}
          <p>Email: {user.email}</p>
        </div>

        <div className={styles.actions}>
          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Logout
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with Next.js and Node.js</p>
      </footer>
    </div>
  );
}