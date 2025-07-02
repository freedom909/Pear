import { AppProps } from 'next/app';
import { UserProvider } from '../contexts/UserContext';
import { JSX } from 'react';
import '../styles/globals.css';

/**
 * 主应用组件，作为所有页面的包装器
 *
 * @param {AppProps} props - Next.js 应用属性
 * @returns {JSX.Element} 渲染的应用组件
 */
function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
