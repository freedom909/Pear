import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create the context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  return useContext(UserContext);
};

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await api.get('/api/user');
      setUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user data');
      setLoading(false);
      
      // If unauthorized, clear token
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
      }
    }
  };

  // Function to handle logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check authentication status on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Value to be provided to consumers
  const value = {
    user,
    loading,
    error,
    fetchUserData,
    logout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};