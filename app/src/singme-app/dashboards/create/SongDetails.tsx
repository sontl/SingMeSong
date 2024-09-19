import React from 'react';
import { type Song, User } from 'wasp/entities';

type SongDetailsProps = {
  song: Song | null;
};

const SongDetails: React.FC<SongDetailsProps> = ({ song }) => {
  if (!song) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <svg className='w-16 h-16 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
        </svg>
        <p className='mt-4 text-gray-500 dark:text-gray-400'>Select a song to view details</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <img src={song.imageUrl || '/default-cover.jpg'} alt={song.title} className='w-full h-48 object-cover rounded-md' />
      <h2 className='text-2xl font-bold'>{song.title}</h2>
      <p className='text-sm text-gray-500'>{Array.isArray(song.tags) ? song.tags.join(', ') : song.tags}</p>
      <p className='text-sm text-gray-500'>Created: {new Date(song.createdAt).toLocaleDateString()}</p>
      <div>
        <h3 className='font-semibold mb-2'>Lyrics:</h3>
        <p className='whitespace-pre-wrap'>{song.lyric}</p>
      </div>
    </div>
  );
};

export default SongDetails;