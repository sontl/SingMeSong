import React, { createContext, useState, useRef, useEffect } from 'react';
import { type Song } from 'wasp/entities';

interface SongContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  isPlaying: boolean;
  togglePlay: (song: Song) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export const SongContext = createContext<SongContextType>({
  currentSong: null,
  setCurrentSong: () => {},
  isPlaying: false,
  togglePlay: () => {},
  audioRef: { current: null },
});

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      audioRef.current.src = song.audioUrl || '';
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  return (
    <SongContext.Provider value={{ currentSong, setCurrentSong, isPlaying, togglePlay, audioRef }}>
      {children} 
    </SongContext.Provider>
  );
};