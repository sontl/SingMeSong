import React, { useState } from 'react';
import { generateRandomLyrics } from 'wasp/client/operations';

interface SurpriseMeButtonProps {
  setLyricsValue: (value: string) => void;
  setMusicStyleValue: (value: string) => void;
  setTitleValue: (value: string) => void;
}

const SurpriseMeButton: React.FC<SurpriseMeButtonProps> = ({ setLyricsValue, setMusicStyleValue, setTitleValue }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const { lyrics, musicStyle, title } = await generateRandomLyrics({});
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
      {isLoading ? 'Loading...' : 'Surprise Me'}
    </button>
  );
};

export default SurpriseMeButton;
