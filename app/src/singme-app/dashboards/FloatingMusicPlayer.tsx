import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward } from 'react-icons/fa';
import { type Song } from 'wasp/entities';

interface FloatingMusicPlayerProps {
  currentSong: Song | null;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const FloatingMusicPlayer: React.FC<FloatingMusicPlayerProps> = ({
  currentSong,
  onPlay,
  onPause,
  onNext,
  onPrevious
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (currentSong && currentSong.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
      audioRef.current = new Audio(currentSong.audioUrl);
      audioRef.current.addEventListener('timeupdate', updateProgress);
      audioRef.current.addEventListener('ended', handleEnded);
      if (isPlaying) {
        audioRef.current.play();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', updateProgress);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, [currentSong]);

  const updateProgress = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    onNext();
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      onPause();
    } else {
      audioRef.current?.play();
      onPlay();
    }
    setIsPlaying(!isPlaying);
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg flex flex-col justify-center z-50 player-width">
      <div className="w-full h-1 bg-gray-200">
        <div className="h-full bg-blue-600" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center flex-1">
          <img src={currentSong.imageUrl || '/default-cover.jpg'} alt={currentSong.title} className="w-12 h-12 rounded-md mr-4" />
          <div className="flex-grow max-w-xs">
            <h3 className="text-sm font-semibold truncate">{currentSong.title}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onPrevious} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
            <FaStepBackward />
          </button>
          <button onClick={togglePlayPause} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button onClick={onNext} className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white">
            <FaStepForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingMusicPlayer;