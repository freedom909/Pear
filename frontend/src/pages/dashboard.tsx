// pages/dashboard.tsx
import { useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Not authenticated</p>;

  return <Dashboard />;
};

export default DashboardPage;
