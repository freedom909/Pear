import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

export default function SocialSuccess(): React.ReactElement {
  const router = useRouter();
  const { token, error } = router.query;
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const handleAuth = async () => {
      try {
        if (error) {
          throw new Error(typeof error === 'string' ? error : 'Authentication failed');
        }

        if (!token) {
          throw new Error('No authentication token received');
        }

        if (typeof token !== 'string') {
          throw new Error('Invalid token format');
        }

        localStorage.setItem('token', token);
        await router.push('/dashboard');
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message);
          setLoading(false);
          // Optionally redirect to login page after delay
          setTimeout(() => router.push('/login'), 3000);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [token, error, router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      {loading ? (
        <>
          <CircularProgress />
          <Typography variant="body1" mt={2}>
            Logging you in...
          </Typography>
        </>
      ) : errorMessage ? (
        <Typography color="error">{errorMessage}</Typography>
      ) : null}
    </Box>
  );
}