import React from 'react';
import CustomTextarea from '../../elements/forms/CustomTextarea';

interface LyricsProps {
  lyricsValue: string;
  handleLyricsChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const Lyrics: React.FC<LyricsProps> = ({ lyricsValue, handleLyricsChange }) => {
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
      </div>
    </div>
  );
};

export default Lyrics;
