import React, { useContext } from 'react';
import { type Song } from 'wasp/entities';
import { SongContext } from '../../context/SongContext';
import SongRow from './SongRow';

type SongTableProps = {
  songs: Song[];
  isLoading: boolean;
  onSongSelect: (song: Song) => void;
};

const SongTable: React.FC<SongTableProps> = ({ songs, isLoading, onSongSelect }) => {
  const { currentSong, isPlaying, togglePlay } = useContext(SongContext);

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
    <div className='space-y-4'>
      {sortedSongs.map((song) => (
        <SongRow
          key={song.id}
          song={song}
          onSongSelect={onSongSelect}
          isCurrentSong={currentSong?.id === song.id}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
        />
      ))}
    </div>
  );
};

export default SongTable;