import { UserProvider } from '../contexts/UserContext';
import Navigation from '../components/Navigation';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Navigation />
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;