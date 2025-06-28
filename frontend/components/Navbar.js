import { useContext, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserContext } from '../contexts/UserContext';
import styles from '../styles/Navbar.module.css';

const Navbar = () => {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Your App
        </Link>

        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuButton}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={styles.hamburger}></span>
        </button>

        {/* Desktop navigation */}
        <div className={styles.desktopNav}>
          <div className={styles.navLinks}>
            <Link 
              href="/"
              className={router.pathname === '/' ? styles.active : ''}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard"
                  className={router.pathname === '/dashboard' ? styles.active : ''}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile"
                  className={router.pathname === '/profile' ? styles.active : ''}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/about"
                  className={router.pathname === '/about' ? styles.active : ''}
                >
                  About
                </Link>
                <Link 
                  href="/contact"
                  className={router.pathname === '/contact' ? styles.active : ''}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          <div className={styles.authButtons}>
            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.userName}>
                  Welcome, {user.name}
                </span>
                <button 
                  onClick={handleLogout}
                  className={styles.logoutButton}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link 
                  href="/login"
                  className={styles.loginButton}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className={styles.registerButton}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.open : ''}`}>
          <div className={styles.mobileNavLinks}>
            <Link 
              href="/"
              className={router.pathname === '/' ? styles.active : ''}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            {user ? (
              <>
                <Link 
                  href="/dashboard"
                  className={router.pathname === '/dashboard' ? styles.active : ''}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile"
                  className={router.pathname === '/profile' ? styles.active : ''}
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/about"
                  className={router.pathname === '/about' ? styles.active : ''}
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
                <Link 
                  href="/contact"
                  className={router.pathname === '/contact' ? styles.active : ''}
                  onClick={closeMobileMenu}
                >
                  Contact
                </Link>
              </>
            )}
            {user ? (
              <button 
                onClick={handleLogout}
                className={styles.mobileLogoutButton}
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  href="/login"
                  className={styles.mobileAuthButton}
                  onClick={closeMobileMenu}
                >
                  Login
                </Link>
                <Link 
                  href="/register"
                  className={styles.mobileAuthButton}
                  onClick={closeMobileMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;