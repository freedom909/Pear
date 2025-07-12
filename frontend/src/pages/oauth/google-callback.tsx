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
    if (!router.isReady) return; // Wait for router to be ready

    const { token } = router.query;

    if (token && typeof token === "string") {
      console.log("✅ Received token in query:", token);
      localStorage.setItem("auth_token", token);
      router.replace("/dashboard");
      return;
    }

    console.error("❌ No token found in query params");
    router.replace("/login?error=missing_token");
  }, [router.isReady, router]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Signing you in with Google...</h2>
      <p>Please wait.</p>
    </div>
  );
}

