import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface OAuthResponse {
  success: boolean;
  user?: {
    username: {
      firstname: string;
      lastname: string;
    };
    avatar: string;
    email: string;
  };
  token?: string;
  message?: string;
}

export default function GoogleCallback(): React.ReactElement {
  const router = useRouter();

  useEffect(() => {
    // Automatically call the backend callback
    const fetchToken = async (): Promise<void> => {
      try {
        // Get code and state from URL query parameters
        const { code, state } = router.query;
        
        // Only proceed if we have the required parameters
        if (!code || !state) {
          console.error('Missing required OAuth parameters');
          router.replace('/login?error=missing_params');
          return;
        }
        
        // Call our proxy API with the required parameters
        const res = await fetch(`/api/proxy/google-callback?code=${code}&state=${state}`);
        const data: OAuthResponse = await res.json();

                  if (data.success) {
                  // Save token
                  localStorage.setItem('token', data.token as string);
                  
                  // Extract user info from backend response
                  const userInfo = {
                    name: `${data.user.username.firstname} ${data.user.username.lastname}`,
                    email: data.user.email,
                    avatar: data.user.avatar || '', // Use avatar if available, otherwise empty string
                  };
                  
                  localStorage.setItem('userInfo', JSON.stringify(userInfo));
                  router.replace('/dashboard');
        } else {
          router.replace('/login?error=oauth_failed');
        }
      } catch (error) {
        console.error('OAuth error', error);
        router.replace('/login?error=oauth_error');
      }
    };

    fetchToken();
  }, [router]);

  return <div>Signing you in...</div>;
}