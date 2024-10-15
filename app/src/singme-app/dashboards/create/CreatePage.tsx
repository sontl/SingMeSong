import React, { useState, useRef, useContext, useEffect } from 'react';
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import MusicStyle from './MusicStyle';
import Title from './Title';
import Lyrics from './Lyrics';
import CreateSongButton from './CreateSongButton';
import { useQuery, getAllSongsByUser, importSongFromSuno, uploadFile, createUploadedSong, deleteSong } from 'wasp/client/operations';
import SongTable from './SongTable';
import SongDetails from './SongDetails';
import { type Song } from 'wasp/entities';
import { SongContext } from '../../context/SongContext';
import { FaFileAudio, FaUpload, FaSpinner, FaCog, FaTrash, FaDownload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const CreatePage = ({ user }: { user: AuthUser }) => {
  const [lyricsValue, setLyricsValue] = useState('');
  const [musicStyleValue, setMusicStyleValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const songTableRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'details'>('create');

  const { setCurrentPage, stopP5Sound, setAllSongs, setIsAudioEnded, isAudioLoading } = useContext(SongContext);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeForm, setActiveForm] = useState<'create' | 'import' | 'upload'>('create');

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadMusicStyle, setUploadMusicStyle] = useState('');
  const [uploadLyrics, setUploadLyrics] = useState('');

  useEffect(() => {
    setCurrentPage('create');
    stopP5Sound(); // Stop P5 sound when CreatePage mounts
  }, [setCurrentPage, stopP5Sound]);

  useRedirectHomeUnlessUserIsAdmin({ user });

  const handleLyricsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLyricsValue(event.target.value);
  };

  const handleMusicStyleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMusicStyleValue(event.target.value);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitleValue(event.target.value);
  };

  const handleSongCreated = () => {
    setTimeout(() => {
      if (songTableRef.current) {
        songTableRef.current.scrollTop = songTableRef.current.scrollHeight + 100;
      }
    }, 2000);
    
    // Refetch songs 3 times, after 8, 12, 20 seconds
    setTimeout(() => {
      refetch();
    }, 8000);
    setTimeout(() => {
      refetch();
    }, 12000);
    setTimeout(() => {
      refetch();
    }, 20000);
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  useEffect(() => {
    if (songs) {
      const sortedSongs = [...songs].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setAllSongs(sortedSongs);
    }
  }, [songs, setAllSongs]);

  useEffect(() => {
    if (selectedSong) {
      setIsAudioEnded(false);
    }
  }, [selectedSong, setIsAudioEnded]);

  const [showImportForm, setShowImportForm] = useState(false);
  const [sunoUrl, setSunoUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!sunoUrl) return;

    setIsImporting(true);
    try {
      const newSong = await importSongFromSuno(sunoUrl);
      refetch();
      setSelectedSong(newSong);
      setSunoUrl('');
      setShowImportForm(false);
      if (songTableRef.current) {
        songTableRef.current.scrollTop = songTableRef.current.scrollHeight;
      }
    } catch (error) {
      console.error('Failed to import song:', error);
      alert('Failed to import song. Please check the URL and try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleImportForm = () => {
    setShowImportForm(!showImportForm);
    setSunoUrl('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) {
      toast.error('Please select a file and enter a title');
      return;
    }

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

      // Create new song record in the database
      const updatedSong = await createUploadedSong({
        title: uploadTitle,
        audioUrl: audioUrl,
        musicStyle: uploadMusicStyle,
        lyrics: uploadLyrics,
      });


      toast.success('File uploaded successfully and song created');
      refetch(); // Refetch the songs list
      setSelectedFile(null);
      setUploadTitle('');
      setUploadMusicStyle('');
      setUploadLyrics('');
      setShowImportForm(false);
      console.log('updatedSong', updatedSong);
      setSelectedSong(updatedSong as unknown as Song );
      // Scroll to the bottom of the Song Table after a short delay
      setTimeout(() => {
        if (songTableRef.current) {
          songTableRef.current.scrollTop = songTableRef.current.scrollHeight;
        }
      }, 500);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('An error occurred while uploading the file');
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const toggleForm = (formType: 'create' | 'import' | 'upload') => {
    setActiveForm(formType);
    if (formType === 'create') {
      setSunoUrl('');
      setSelectedFile(null);
    }
  };

  const handleDeleteSong = async () => {
    if (!selectedSong) return;

    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        await deleteSong({ songId: selectedSong.id });
        toast.success('Song deleted successfully');
        setSelectedSong(null);
        refetch();
      } catch (error) {
        console.error('Error deleting song:', error);
        toast.error('Failed to delete song');
      }
    }
  };

  return (
    <DefaultLayout user={user}>
      <div className='max-w-screen-2xl mx-auto'>
        {/* Mobile Tab Navigation */}
        <div className='md:hidden mb-4'>
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value as 'create' | 'list' | 'details')}
            className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="create">Create Song</option>
            <option value="list">Song List</option>
            <option value="details">Song Details</option>
          </select>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3  h-[calc(100vh-100px)]'>
          {/* Column 1: Song Creation */}
          <div className={`col-span-1 overflow-hidden flex flex-col ${activeTab !== 'create' ? 'hidden md:flex' : ''}`}>
            <div className='rounded-sm bg-white shadow-default dark:bg-boxdark p-7 flex-grow overflow-y-auto' >
              <div className="flex justify-between items-center mb-4 ">
                {/* <h2 className="text-2xl font-bold">
                  {activeForm === 'import' ? 'Import' : activeForm === 'upload' ? 'Upload' : 'Create'}
                </h2> */}
                <div>
                  <button 
                    onClick={() => toggleForm('create')}
                    className={` hover:text-blue-700 mr-4 ${activeForm === 'create' ? 'font-bold text-lg text-black' : 'text-blue-500'}`}
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => toggleForm('import')}
                    className={`hover:text-blue-700 mr-4 ${activeForm === 'import' ? 'font-bold text-lg text-black' : 'text-blue-500'}`}
                  >
                    Import
                  </button>
                  <button 
                    onClick={() => toggleForm('upload')}
                    className={`hover:text-blue-700 ${activeForm === 'upload' ? 'font-bold text-lg text-black' : 'text-blue-500'}`}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {activeForm === 'import' && (
                <div className="mb-4">
                  <input
                    type="text"
                    value={sunoUrl}
                    onChange={(e) => setSunoUrl(e.target.value)}
                    placeholder="Enter Suno Song URL"
                    className="w-full p-2 border rounded"
                    disabled={isImporting}
                  />
                  <button 
                    onClick={handleImport}
                    className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <><svg className="inline-block ml-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> 
                    </svg>
                         Importing...
                      </>
                    ) : 'Import'}
                  </button>
                </div>
              )}

              {activeForm === 'upload' && (
                <div className="mt-4">
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
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="Enter title (required)"
                        className="w-full p-2 border rounded mb-2"
                        required
                      />
                      <input
                        type="text"
                        value={uploadMusicStyle}
                        onChange={(e) => setUploadMusicStyle(e.target.value)}
                        placeholder="Enter music style (optional)"
                        className="w-full p-2 border rounded mb-2"
                      />
                      <textarea
                        value={uploadLyrics}
                        onChange={(e) => setUploadLyrics(e.target.value)}
                        placeholder="Enter lyrics (optional)"
                        className="w-full p-2 border rounded mb-2"
                        rows={4}
                      />
                      <button
                        onClick={handleUpload}
                        className='flex items-center justify-center px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isUploading || isProcessing || !uploadTitle.trim()}
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
                          </>
                        )}
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                        <div 
                          className='bg-primary h-2.5 rounded-full' 
                          style={{ width: `${isUploading ? uploadProgress : 100}%` }}
                        ></div>
                      </div>
                      {isProcessing && (
                        <p className='text-sm text-gray-600 dark:text-gray-400 mt-2 text-center'>
                          We're processing your audio file. This may take a few moments.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeForm === 'create' && (
                <>
                  <Lyrics
                    lyricsValue={lyricsValue}
                    handleLyricsChange={handleLyricsChange}
                    setLyricsValue={setLyricsValue}
                    setMusicStyleValue={setMusicStyleValue}
                    setTitleValue={setTitleValue}
                  />
                  <MusicStyle
                    placeholder='Enter style of music.'
                    value={musicStyleValue}
                    handleChange={handleMusicStyleChange}
                    className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Title placeholder='Enter a title' value={titleValue} handleChange={handleTitleChange} className="focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <div className='flex justify-end gap-4.5 mt-5'>
                    <CreateSongButton 
                      lyricsValue={lyricsValue} 
                      musicStyleValue={musicStyleValue} 
                      titleValue={titleValue}
                      onSongCreated={handleSongCreated}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Column 2: List of Created Songs */}
          <div className={`col-span-1 overflow-hidden ${activeTab !== 'list' ? 'hidden md:block' : ''}`}>
            <div ref={songTableRef} className='rounded-sm bg-white shadow-default dark:bg-boxdark p-7 h-full overflow-y-auto'>
              <SongTable 
                songs={songs || []} 
                isAllSongsLoading={isAllSongsLoading}
                onSongSelect={handleSongSelect} 
                isAudioLoading={isAudioLoading}
              />
            </div>
          </div>

          {/* Column 3: Song Details */}
          <div className={`col-span-1 overflow-hidden ${activeTab !== 'details' ? 'hidden md:block' : ''}`}>
            <div className='rounded-sm bg-white shadow-default dark:bg-boxdark p-7 h-full overflow-y-auto'>
              <SongDetails 
                song={selectedSong} 
                onDeleteSong={handleDeleteSong}
              />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>     
  );
};

export default CreatePage;