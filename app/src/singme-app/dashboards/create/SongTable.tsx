import React, { useState } from 'react';
import { type Song } from 'wasp/entities';


type SongTableProps = {
  songs: Song[];
  isLoading: boolean;
  onSongSelect: (song: Song) => void;
};



const SongTable: React.FC<SongTableProps> = ({ songs, isLoading, onSongSelect }) => {
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

  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);

  const togglePlay = (audioUrl: string) => {
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
    } else {
      const audio = new Audio(audioUrl);
      audio.play();
      setPlayingAudio(audio);
    }
  };

  return (
    <div className='space-y-4'>
      {songs.map((song) => (
        <div key={song.id} className=' rounded-md flex items-center cursor-pointer' onClick={() => onSongSelect(song)}>
          <div className='relative w-24 h-24 mr-4'>
            <img src={song.imageUrl || '/default-cover.jpg'} alt={song.title} className='w-full h-full object-cover rounded-md' />
            {song.status.toLowerCase() === 'completed' ? (
              <button
                onClick={() => song.audioUrl && togglePlay(song.audioUrl)}
                className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md'
              >
                <svg className='w-12 h-12 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d={playingAudio ? 'M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v6a1 1 0 11-2 0V9z' : 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'} clipRule='evenodd' />
                </svg>
              </button>
            ) : (
              <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md'>
                <svg className='animate-spin h-8 w-8 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                  <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                  <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
              </div>
            )}
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