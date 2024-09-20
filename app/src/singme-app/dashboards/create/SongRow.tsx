import React, { useState } from 'react';
import { type Song } from 'wasp/entities';
import { FaSpinner } from 'react-icons/fa';

type SongRowProps = {
  song: Song;
  onSongSelect: (song: Song) => void;
  isCurrentSong: boolean;
  isPlaying: boolean;
  isAudioEnded: boolean; // Add this line
  togglePlay: (song: Song) => void;
};

const SongRow: React.FC<SongRowProps> = ({ song, onSongSelect, isCurrentSong, isPlaying, isAudioEnded, togglePlay }) => {
  const [isHovering, setIsHovering] = useState(false);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`rounded-md flex items-center cursor-pointer transition-colors duration-200 ${isHovering ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      onClick={() => onSongSelect(song)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className='relative w-24 h-24 mr-4'>
        <img 
          src={song.imageUrl || '/default-cover.png'} 
          alt={song.title} 
          className={`w-full h-full object-cover rounded-md ${isCurrentSong && isPlaying ? 'border-2 border-blue-500' : ''}`} 
        />
        {song.status.toLowerCase() === 'pending' ? (
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md'>
            <FaSpinner className='animate-spin text-white text-2xl' />
          </div>
        ) : (isCurrentSong && isPlaying && !isAudioEnded) || (song.status.toLowerCase() === 'completed' && isHovering) ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSongSelect(song);
              togglePlay(song);
            }}
            className='absolute inset-0 flex items-center justify-center'
          >
            <div className='w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full'>
              {isCurrentSong && isPlaying && !isHovering && !isAudioEnded ? (
                <div className="flex space-x-1 items-end h-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 bg-white animate-waveform" style={{animationDelay: `${i * 0.2}s`}}></div>
                  ))}
                </div>
              ) : (
                <svg className='w-10 h-10 text-white' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d={isCurrentSong && isPlaying && !isAudioEnded
                    ? 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
                    : 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
                  } clipRule='evenodd' />
                </svg>
              )}
            </div>
          </button>
        ) : null}
        <div className='absolute bottom-1 left-1 bg-black bg-opacity-60 text-gray-200 text-xs px-1 py-0.5 rounded'>
          {formatDuration(song.duration || 0)}
        </div>
      </div>
      <div>
        <h3 className='font-bold'>{song.title}</h3>
        <p className='text-sm text-gray-500'>{Array.isArray(song.tags) ? song.tags.join(', ') : song.tags}</p>
      </div>
    </div>
  );
};

export default SongRow;