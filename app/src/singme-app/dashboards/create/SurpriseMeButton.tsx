import React, { useState } from 'react';
import { generateRandomLyrics } from 'wasp/client/operations';

interface SurpriseMeButtonProps {
  lyricsValue: string;
  setLyricsValue: (value: string) => void;
  setMusicStyleValue: (value: string) => void;
  setTitleValue: (value: string) => void;
}

const SurpriseMeButton: React.FC<SurpriseMeButtonProps> = ({
  lyricsValue,
  setLyricsValue,
  setMusicStyleValue,
  setTitleValue,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const { lyrics, musicStyle, title } = await generateRandomLyrics({ chat: lyricsValue });
      setLyricsValue(lyrics);
      setMusicStyleValue(musicStyle);
      setTitleValue(title);
    } catch (error) {
      console.error('Error generating random lyrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className='m-2 min-w-[4rem] font-medium text-gray-800/90 bg-yellow-50 rounded-full py-1.5 px-3 hover:bg-yellow-100 duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none flex items-center justify-center  dark:bg-meta-5/10  dark:text-white  dark:hover:bg-meta-5/30'
      type='button'
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        'Loading...'
      ) : lyricsValue.trim() === '' ? (
        <>
          <span className='mr-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='w-4 h-4 inline'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z'
              />
            </svg>
          </span>
          <span className='text-sm'>Surprise Me</span> {/* Added text-sm class */}
        </>
      ) : (
        <span className='text-sm'>Write about: {lyricsValue.slice(0, 10)}...</span>
      )}
    </button>
  );
};

export default SurpriseMeButton;
