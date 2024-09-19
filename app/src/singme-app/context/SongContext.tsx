import React, { createContext, useState } from 'react';
import { type Song } from 'wasp/entities';

interface SongContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
}

export const SongContext = createContext<SongContextType>({
  currentSong: null,
  setCurrentSong: () => {},
});

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  return (
    <SongContext.Provider value={{ currentSong, setCurrentSong }}>
      {children} 
    </SongContext.Provider>
  );
};