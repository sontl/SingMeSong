import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp } from 'react-icons/fa';
import { SongContext } from '../context/SongContext';

const FloatingMusicPlayer: React.FC = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    playNextSong, 
    playPreviousSong, 
    progress, 
    audioRef, 
    duration,
    isAudioEnded,
    setIsAudioEnded
  } = useContext(SongContext);

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(100);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const handleVolumeClick = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeSliderRef.current) {
      const rect = volumeSliderRef.current.getBoundingClientRect();
      const height = rect.height;
      const y = e.clientY - rect.top;
      const newVolume = Math.round(((height - y) / height) * 100);
      setVolume(Math.max(0, Math.min(100, newVolume)));
      
      // Update actual audio volume
      if (audioRef.current) {
        audioRef.current.volume = newVolume / 100;
      }
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const progressBarWidth = rect.width;
      const clickPercentage = clickPosition / progressBarWidth;
      const newTime = clickPercentage * duration;
      
      audioRef.current.currentTime = newTime;
    }
  };

  const handlePlayPause = () => {
    if (isAudioEnded) {
      setIsAudioEnded(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
    if (currentSong) {
      togglePlay(currentSong);
    }
  };

  const handleNextSong = () => {
    playNextSong();
    setIsAudioEnded(false);
  };

  const handlePreviousSong = () => {
    playPreviousSong();
    setIsAudioEnded(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeSliderRef.current && !volumeSliderRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-center z-50 player-width">
      <div 
        ref={progressBarRef}
        className="w-full h-2 bg-gray-300 dark:bg-gray-600 cursor-pointer relative hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors" 
        onClick={handleProgressBarClick}
      >
        <div 
          className="absolute top-0 left-0 h-full bg-blue-600 dark:bg-blue-400 transition-all duration-100" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="player-content px-4 h-16 flex justify-between items-center">
        <div className="player-song-info flex items-center flex-1">
          <img src={currentSong.imageUrl || '/default-cover.jpg'} alt={currentSong.title} className="w-12 h-12 rounded-md mr-4" />
          <div className="player-song-title">
            <h3 className="text-sm font-semibold md:truncate animate-marquee">{currentSong.title}</h3>
          </div>
        </div>
        <div className="player-controls-wrapper flex items-center justify-center flex-1">
          <div className="player-controls space-x-4">
            <button onClick={handlePreviousSong} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <FaStepBackward />
            </button>
            <button onClick={handlePlayPause} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              {isPlaying && !isAudioEnded ? <FaPause /> : <FaPlay />}
            </button>
            <button onClick={handleNextSong} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <FaStepForward />
            </button>
          </div>
        </div>
        <div className="player-volume flex items-center justify-end flex-1">
          <div className="hidden md:flex items-center mr-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{formatTime(progress * duration / 100)}</span>
            <span className="mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative">
            <button onClick={handleVolumeClick} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <FaVolumeUp />
            </button>
            {showVolumeSlider && (
              <div
                ref={volumeSliderRef}
                className="absolute bottom-full mb-2 w-6 h-24 bg-white dark:bg-gray-700 rounded-full shadow-lg cursor-pointer"
                onClick={handleVolumeChange}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-full"
                  style={{ height: `${volume}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingMusicPlayer;