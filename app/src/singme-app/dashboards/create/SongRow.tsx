import React, { useState } from 'react';
import { type Song } from 'wasp/entities';
import { FaSpinner, FaPlay, FaPause } from 'react-icons/fa';

type SongRowProps = {
  song: Song;
  onSongSelect: (song: Song) => void;
  isCurrentSong: boolean;
  isPlaying: boolean;
  isAudioEnded: boolean; // Add this line
  togglePlay: (song: Song) => void;
  isAudioLoading: boolean;
};

const SongRow: React.FC<SongRowProps> = ({ song, onSongSelect, isCurrentSong, isPlaying, isAudioEnded, togglePlay, isAudioLoading }) => {
  const [isHovering, setIsHovering] = useState(false);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const showControls = isCurrentSong || isHovering  ;

  return (
    <div 
      className={`rounded-md flex items-center cursor-pointer transition-colors duration-200 ${isHovering ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
      onClick={() => onSongSelect(song)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className='relative w-20 h-20 flex-shrink-0 mr-4'>
        <img 
          src={song.imageUrl || '/default-cover.png'} 
          alt={song.title} 
          className={`w-20 h-20 object-cover rounded-md ${isCurrentSong && isPlaying ? 'border-2 border-blue-500' : ''}`} 
        />
        {song.status.toLowerCase() === 'pending' ? (
          <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md'>
            <FaSpinner className='animate-spin text-white text-2xl' />
          </div>
        ) : showControls || (isCurrentSong && isPlaying) ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSongSelect(song);
              togglePlay(song);
            }}
            className='absolute inset-0 flex items-center justify-center'
          >
            <div className='w-12 h-12 flex items-center justify-center bg-black bg-opacity-50 rounded-full'>
              {!isCurrentSong && isAudioLoading ? (
                <FaSpinner className="animate-spin text-white" />
              ) : isCurrentSong && isPlaying ? (
                isHovering ? (
                  <FaPause className='text-white' />
                ) : (
                  <div className="flex space-x-1 items-end h-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-1 bg-white animate-waveform" style={{animationDelay: `${i * 0.2}s`}}></div>
                    ))}
                  </div>
                )
              ) : (
                <FaPlay className='text-white' />
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