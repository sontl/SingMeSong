import React from 'react';
import { Link } from 'react-router-dom';

interface CreateSongButtonProps {
  lyricsValue: string;
}

const CreateSongButton: React.FC<CreateSongButtonProps> = ({ lyricsValue, onClick }) => {
  return (
    <button
      onClick={onClick}
      className='min-w-[7rem] font-medium  ring-1 ring-inset ring-slate-200  duration-200 ease-in-out focus:outline-none focus:shadow-none hover:shadow-none flex items-center justify-center inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 shadow-lg '
    >
      <span>
        <svg className='fill-current' width='20' height='20' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
          <path d='M10 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z' />
          <path d='M17.5 0l1.5 4.5H24l-4 3 1.5 4.5-4-3-4 3 1.5-4.5-4-3h5z' />
          <path d='M21 10l1 3h3l-2.5 1.8 1 3-2.5-1.8-2.5 1.8 1-3-2.5-1.8h3z' />
        </svg>
      </span>
      Create Song
    </button>
  );
};

export default CreateSongButton;
