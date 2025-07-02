import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AppleCallback() {
  const router = useRouter();

  useEffect(() => {
    // Automatically call the backend callback
    const fetchToken = async () => {
      try {
        const res = await fetch('/api/proxy/apple-callback');
        const data = await res.json();

        if (data.success) {
          // Save token somewhere
          localStorage.setItem('token', data.token);
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
