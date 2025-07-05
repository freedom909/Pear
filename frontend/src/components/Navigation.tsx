import { useRouter } from 'next/router';
import Link from 'next/link';
import { useUser } from '../contexts/UserContext';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const router = useRouter();
  const { user, loading, logout } = useUser();

  const handleLogout = async (): Promise<void> => {
    await logout()
      .then(() => router.push('/'))
      .catch(() => {});
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/">
          <span className={styles.logo}>Pear</span>
        </Link>

        <div className={styles.links}>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <span
                      className={`${styles.link} ${router.pathname === '/dashboard' ? styles.active : ''}`}
                    >
                      Dashboard
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/">
                  <span
                    className={`${styles.link} ${router.pathname === '/' ? styles.active : ''}`}
                  >
                    Login
                  </span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
