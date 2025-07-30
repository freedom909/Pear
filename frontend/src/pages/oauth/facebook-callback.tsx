// frontend/src/pages/oauth/facebook-callback.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function FacebookCallback(): React.ReactElement {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const token = router.query.token;

    if (token && typeof token === 'string') {
      localStorage.setItem('auth_token', token);
      document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
      router.replace('/dashboard');
    } else {
      console.error("❌ No token found in query params");
      router.replace("/login?error=missing_token");
    }
  }, [router]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Signing you in with Facebook...</h2>
      <p>Please wait.</p>
    </div>
  );
}
