import React from 'react';
import CustomTextarea from '../../elements/forms/CustomTextarea';
import SurpriseMeButton from './SurpriseMeButton';

interface LyricsProps {
  lyricsValue: string;
  handleLyricsChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setLyricsValue: React.Dispatch<React.SetStateAction<string>>;
  setMusicStyleValue: React.Dispatch<React.SetStateAction<string>>;
  setTitleValue: React.Dispatch<React.SetStateAction<string>>;
}

const Lyrics: React.FC<LyricsProps> = ({
  lyricsValue,
  handleLyricsChange,
  setLyricsValue,
  setMusicStyleValue,
  setTitleValue,
}) => {
  return (
    <div className='mb-5.5'>
      <label className='mb-3 block text-sm font-medium text-black dark:text-white' htmlFor='Username'>
        Lyrics
      </label>
      <div className='relative'>
        <span className='absolute left-4.5 top-4'>
          <svg
            className='fill-current'
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            {/* SVG content */}
          </svg>
        </span>
        <CustomTextarea
          id='lyricsTextarea'
          maxLength={3000}
          rows={16}
          placeholder='Enter your own lyrics or describe a song and click Write About... to generate lyrics'
          value={lyricsValue}
          onChange={handleLyricsChange}
        />
        <div className='absolute bottom-2 left-2'>
          <SurpriseMeButton
            setLyricsValue={setLyricsValue}
            setMusicStyleValue={setMusicStyleValue}
            setTitleValue={setTitleValue}
          />
        </div>
      </div>
    </div>
  );
};

export default Lyrics;
