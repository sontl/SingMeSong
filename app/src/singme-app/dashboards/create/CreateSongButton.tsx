import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createSong } from 'wasp/client/operations';
import { SunoPayload } from './types'; 
import type { Song } from 'wasp/entities';

interface CreateSongButtonProps {
  lyricsValue: string;
  musicStyleValue: string;
  titleValue: string;
}

const CreateSongButton: React.FC<CreateSongButtonProps> = ({ lyricsValue, musicStyleValue, titleValue }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const songs: Song[] = await createSong({
        prompt: lyricsValue,
        tags: musicStyleValue,
        title: titleValue,
      } as SunoPayload);
      console.log('songs: ', songs);
      // show toast
      toast.success('Song created successfully');
    } catch (error) {
      console.error('Error submitting song:', error);
      toast.error('Error submitting song');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`min-w-[7rem] font-medium ring-1 ring-inset ring-slate-200 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none flex items-center justify-center inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Song is creating...
        </>
      ) : (
        <>
          <span>
            <svg className='fill-current' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
              <path d='M10 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' />
              <path d='M17.5 0l1.5 4.5H24l-4 3 1.5 4.5-4-3-4 3 1.5-4.5-4-3h5z' />
              <path d='M21 10l1 3h3l-2.5 1.8 1 3-2.5-1.8-2.5 1.8 1-3-2.5-1.8h3z' />
            </svg>
          </span>
          Create Song
        </>
      )}
    </button>
  );
};

export default CreateSongButton;
