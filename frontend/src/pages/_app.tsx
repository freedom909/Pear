// pages/_app.tsx
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext'; // adjust path

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
