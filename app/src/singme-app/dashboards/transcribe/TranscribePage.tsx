import React, { useState, useContext } from 'react';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser, transcribeSong } from 'wasp/client/operations';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { SongContext } from '../../context/SongContext';
import { FaDownload, FaClosedCaptioning } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TranscribePage = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const { setCurrentPage } = useContext(SongContext);

  const isTranscribeDisabled = !selectedSong || (selectedSong && selectedSong.subtitle);

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  const handleTranscribe = async () => {
    if (!selectedSong) {
      toast.error('Please select a song');
      return;
    }

    try {
      const result = await transcribeSong(selectedSong.id);

      if (result && result.success) {
        toast.success('Transcription completed successfully');
        refetch();
      } else {
        toast.error('Transcription failed');
      }
    } catch (error) {
      toast.error('An error occurred during transcription');
    }
  };

  const handleDownload = (song: Song) => {
    if (song.subtitle) {
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(song.subtitle)], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = `${song.title}_transcription.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <DefaultLayout user={user}>
      <div className='mx-auto max-w-270 h-[90vh] flex flex-col'>
        <div className='grid grid-cols-1 gap-8 flex-grow overflow-hidden'>
          <div className='col-span-1 flex flex-col overflow-hidden'>
            <div className='rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col h-full'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark flex justify-between items-center'>
                <h3 className='font-medium text-black dark:text-white'>Select Existing Song</h3>
                <button
                  onClick={handleTranscribe}
                  className='flex items-center justify-center px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={!!isTranscribeDisabled}
                >
                  <FaClosedCaptioning className='mr-2' />
                  Transcribe
                </button>
              </div>
              <div className='p-7 flex-grow overflow-y-auto'>
                {isAllSongsLoading ? (
                  <p>Loading songs...</p>
                ) : (
                  <ul className='space-y-2'>
                    {songs?.map((song) => (
                      <li 
                        key={song.id} 
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          selectedSong?.id === song.id ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-meta-4'
                        }`}
                        onClick={() => handleSongSelect(song)}
                      >
                        <span>{song.title}</span>
                        {song.subtitle && (
                          <button onClick={() => handleDownload(song)}>
                            <FaDownload className='text-green-500' />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default TranscribePage;