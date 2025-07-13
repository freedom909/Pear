import { GetServerSideProps } from 'next';
import jwt from 'jsonwebtoken';
import LogoutButton from "../components/LogoutButton";

interface DashboardProps {
  userEmail: string | null;
}

export default function Dashboard({ userEmail }: DashboardProps) {
  if (!userEmail) {
    // Fallback if somehow rendered without redirect
    return <p>Not authenticated.</p>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>Welcome to your dashboard!</h1>
      <p>Your email: {userEmail}</p>
        <LogoutButton />
    </div>
  );
}

// This runs **server-side** on every request:
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { auth_token } = req.cookies;

  console.log('📦 Incoming cookies:', req.cookies);

  if (!auth_token) {
    console.warn('⚠️ No auth_token cookie found');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(auth_token, process.env.JWT_SECRET!);
    console.log('✅ Decoded JWT:', decoded);

    return { props: { userEmail: (decoded as any).email || null } };
  } catch (error: any) {
    console.error('❌ JWT verification failed:', error.message);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};


