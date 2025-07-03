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
                      <Link href="/about">About</Link>
                    </li>
                    <li>
                      <Link href="/blog">Blog</Link>
                    </li>
                    <li>
                      <Link href="/careers">Careers</Link>
                    </li>
                    <li>
                      <Link href="/contact">Contact</Link>
                    </li>
                  </ul>
                </div>

                <div className={styles.footerLinkColumn}>
                  <h3 className={styles.footerLinkTitle}>Resources</h3>
                  <ul className={styles.footerLinkList}>
                    <li>
                      <Link href="/community">Community</Link>
                    </li>
                    <li>
                      <Link href="/help">Help Center</Link>
                    </li>
                    <li>
                      <Link href="/partners">Partners</Link>
                    </li>
                    <li>
                      <Link href="/status">Status</Link>
                    </li>
                  </ul>
                </div>

                <div className={styles.footerLinkColumn}>
                  <h3 className={styles.footerLinkTitle}>Legal</h3>
                  <ul className={styles.footerLinkList}>
                    <li>
                      <Link href="/privacy">Privacy</Link>
                    </li>
                    <li>
                      <Link href="/terms">Terms</Link>
                    </li>
                    <li>
                      <Link href="/security">Security</Link>
                    </li>
                    <li>
                      <Link href="/cookies">Cookies</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <p className={styles.copyright}>
                &copy; {new Date().getFullYear()} AuthApp. All rights reserved.
              </p>

              <div className={styles.socialLinks}>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="Twitter"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="GitHub"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="LinkedIn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;