import { NextPage } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import React from 'react';
import Image from 'next/image';

/**
 * 首页组件
 *
 * @returns {JSX.Element} 渲染的首页组件
 */
const Home: NextPage = (): React.ReactElement => {
  return (
    <Layout
      title="AuthApp - Secure Authentication Solution"
      description="A modern, secure authentication solution for your applications"
    >
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Secure Authentication{' '}
            <span className={styles.highlight}>Made Simple</span>
          </h1>
          <p className={styles.heroSubtitle}>
            A modern, secure authentication solution that integrates seamlessly
            with your applications. Protect your users data with
            industry-leading security practices.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/register" className={styles.primaryButton}>
              Get Started
            </Link>
            <Link href="/docs" className={styles.secondaryButton}>
              View Documentation
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>99.9%</span>
              <span className={styles.heroStatLabel}>Uptime</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>10k+</span>
              <span className={styles.heroStatLabel}>Users</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNumber}>500+</span>
              <span className={styles.heroStatLabel}>Companies</span>
            </div>
          </div>
        </div>
        <div className={styles.heroImageContainer}>
          <div className={styles.heroImage}>
            <svg
              className={styles.securityIcon}
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Everything you need for authentication
            </h2>
            <p className={styles.sectionSubtitle}>
              Our platform provides all the essential features to secure your
              application and manage user authentication.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
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
              </div>
              <h3 className={styles.featureTitle}>Secure Authentication</h3>
              <p className={styles.featureDescription}>
                Industry-standard authentication protocols with password
                hashing, salting, and encryption.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.75 8.25h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>User Management</h3>
              <p className={styles.featureDescription}>
                Comprehensive user management with roles, permissions, and
                profile customization.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>
                Multi-factor Authentication
              </h3>
              <p className={styles.featureDescription}>
                Add an extra layer of security with SMS, email, or authenticator
                app verification.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M4.5 3.75a3 3 0 00-3 3v.75h21v-.75a3 3 0 00-3-3h-15z" />
                  <path
                    fillRule="evenodd"
                    d="M22.5 9.75h-21v7.5a3 3 0 003 3h15a3 3 0 003-3v-7.5zm-18 3.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Social Login</h3>
              <p className={styles.featureDescription}>
                Allow users to sign in with their favorite social accounts like
                Google, Facebook, and Twitter.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Session Management</h3>
              <p className={styles.featureDescription}>
                Secure session handling with configurable timeouts, device
                tracking, and forced logout capabilities.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Detailed Analytics</h3>
              <p className={styles.featureDescription}>
                Track user activity, login attempts, and security events with
                comprehensive analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How it works</h2>
            <p className={styles.sectionSubtitle}>
              Implementing our authentication system is simple and
              straightforward. Get up and running in minutes.
            </p>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Create an account</h3>
              <p className={styles.stepDescription}>
                Sign up for an account and get access to your dashboard and API
                keys.
              </p>
            </div>

            <div className={styles.stepArrow}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Configure and customize</h3>
              <p className={styles.stepDescription}>
                Customize the authentication flow and UI to match your
                applications design.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Trusted by developers worldwide
            </h2>
            <p className={styles.sectionSubtitle}>
              See what our customers have to say about our authentication
              solution.
            </p>
          </div>
        </div>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialContent}>
              <p className={styles.testimonialText}>
                AuthApp has simplified our authentication process significantly.
                The integration was seamless, and our users love the new login
                experience.
              </p>
              <div className={styles.testimonialAuthor}>
                <p className={styles.testimonialAuthorName}>John Doe</p>
                <p className={styles.testimonialAuthorPosition}>
                  CTO, Acme Inc.
                </p>
              </div>
              <div className={styles.testimonialAvatar}>
                <Image
                  src="/images/avatar-1.jpg"
                  alt="Avatar 1"
                  width={40}
                  height={40}
                  className={styles.testimonialAvatarImage}
                />
              </div>
              <div className={styles.testimonialQuote}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                  <path
                    fillRule="evenodd"
                    d="M12 14a1 1 0 100-2 1 1 0 000 2zm0 6a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <section className={styles.testimonialRating}>
                <div className={styles.testimonialRatingStar}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
export default Home;