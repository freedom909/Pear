import { useEffect } from 'react';
import Head from 'next/head';
import { UserProvider } from '../contexts/UserContext';
import '../styles/globals.css';

/**
 * Custom App Component
 *
 * Wraps the entire application with providers and global styles
 *
 * @param {Object} props - Component props
 * @param {React.ComponentType} props.Component - The active page component
 * @param {Object} props.pageProps - Props for the page component
 * @returns {JSX.Element} - Rendered application
 */
function MyApp({ Component, pageProps }) {
  // Remove the server-side injected CSS (for Material-UI if used)
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement.removeChild(jssStyles);
    }
  }, []);

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <>
      <Head>
        <title>梨子 - 您的个人助手</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <meta
          name="description"
          content="梨子 - 您的个人助手，帮助您管理日常任务和提高生产力"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <UserProvider>{getLayout(<Component {...pageProps} />)}</UserProvider>
    </>
  );
}

export default MyApp;
