import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaSpinner } from 'react-icons/fa';
import { SongContext } from '../../context/SongContext';

const P5MusicPlayer: React.FC = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    playNextSong, 
    playPreviousSong, 
    p5SoundRef,
    isAudioEnded,
    setIsAudioEnded,
    isAudioLoading,
    setIsAudioLoading,
    duration
  } = useContext(SongContext);

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [volume, setVolume] = useState(100);
  const volumeSliderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (p5SoundRef.current) {
   
      p5SoundRef.current.setVolume(volume / 100);
    }
  }, [volume, p5SoundRef]);

  useEffect(() => {
  
    const updateTime = () => {
      if (p5SoundRef.current && p5SoundRef.current.isLoaded()) {
        setCurrentTime(p5SoundRef.current.currentTime());
        setProgress((p5SoundRef.current.currentTime() / p5SoundRef.current.duration()) * 100);
      }
    };

    const intervalId = setInterval(updateTime, 100);
    return () => clearInterval(intervalId);
  }, [p5SoundRef]);


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
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && p5SoundRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickPosition = e.clientX - rect.left;
      const progressBarWidth = rect.width;
      const clickPercentage = clickPosition / progressBarWidth;
      const newTime = clickPercentage * duration;
      
      p5SoundRef.current.jump(newTime);
    }
  };

  const handlePlayPause = async () => {
    
    console.log('handlePlayPause called', { isAudioEnded, currentSong: currentSong?.id });
    if (isAudioEnded) {
      setIsAudioEnded(false);
      if (p5SoundRef.current) {
        console.log('Jumping to start of song');
        p5SoundRef.current.jump(0);
      }
    }
    if (currentSong) {
      setIsAudioLoading(true);
      try {
        await togglePlay(currentSong);
      } catch (error) {
        console.error('Error toggling play:', error);
      } finally {
        setIsAudioLoading(false);
      }
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
    if (!isFinite(time) || time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formattedCurrentTime = formatTime(currentTime);
  const totalDuration = formatTime(duration);

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
              {isAudioLoading ? (
                <FaSpinner className="animate-spin" />
              ) : isPlaying && !isAudioEnded ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </button>
            <button onClick={handleNextSong} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
              <FaStepForward />
            </button>
          </div>
        </div>
        <div className="player-volume flex items-center justify-end flex-1">
          <div className="hidden md:flex items-center mr-4 text-sm text-gray-600 dark:text-gray-300">
            <span>{formattedCurrentTime}</span>
            <span className="mx-1">/</span>
            <span>{totalDuration}</span>
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

export default P5MusicPlayer;