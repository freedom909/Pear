import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // Store token locally
      localStorage.setItem('token', token);
      // Redirect wherever you want
      router.push('/');
    } else {
      console.error('No token in URL');
    }
  }, [router]);

  return <p>Processing login...</p>;
}
