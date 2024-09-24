import React, { createContext, useState, useRef, useEffect } from 'react';
import { type Song } from 'wasp/entities';
import { getAllSongsByUser, fetchAndUpdateSongDetails } from 'wasp/client/operations';
import p5 from 'p5';

// Add this type
type CurrentPage = 'create' | 'lyricVideo' | 'other';

interface SongContextType {
  currentSong: Song | null;
  setCurrentSong: (song: Song | null) => void;
  isPlaying: boolean;
  togglePlay: (song: Song) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsAudioEnded: (isEnded: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  allSongs: Song[];
  setAllSongs: (songs: Song[]) => void;
  playNextSong: () => void;
  playPreviousSong: () => void;
  progress: number;
  duration: number;
  isAudioEnded: boolean;
  handleAudioEnded: () => void;
  isAudioLoading: boolean;
  setIsAudioLoading: (isLoading: boolean) => void;
  p5SoundRef: React.RefObject<any>; // Add this line
  currentPage: CurrentPage;
  setCurrentPage: (page: CurrentPage) => void;
  resetContext: () => void; // Add this new function
  stopP5Sound: () => void; // Add this new function
}

export const SongContext = createContext<SongContextType>({
  currentSong: null,
  setCurrentSong: () => {},
  isPlaying: false,
  togglePlay: () => {},
  setIsPlaying: () => {},
  setIsAudioEnded: () => {},
  audioRef: { current: null },
  allSongs: [],
  setAllSongs: () => {},
  playNextSong: () => {},
  playPreviousSong: () => {},
  progress: 0,
  duration: 0,
  isAudioEnded: false,
  handleAudioEnded: () => {},
  isAudioLoading: false,
  setIsAudioLoading: () => {},
  p5SoundRef: { current: null }, // Add this line
  currentPage: 'other',
  setCurrentPage: () => {},
  resetContext: () => {}, // Add this new function
  stopP5Sound: () => {}, // Add this new function
});

export const SongProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioEnded, setIsAudioEnded] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<CurrentPage>('other');
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const p5SoundRef = useRef<any>(null); // Add this line

  const stopP5Sound = () => {
    if (p5SoundRef.current && p5SoundRef.current.isPlaying()) {
      p5SoundRef.current.stop();
      setIsPlaying(false);
    }
  };

  const resetContext = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setIsAudioEnded(false);
    setIsAudioLoading(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (p5SoundRef.current) {
      p5SoundRef.current.stop();
    }
    stopP5Sound();
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('p5/lib/addons/p5.sound').then(() => {
        p5SoundRef.current = new p5.SoundFile(audioRef.current.src);
      });
    }
  }, []);

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
      } else if (p5SoundRef.current && p5SoundRef.current.isLoaded()) {
        setProgress((p5SoundRef.current.currentTime() / p5SoundRef.current.duration()) * 100);
      }
    };
    audioRef.current.addEventListener('timeupdate', updateProgress);
    if (p5SoundRef.current && p5SoundRef.current.addEventListener) {
      p5SoundRef.current.addEventListener('timeupdate', updateProgress);
    }
    return () => audioRef.current.removeEventListener('timeupdate', updateProgress);
  }, []);

  useEffect(() => {
    const updateDuration = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
      }
      if (p5SoundRef.current && p5SoundRef.current.isLoaded()) {
        setDuration(p5SoundRef.current.duration());
      }
    };

    const checkAndUpdateDuration = () => {
      if (audioRef.current && audioRef.current.duration) {
        updateDuration();
      }
      if (p5SoundRef.current && p5SoundRef.current.isLoaded()) {
        updateDuration();
      }
    };

    // Initial check
    checkAndUpdateDuration();

    // Set up event listeners
    audioRef.current?.addEventListener('loadedmetadata', updateDuration);
    
    // For p5Sound, we need to poll because it doesn't have a 'loadedmetadata' event
    const intervalId = setInterval(checkAndUpdateDuration, 100);

    return () => {
      audioRef.current?.removeEventListener('loadedmetadata', updateDuration);
      clearInterval(intervalId);
    };
  }, []);

  const togglePlay = async (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        if (currentPage === 'lyricVideo') {
          p5SoundRef.current?.pause();
        } else {
          audioRef.current.pause();
        }
        setIsPlaying(false);
      } else {
        try {
          if (currentPage === 'lyricVideo') {
            await p5SoundRef.current?.play();
          } else {
            await audioRef.current.play();
          }
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    } else {
      // Stop current song
      if (currentPage === 'lyricVideo') {
        console.log('togglePlay 1', currentSong?.id, song.id);
        p5SoundRef.current?.stop();
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      audioRef.current.innerHTML = '';
      audioRef.current.removeAttribute('src');
      setIsAudioLoading(true);

      if (song.audioUrl) {
        if (currentPage === 'lyricVideo') {
          p5SoundRef.current = new p5.SoundFile(song.audioUrl, 
            () => {
              console.log('togglePlay 3', currentSong?.id, song.id);
              p5SoundRef.current?.play();
              setCurrentSong(song);
              setIsPlaying(true);
              setIsAudioLoading(false);
            },
            (error) => {
              console.error('Error loading audio:', error);
              setIsPlaying(false);
              setIsAudioLoading(false);
            }
          );
        } else {
          audioRef.current.load();
          if (song.audioUrl.includes('audiopipe')) {
            // Reset the audio element
            console.log('togglePlay 4', currentSong?.id, song.id);
            console.log('song.audioUrl', song.audioUrl);
            audioRef.current.innerHTML = `<source src="${song.audioUrl}" type="audio/mp3">`;
          } else {
            audioRef.current.src = song.audioUrl;
            
          }
          try {
            await audioRef.current.play();
            setCurrentSong(song);
            setIsPlaying(true);
          } catch (error: any) {
            if (error.name === 'AbortError') {
              console.log('AbortError occurred, fetching latest song details');
              try {
                const updatedSong = await fetchAndUpdateSongDetails(song.sId!);
                setCurrentSong(updatedSong);
                // Retry playing the audio by running tooglePlay again
                togglePlay(updatedSong);
                setIsPlaying(true);
              } catch (fetchError) {
                console.error('Error fetching and updating song details:', fetchError);
              }
            } else {
              console.error('Error playing audio:', error);
              setIsPlaying(false);
            }
          } finally {
            setIsAudioLoading(false);
          }
        }
      }
    }
    };

  const playNextSong = () => {
    if (currentSong && allSongs.length > 0) {
      const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % allSongs.length;
      setCurrentSong(allSongs[nextIndex]);
      togglePlay(allSongs[nextIndex]);
      setIsAudioEnded(false);
    }
  };

  const playPreviousSong = () => {
    if (currentSong && allSongs.length > 0) {
      const currentIndex = allSongs.findIndex(song => song.id === currentSong.id);
      const previousIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
      setCurrentSong(allSongs[previousIndex]);
      togglePlay(allSongs[previousIndex]);
      setIsAudioEnded(false);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setIsAudioEnded(true);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnded);
    }
    if (p5SoundRef.current) {
      p5SoundRef.current.addEventListener('ended', handleAudioEnded);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleAudioEnded);
      }
      if (p5SoundRef.current) {
        // check if p5SoundRef.current.removeEventListener is not null and is a function
        if (p5SoundRef.current.removeEventListener && typeof p5SoundRef.current.removeEventListener === 'function') {
          p5SoundRef.current.removeEventListener('ended', handleAudioEnded);
        }
      }
    };
  }, [audioRef]);
  

  return (
    <SongContext.Provider value={{
      currentSong,
      setCurrentSong,
      isPlaying,
      togglePlay,
      setIsPlaying,
      setIsAudioEnded,
      audioRef,
      allSongs,
      setAllSongs,
      playNextSong,
      playPreviousSong,
      progress,
      duration,
      isAudioEnded,
      handleAudioEnded,
      isAudioLoading,
      setIsAudioLoading,
      p5SoundRef, // Add this line
      currentPage,
      setCurrentPage,
      resetContext, // Add this new function
      stopP5Sound, // Add this new function
    }}>
      {children}
    </SongContext.Provider>
  );
};
