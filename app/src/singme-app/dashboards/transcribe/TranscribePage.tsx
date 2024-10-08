import React, { useState, useContext } from 'react';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser, transcribeSong, createUploadedSong, uploadFile } from 'wasp/client/operations';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { SongContext } from '../../context/SongContext';
import { FaFileAudio, FaDownload, FaClosedCaptioning, FaUpload, FaSpinner, FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';


const TranscribePage = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const { setCurrentPage } = useContext(SongContext);

  const isTranscribeDisabled = !selectedSong || (selectedSong && selectedSong.subtitle);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedSong(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Get upload URL from server
      const { uploadUrl, audioUrl } = await uploadFile({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
      });

      // Upload file directly to Cloudflare R2
      const response = await axios.put(uploadUrl, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      if (response.status !== 200) {
        throw new Error('Failed to upload file to Cloudflare R2');
      }

      setIsProcessing(true);
      setIsUploading(false);
      setProcessingProgress(0);

      // Create new song record in the database
      const { song, progress } = await createUploadedSong({
        title: selectedFile.name,
        audioUrl: audioUrl,
      });

      setProcessingProgress(progress);

      toast.success('File uploaded successfully and song created');
      refetch(); // Refetch the songs list
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading the file');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingProgress(0);
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setSelectedFile(null);
  };

  const handleTranscribe = async () => {
    if (!selectedSong && !selectedFile) {
      toast.error('Please select a song or upload a file');
      return;
    }

    try {
      let result;
      if (selectedSong) {
        result = await transcribeSong(selectedSong.id);
      } else if (selectedFile) {
        toast.error('File upload transcription not implemented yet');
        return;
      }

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
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 flex-grow overflow-hidden'>
          <div className='col-span-1 flex flex-col overflow-hidden'>
            <div className='rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col h-full'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>Upload Audio File</h3>
              </div>
              <div className='p-7 flex-grow overflow-y-auto'>
                <form onSubmit={(e) => e.preventDefault()}>
                  <div
                    id='FileUpload'
                    className={`relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type='file'
                      accept='audio/*'
                      onChange={handleFileSelect}
                      className='absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none'
                      disabled={isUploading}
                    />
                    <div className='flex flex-col items-center justify-center space-y-3'>
                      <span className='flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark'>
                        <FaFileAudio className='text-primary' />
                      </span>
                      <p>
                        <span className='text-primary'>Click to select</span> or drag and drop
                      </p>
                      <p className='mt-1.5'>MP3, WAV, or OGG</p>
                    </div>
                  </div>
                  {selectedFile && !isUploading && !isProcessing && (
                    <div className='mt-4'>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                        Selected file: {selectedFile.name}
                      </p>
                      <button
                        onClick={handleUpload}
                        className='flex items-center justify-center px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300'
                        disabled={isUploading || isProcessing}
                      >
                        <FaUpload className='mr-2' />
                        Upload
                      </button>
                    </div>
                  )}
                  {(isUploading || isProcessing) && (
                    <div className='mt-4'>
                      <div className='flex items-center justify-center mb-2'>
                        {isUploading ? (
                          <>
                            <FaSpinner className='animate-spin mr-2' />
                            <span>Uploading... {uploadProgress}%</span>
                          </>
                        ) : (
                          <>
                            <FaCog className='animate-spin mr-2' />
                            <span>Processing... {processingProgress}%</span>
                          </>
                        )}
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                        <div 
                          className='bg-primary h-2.5 rounded-full' 
                          style={{ width: `${isUploading ? uploadProgress : processingProgress}%` }}
                        ></div>
                      </div>
                      {isProcessing && (
                        <p className='text-sm text-gray-600 dark:text-gray-400 mt-2 text-center'>
                          We're processing your audio file and generating an image. This may take a few moments.
                        </p>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          
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
                        {song.subtitle && <FaClosedCaptioning className='text-green-500' />}
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