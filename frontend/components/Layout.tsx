import { useState, useContext } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { UserContext } from '../contexts/UserContext';
import styles from '../styles/Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

interface User {
  name: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  logout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'pear',
  description = 'A secure authentication solution',
}) => {
  const router = useRouter();
  const { user, logout } = useContext(UserContext) as UserContextType;
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  const toggleMenu = async (): Promise<void> => {
    await setIsMenuOpen(!isMenuOpen);
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  const toggleUserMenu = async (): Promise<void> => {
    await setIsUserMenuOpen(!isUserMenuOpen);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    await logout();
    await setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.logoContainer}>
              <Link href="/" className={styles.logo}>
                <svg
                  className={styles.logoIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className={styles.logoText}>AuthApp</span>
              </Link>
            </div>

            <nav className={styles.desktopNav}>
              <ul className={styles.navList}>
                <li>
                  <Link
                    href="/"
                    className={`${styles.navLink} ${router.pathname === '/' ? styles.active : ''}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={`${styles.navLink} ${router.pathname === '/about' ? styles.active : ''}`}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className={`${styles.navLink} ${router.pathname === '/features' ? styles.active : ''}`}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className={`${styles.navLink} ${router.pathname === '/docs' ? styles.active : ''}`}
                  >
                    Documentation
                  </Link>
                </li>
              </ul>
            </nav>

            <div className={styles.headerRight}>
              {user ? (
                <div className={styles.userMenuContainer}>
                  <button
                    className={styles.userButton}
                    onClick={toggleUserMenu}
                    aria-expanded={isUserMenuOpen}
                    aria-label="User menu"
                  >
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        className={styles.userAvatar}
                      />
                    ) : (
                      <div className={styles.userInitial}>
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className={styles.userName}>{user.name}</span>
                    <svg
                      className={`${styles.userMenuArrow} ${isUserMenuOpen ? styles.rotate : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className={styles.userMenu}>
                      <Link href="/dashboard" className={styles.userMenuItem}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={styles.userMenuIcon}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link href="/profile" className={styles.userMenuItem}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={styles.userMenuIcon}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Profile
                      </Link>
                      <Link href="/settings" className={styles.userMenuItem}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={styles.userMenuIcon}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Settings
                      </Link>
                      <div className={styles.menuDivider}></div>
                      <button
                        onClick={handleLogout}
                        className={styles.userMenuItem}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={styles.userMenuIcon}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v1a1 1 0 102 0V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.authButtons}>
                  <Link href="/login" className={styles.loginButton}>
                    Log in
                  </Link>
                  <Link href="/register" className={styles.registerButton}>
                    Sign up
                  </Link>
                </div>
              )}

              <button
                className={styles.mobileMenuButton}
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-label="Menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={styles.menuIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className={styles.mobileNav}>
              <ul className={styles.mobileNavList}>
                <li>
                  <Link
                    href="/"
                    className={styles.mobileNavLink}
                    onClick={toggleMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={styles.mobileNavLink}
                    onClick={toggleMenu}
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className={styles.mobileNavLink}
                    onClick={toggleMenu}
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className={styles.mobileNavLink}
                    onClick={toggleMenu}
                  >
                    Documentation
                  </Link>
                </li>
                {!user && (
                  <>
                    <li className={styles.mobileNavDivider}></li>
                    <li>
                      <Link
                        href="/login"
                        className={styles.mobileNavLink}
                        onClick={toggleMenu}
                      >
                        Log in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        className={styles.mobileNavLink}
                        onClick={toggleMenu}
                      >
                        Sign up
                      </Link>
                    </li>
                  </>
                )}
                {user && (
                  <>
                    <li className={styles.mobileNavDivider}></li>
                    <li>
                      <Link
                        href="/dashboard"
                        className={styles.mobileNavLink}
                        onClick={toggleMenu}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/profile"
                        className={styles.mobileNavLink}
                        onClick={toggleMenu}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className={styles.mobileNavLink}
                        onClick={toggleMenu}
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className={styles.mobileNavButton}
                      >
                        Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          )}
        </header>

        <main className={styles.main}>{children}</main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <div className={styles.footerTop}>
              <div className={styles.footerLogo}>
                <Link href="/" className={styles.logo}>
                  <svg
                    className={styles.logoIcon}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className={styles.logoText}>AuthApp</span>
                </Link>
              </div>

              <div className={styles.footerLinks}>
                <div className={styles.footerLinkColumn}>
                  <h3 className={styles.footerLinkTitle}>Company</h3>
                  <ul className={styles.footerLinkList}>
                    <li>
                      <Link href="/about" className={styles.footerLink}>
                        About
                      </Link>
                    </li>
                    <li>
                      <Link href="/careers" className={styles.footerLink}>
                        Careers
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className={styles.footerLink}>
                        Blog
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className={styles.footerLinkColumn}>
                  <h3 className={styles.footerLinkTitle}>Resources</h3>
                  <ul className={styles.footerLinkList}>
                    <li>
                      <Link href="/docs" className={styles.footerLink}>
                        Documentation
                      </Link>
                    </li>
                    <li>
                      <Link href="/support" className={styles.footerLink}>
                        Support
                      </Link>
                    </li>
                    <li>
                      <Link href="/status" className={styles.footerLink}>
                        Status
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className={styles.footerLinkColumn}>
                  <h3 className={styles.footerLinkTitle}>Legal</h3>
                  <ul className={styles.footerLinkList}>
                    <li>
                      <Link href="/privacy" className={styles.footerLink}>
                        Privacy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className={styles.footerLink}>
                        Terms
                      </Link>
                    </li>
                    <li>
                      <Link href="/security" className={styles.footerLink}>
                        Security
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p className={styles.copyright}>
                &copy; {new Date().getFullYear()} AuthApp. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
