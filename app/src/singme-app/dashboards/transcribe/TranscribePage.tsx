import React, { useState, useEffect, useContext } from 'react';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser, transcribeSong } from 'wasp/client/operations';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { SongContext } from '../../context/SongContext';
import { FaFileAudio, FaDownload, FaClosedCaptioning } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TranscribePage = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const { setCurrentPage } = useContext(SongContext);

  useEffect(() => {
    //setCurrentPage('transcribe');
  }, [setCurrentPage]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setSelectedSong(null);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setUploadedFile(null);
  };

  const handleTranscribe = async () => {
    if (!selectedSong && !uploadedFile) {
      toast.error('Please select a song or upload a file');
      return;
    }

    try {
      let result;
      if (selectedSong) {
        result = await transcribeSong(selectedSong.id);
      } else if (uploadedFile) {
        // Implement file upload and transcription logic here
        // This might involve creating a new song entry and then transcribing it
        toast.error('File upload transcription not implemented yet');
        return;
      }

      if (result && result.success) {
        toast.success('Transcription completed successfully');
        refetch();  // Refresh the song list
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
      <div className='mx-auto max-w-270'>
        <h2 className='mb-6 text-2xl font-semibold text-black dark:text-white'>Transcribe Lyrics</h2>
        
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          <div className='col-span-1'>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>Upload Audio File</h3>
              </div>
              <div className='p-7'>
                <form action='#'>
                  <div
                    id='FileUpload'
                    className='relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5'
                  >
                    <input
                      type='file'
                      accept='audio/*'
                      onChange={handleFileUpload}
                      className='absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none'
                    />
                    <div className='flex flex-col items-center justify-center space-y-3'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark'>
                        <FaFileAudio className='text-primary' />
                      </span>
                      <p><span className='text-primary'>Click to upload</span> or drag and drop</p>
                      <p className='mt-1.5'>MP3, WAV, or OGG</p>
                    </div>
                  </div>
                  {uploadedFile && (
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      Selected file: {uploadedFile.name}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
          
          <div className='col-span-1'>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>Select Existing Song</h3>
              </div>
              <div className='p-7'>
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
                        {song.subtitle && <FaClosedCaptioning className='text-green-500' />}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='mt-8 flex justify-center'>
          <button
            onClick={handleTranscribe}
            className='rounded bg-primary py-2 px-6 font-medium text-gray hover:shadow-1'
            disabled={!selectedSong && !uploadedFile}
          >
            Transcribe
          </button>
        </div>

        {/* {selectedSong && selectedSong.subtitle && (
          <div className='mt-8'>
            <h3 className='mb-4 text-xl font-semibold text-black dark:text-white'>Transcription</h3>
            <div className='rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark'>
              {selectedSong.subtitle.map((line, index) => (
                <p key={index} className='mb-2'>{line.text}</p>
              ))}
            </div>
            <div className='mt-4 flex justify-end'>
              <button
                onClick={() => handleDownload(selectedSong)}
                className='flex items-center rounded bg-primary py-2 px-4 font-medium text-gray hover:shadow-1'
              >
                <FaDownload className='mr-2' /> Download Transcription
              </button>
            </div>
          </div>
        )} */}
      </div>
    </DefaultLayout>
  );
};

export default TranscribePage;