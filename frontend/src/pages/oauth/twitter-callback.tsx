import { useEffect } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
interface OAuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export default function TwitterCallback(): React.ReactElement {
  //Cannot find namespace 'JSX'
  const router = useRouter();

  useEffect(() => {
    // Automatically call the backend callback
    const fetchToken = async (): Promise<void> => {
      try {
        // Get oauth_token and oauth_verifier from URL query parameters
        const { oauth_token, oauth_verifier } = router.query;
        
        // Only proceed if we have the required parameters
        if (!oauth_token || !oauth_verifier) {
          console.error('Missing required OAuth parameters');
          router.replace('/login?error=missing_params');
          return;
        }
        
        // Call our proxy API with the required parameters
        const res = await fetch(`/api/proxy/twitter-callback?oauth_token=${oauth_token}&oauth_verifier=${oauth_verifier}`);
        const data: OAuthResponse = await res.json();

        if (data.success) {
          // Save token somewhere
          localStorage.setItem('token', data.token as string);
          // Optionally set cookie
          // document.cookie = `token=${data.token}; path=/;`;

          // Redirect to dashboard
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