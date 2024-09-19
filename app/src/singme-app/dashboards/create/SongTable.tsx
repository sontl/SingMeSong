import React, { useState, useRef, useEffect } from 'react';
import { type Song } from 'wasp/entities';
import { FaSpinner } from 'react-icons/fa';

type SongTableProps = {
  songs: Song[];
  isLoading: boolean;
  onSongSelect: (song: Song) => void;
};

const SongTable: React.FC<SongTableProps> = ({ songs, isLoading, onSongSelect }) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setPlayingSongId(null);
    
    audio?.addEventListener('ended', handleEnded);
    
    return () => {
      audio?.removeEventListener('ended', handleEnded);
    };
  }, [playingSongId]);

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight;
    }
  }, [songs]);

  const togglePlay = (song: Song, audioUrl: string) => {
    if (playingSongId === song.id) {
      audioRef.current?.pause();
      setPlayingSongId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setPlayingSongId(song.id);
      onSongSelect(song); // Call onSongSelect when playing a song
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sortedSongs = [...songs].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (songs.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <svg className='w-16 h-16 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' />
        </svg>
        <p className='mt-4 text-gray-500 dark:text-gray-400'>There are no songs created yet</p>
      </div>
    );
  }

  return (
    <div ref={tableRef} className='space-y-4 h-[calc(100vh-200px)] overflow-y-auto'>
      {sortedSongs.map((song) => (
        <div key={song.id} className='rounded-md flex items-center cursor-pointer' onClick={() => onSongSelect(song)}>
          <div className='relative w-24 h-24 mr-4'>
            <img src={song.imageUrl || '/default-cover.png'} alt={song.title} className='w-full h-full object-cover rounded-md' />
            {song.status.toLowerCase() === 'pending' ? (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md'>
                <FaSpinner className='animate-spin text-white text-2xl' />
              </div>
            ) : song.status.toLowerCase() === 'completed' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  song.audioUrl && togglePlay(song, song.audioUrl);
                }}
                onMouseEnter={() => setIsHovering(song.id)}
                onMouseLeave={() => setIsHovering(null)}
                className='absolute inset-0 flex items-center justify-center'
              >
                <div className='w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full'>
                  {playingSongId === song.id && isHovering !== song.id ? (
                    <div className="flex space-x-1 items-end h-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-1 bg-white animate-waveform" style={{animationDelay: `${i * 0.2}s`}}></div>
                      ))}
                    </div>
                  ) : (
                    <svg className='w-10 h-10 text-white' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d={playingSongId === song.id
                        ? 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                        : 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                      } clipRule='evenodd' />
                    </svg>
                  )}
                </div>
              </button>
            )}
            <div className='absolute bottom-1 left-1 bg-black bg-opacity-60 text-gray-200 text-xs px-1 py-0.5 rounded'>
              {formatDuration(song.duration || 0)}
            </div>
          </div>
          <div>
            <h3 className='font-bold'>{song.title}</h3>
            <p className='text-sm text-gray-500'>{Array.isArray(song.tags) ? song.tags.join(', ') : song.tags}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongTable;