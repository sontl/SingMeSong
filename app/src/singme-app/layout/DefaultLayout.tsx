import React, { useEffect, useState } from 'react';
import { type AuthUser } from 'wasp/auth';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingMusicPlayer from '../dashboards/FloatingMusicPlayer';

interface DefaultLayoutProps {
  user: AuthUser;
  children: React.ReactNode;
  hideFloatingPlayer?: boolean;
  isFullscreen?: boolean;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ user, children, hideFloatingPlayer = false, isFullscreen = false }) => {
  useEffect(() => {
    const mainElement = document.getElementById('defaultCanvas0');
    if (mainElement) {
      mainElement.remove();
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isFullscreen) {
    return <>{children}</>;
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
          <main className={!hideFloatingPlayer ? "pb-16" : "pb-0"}>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {!hideFloatingPlayer && <FloatingMusicPlayer />}
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
