import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Dashboard.module.css';
import Image from 'next/image';
/**
 * 用户数据接口
 */
interface UserData {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

/**
 * 统计数据接口
 */
interface StatsData {
  totalPears: number;
  pearsPicked: number;
  pearsSold: number;
  revenue: number;
}

/**
 * 活动数据接口
 */
interface ActivityItem {
  id: string;
  type: 'harvest' | 'sale' | 'inspection' | 'maintenance';
  description: string;
  timestamp: string;
  amount?: number;
}

/**
 * 仪表盘页面组件
 *
 * @returns {JSX.Element} 渲染的仪表盘页面组件
 */
const Dashboard: NextPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [stats, setStats] = useState<StatsData>({
    totalPears: 0,
    pearsPicked: 0,
    pearsSold: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);

  useEffect(() => {
    if (!authChecked) return;

    // Fetch user data
    const fetchUserData = async (): Promise<void> => {
      try {
        // Get user data from localStorage
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          setUser({
            name: userInfo.name || 'User',
            email: userInfo.email || '',
            role: 'Orchard Manager', // Default role
            avatar: userInfo.avatar || '', // Will use fallback if empty
          });
        }

        // For now, we'll still use mock data for stats
        // In a real app, you would fetch this from your API
        setStats({
          totalPears: 1250,
          pearsPicked: 850,
          pearsSold: 720,
          revenue: 3600,
        });

          setRecentActivity([
            {
              id: '1',
              type: 'harvest',
              description: 'Harvested 150 pears from Section A',
              timestamp: '2023-09-15T10:30:00Z',
              amount: 150,
            },
            {
              id: '2',
              type: 'sale',
              description: 'Sold 200 pears to Local Market',
              timestamp: '2023-09-15T09:15:00Z',
              amount: 200,
            },
            {
              id: '3',
              type: 'inspection',
              description: 'Completed weekly orchard inspection',
              timestamp: '2023-09-14T16:45:00Z',
            },
            {
              id: '4',
              type: 'maintenance',
              description: 'Irrigation system maintenance',
              timestamp: '2023-09-14T14:20:00Z',
            },
          ]);

          setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  /**
   * 处理登出操作
   */
  const handleLogout = (): void => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  /**
   * 格式化时间戳为可读格式
   *
   * @param {string} timestamp - ISO格式的时间戳
   * @returns {string} 格式化后的时间字符串
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardHeader}>
          <div className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome back, {user?.name.split(' ')[0]}!
            </h1>
            <p className={styles.welcomeSubtitle}>
              Here is what is happening with your pear orchard today
            </p>
          </div>

          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <span className={styles.userRole}>{user?.role}</span>
              <span className={styles.userName}>{user?.name}</span>
            </div>

            <div className={styles.userAvatar}>
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {user?.name.charAt(0)}
                </div>
              )}
            </div>

            <button onClick={handleLogout} className={styles.logoutButton}>
              <svg
                className={styles.logoutIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                  clipRule="evenodd"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
            >
              <svg
                className={styles.icon}
                style={{ color: '#4f46e5' }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
                <path d="M13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statTitle}>Total Pears</h3>
              <p className={styles.statValue}>
                {stats.totalPears.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
            >
              <svg
                className={styles.icon}
                style={{ color: '#10b981' }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.5c.944-.945 2.56-.276 2.56 1.06V8h3v-1.44c0-1.336 1.616-2.005 2.56-1.06A4.975 4.975 0 0115 10a4.975 4.975 0 01-1.5 3.56c-.943.945-2.56.276-2.56-1.06V11h-3v1.44c0 1.336-1.616 2.005-2.56 1.06A4.975 4.975 0 015 10c0-1.374.56-2.615 1.46-3.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statTitle}>Pears Picked</h3>
              <p className={styles.statValue}>
                {stats.pearsPicked.toLocaleString()}
              </p>
              <p className={styles.statPercentage}>
                {Math.round((stats.pearsPicked / stats.totalPears) * 100)}% of
                total
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}
            >
              <svg
                className={styles.icon}
                style={{ color: '#f59e0b' }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 012 10z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statTitle}>Pears Sold</h3>
              <p className={styles.statValue}>
                {stats.pearsSold.toLocaleString()}
              </p>
              <p className={styles.statPercentage}>
                {Math.round((stats.pearsSold / stats.pearsPicked) * 100)}% of
                picked
              </p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
            >
              <svg
                className={styles.icon}
                style={{ color: '#06b6d4' }}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 011.653-.713V4.75A.75.75 0 0110 4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <h3 className={styles.statTitle}>Revenue</h3>
              <p className={styles.statValue}>
                ${stats.revenue.toLocaleString()}
              </p>
              <p className={styles.statPercentage}>
                ${(stats.revenue / stats.pearsSold).toFixed(2)} per pear
              </p>
            </div>
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div
                  className={styles.activityIcon}
                  style={{
                    backgroundColor:
                      activity.type === 'harvest'
                        ? '#e0f2fe'
                        : activity.type === 'sale'
                          ? '#ecfdf5'
                          : activity.type === 'inspection'
                            ? '#fef3c7'
                            : '#f3e8ff',
                    color:
                      activity.type === 'harvest'
                        ? '#0284c7'
                        : activity.type === 'sale'
                          ? '#059669'
                          : activity.type === 'inspection'
                            ? '#d97706'
                            : '#7e22ce',
                  }}
                >
                  {activity.type === 'harvest' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={styles.icon}
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  {activity.type === 'sale' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={styles.icon}
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  {activity.type === 'inspection' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={styles.icon}
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}

                  {activity.type === 'maintenance' && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={styles.icon}
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className={styles.activityDetails}>
                  <p className={styles.activityDescription}>
                    {activity.description}
                  </p>
                  <p className={styles.activityTime}>
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>

                {activity.amount && (
                  <div className={styles.activityAmount}>
                    <span className={styles.amountValue}>
                      {activity.amount}
                    </span>
                    <span className={styles.amountLabel}>pears</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className={styles.viewAllButton}>
            View All Activity
            <svg
              className={styles.arrowIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className={styles.quickActions}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>
              <svg
                className={styles.actionIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
              </svg>
              Record Harvest
            </button>
            <button className={styles.actionButton}>
              <svg
                className={styles.actionIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              Add Sale
            </button>
            <button className={styles.actionButton}>
              <svg
                className={styles.actionIcon}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;