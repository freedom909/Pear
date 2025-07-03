import { AppProps } from 'next/app';
// Since the original import path doesn't work, we need to check if the path is correct.
// It's possible the file has a different extension or location.
// Here we assume the file might have a .tsx extension.
import { UserProvider } from '../contexts/UserContext';
import '../styles/globals.css';
import { ReactElement } from 'react';

/**
 * Main application component that wraps all pages
 * 
 * @param {AppProps} props - Next.js app properties
 * @returns {ReactElement} The rendered app component
 */
function MyApp({ Component, pageProps }: AppProps): ReactElement {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;