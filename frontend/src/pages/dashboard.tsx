// pages/dashboard.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import styles from '../styles/Dashboard.module.css';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';

/**
 * Stats and Activity Interfaces
 */
interface StatsData {
  totalPears: number;
  pearsPicked: number;
  pearsSold: number;
  revenue: number;
}

interface ActivityItem {
  id: string;
  type: 'harvest' | 'sale' | 'inspection' | 'maintenance';
  description: string;
  timestamp: string;
  amount?: number;
}

interface UserData {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

/**
 * Dashboard Page Component
 */
const Dashboard: NextPage = () => {
  const router = useRouter();
  const { authToken, logout } = useAuth();

  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<StatsData>({
    totalPears: 0,
    pearsPicked: 0,
    pearsSold: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');

        let data: any = null;

        if (authToken) {
          const response = await fetch('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          if (!response.ok) throw new Error('Failed to fetch user data');
          data = await response.json();
        } else {
          const userStr = localStorage.getItem('userInfo');
          if (userStr) {
            data = JSON.parse(userStr);
          } else {
            router.push('/login');
            return;
          }
        }

        setUser({
          name: data.name || 'User',
          email: data.email || '',
          role: 'Orchard Manager',
          avatar: data.avatar || '',
        });

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
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authToken, router]);

  const handleLogout = (): void => {
    logout();
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    router.push('/login');
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
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
              Here is what is happening with your pear orchard today.
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
              Logout
            </button>
          </div>
        </div>

        {/* Add your stats and recent activity sections below */}
        {/* Example:
        <StatsSection stats={stats} />
        <ActivitySection activities={recentActivity} formatTimestamp={formatTimestamp} />
        */}
      </div>
    </Layout>
  );
};

export default Dashboard;
