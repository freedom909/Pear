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
 const { token } = router.query;
  useEffect(() => {
    if (!router.isReady) return; // Wait for router to be ready
    if (token && typeof token === "string") {
      // Store in localStorage for client-side auth
    localStorage.setItem('auth_token', token);
    // Store in a cookie (NOT httpOnly)
    document.cookie = `auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
    router.replace('/dashboard');
    }

    console.error("❌ No token found in query params");
    router.replace("/login?error=missing_token");
  }, [router.isReady, token, router]);//Cannot find name 'token'.

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Signing you in with Google...</h2>
      <p>Please wait.</p>
    </div>
  );
}

