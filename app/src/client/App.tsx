import { useAuth } from 'wasp/client/auth';
import { updateCurrentUser } from 'wasp/client/operations';
import './Main.css';
import AppNavBar from './components/AppNavBar';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { useMemo, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SongProvider } from '../singme-app/context/SongContext';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: user } = useAuth();

  const shouldDisplayAppNavBar = useMemo(() => {
    return (
      location.pathname !== '/' &&
      location.pathname !== '/login' &&
      location.pathname !== '/signup' &&
      location.pathname !== '/create' &&
      location.pathname !== '/lyric-video' &&
      location.pathname !== '/transcribe'
    );
  }, [location]);

  const isAdminDashboard = useMemo(() => {
    return location.pathname.startsWith('/admin');
  }, [location]);

  const isUserDashboard = useMemo(() => {
    return location.pathname.startsWith('/create') || location.pathname.startsWith('/lyric-video') || location.pathname.startsWith('/transcribe');
  }, [location]);

  const isFullscreenVisualizerPage = useMemo(() => {
    return location.pathname.startsWith('/visualizer/');
  }, [location]);

  useEffect(() => {
    if (user) {
      const lastSeenAt = new Date(user.lastActiveTimestamp);
      const today = new Date();
      if (today.getTime() - lastSeenAt.getTime() > 5 * 60 * 1000) {
        updateCurrentUser({ lastActiveTimestamp: today });
      }
    }
  }, [user]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  return (
    <>
      <div className='min-h-screen dark:text-white dark:bg-boxdark-2'>
        {isAdminDashboard ? (
          <>{children}</>
        ) : isUserDashboard ? (
          <><SongProvider>{children}</SongProvider></>
        ) : (
          <>
            {shouldDisplayAppNavBar && !isFullscreenVisualizerPage && <AppNavBar />}
            <div className='mx-auto max-w-7xl sm:px-6 lg:px-8'>{children}</div>
          </>
        )}
      </div>
      <Toaster />
      {!isFullscreenVisualizerPage && <CookieConsentBanner />}
    </>
  );
}
