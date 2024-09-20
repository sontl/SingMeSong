import React, { createContext, useState, useRef, useEffect } from 'react';
import { type Song } from 'wasp/entities';
import { getAllSongsByUser } from 'wasp/client/operations';

interface SongContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  isPlaying: boolean;
  togglePlay: (song: Song) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  allSongs: Song[];
  setAllSongs: (songs: Song[]) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  progress: number;
  duration: number;
}

export const SongContext = createContext<SongContextType>({
  currentSong: null,
  setCurrentSong: () => {},
  isPlaying: false,
  togglePlay: () => {},
  audioRef: { current: null },
  allSongs: [],
  setAllSongs: () => {},
  playNextSong: () => {},
  playPreviousSong: () => {},
  progress: 0,
  duration: 0,
});

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const fetchSongs = async () => {
      const songs = await getAllSongsByUser();
      setAllSongs(songs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    audioRef.current.addEventListener('timeupdate', updateProgress);
    return () => audioRef.current.removeEventListener('timeupdate', updateProgress);
  }, []);

  useEffect(() => {
    const updateDuration = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
    };
    audioRef.current.addEventListener('loadedmetadata', updateDuration);
    return () => audioRef.current.removeEventListener('loadedmetadata', updateDuration);
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

  const playNextSong = () => {
    if (currentSong && allSongs.length > 0) {
      const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % allSongs.length;
      setCurrentSong(allSongs[nextIndex]);
      togglePlay(allSongs[nextIndex]);
    }
  };

  const playPreviousSong = () => {
    if (currentSong && allSongs.length > 0) {
      const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
      const previousIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
      setCurrentSong(allSongs[previousIndex]);
      togglePlay(allSongs[previousIndex]);
    }
  };

  return (
    <SongContext.Provider value={{
      currentSong,
      setCurrentSong,
      isPlaying,
      togglePlay,
      audioRef,
      allSongs,
      setAllSongs,
      playNextSong,
      playPreviousSong,
      progress,
      duration,
    }}>
      {children}
    </SongContext.Provider>
  );
};