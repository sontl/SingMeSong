import React, { useState, useContext } from 'react';
import { type AuthUser } from 'wasp/auth';
import Header from './Header';
import Sidebar from './Sidebar';
import FloatingMusicPlayer from '../dashboards/FloatingMusicPlayer';
import { SongContext } from '../context/SongContext';

interface DefaultLayoutProps {
  user: AuthUser;
  children: React.ReactNode;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ user, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentSong, setCurrentSong } = useContext(SongContext);

  console.log(currentSong);
  const handlePlay = () => {
    // Logic for playing the song
  };

  const handlePause = () => {
    // Logic for pausing the song
  };

  const handleNext = () => {
    // Logic for playing the next song
  };

  const handlePrevious = () => {
    // Logic for playing the previous song
  };

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />
          <main  className="pb-16">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
              {currentSong && (
        <FloatingMusicPlayer
          currentSong={currentSong}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
            </div>
          </main>
        </div>
      </div>
      
    </div>
  );
};

export default DefaultLayout;
