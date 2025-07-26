import { useEffect, useState } from 'react';
import axiosInstance from '../utils/axios'; // your configured Axios
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

 useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get('/auth/status', {
        withCredentials: true,
      });
      setIsAuthenticated(res.data.authenticated);
    } catch (err) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };
  checkAuth();
}, []);


  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Not authenticated</p>;

  return <Dashboard />;
};

export default DashboardPage;
