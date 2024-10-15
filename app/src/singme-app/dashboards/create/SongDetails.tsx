import React from 'react';
import { type Song, User } from 'wasp/entities';
import { FaTrash } from 'react-icons/fa';

type SongDetailsProps = {
  song: Song | null;
  onDeleteSong: () => void;
};

const SongDetails: React.FC<SongDetailsProps> = ({ song, onDeleteSong }) => {
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

  const showDownloadIcon = song.audioUrl && song.audioUrl.includes('.mp3');

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (song.audioUrl) {
      try {
        const response = await fetch(song.audioUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${song.title}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  return (
    <div className='space-y-4'>
      <img src={song.imageUrl || '/default-cover.png'} alt={song.title} className='w-full h-48 object-cover rounded-md' />
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>{song.title}</h2>
        <button
          onClick={onDeleteSong}
          className='relative group'
          aria-label="Delete Song"
        >
          <FaTrash className="h-5 w-5 text-red-500 hover:text-red-600" />
          <span className="absolute bottom-full right-0 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Delete Song
          </span>
        </button>
      </div>
      <p className='text-sm text-gray-500'>{Array.isArray(song.tags) ? song.tags.join(', ') : song.tags}</p>
      <div className='flex items-center'>
        <p className='text-sm text-gray-500'>Created: {new Date(song.createdAt).toLocaleDateString()}</p>
        {showDownloadIcon && (
          <a 
            href={song.audioUrl || ''} 
            onClick={handleDownload}
            className='ml-2 relative group'
            aria-label="Download MP3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Download MP3
            </span>
          </a>
        )}
      </div>
      <div>
        <h3 className='font-semibold mb-2'>Lyrics:</h3>
        <p className='whitespace-pre-wrap'>{song.lyric}</p>
      </div>
    </div>
  );
};

export default SongDetails;
