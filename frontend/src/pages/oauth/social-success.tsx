import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SocialSuccess(): React.ReactElement {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (token && typeof token === 'string') {
      localStorage.setItem('token', token);
      router.push('/dashboard');
    }
  }, [token, router]);

  return <div>Logging you in...</div>;
}
