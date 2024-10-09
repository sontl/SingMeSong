import React, { useState, useRef, useContext, useEffect } from 'react';
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import MusicStyle from './MusicStyle';
import Title from './Title';
import Lyrics from './Lyrics';
import CreateSongButton from './CreateSongButton';
import { useQuery, getAllSongsByUser, importSongFromSuno } from 'wasp/client/operations';
import SongTable from './SongTable';
import SongDetails from './SongDetails';
import { type Song } from 'wasp/entities';
import { SongContext } from '../../context/SongContext';

const CreatePage = ({ user }: { user: AuthUser }) => {
  const [lyricsValue, setLyricsValue] = useState('');
  const [musicStyleValue, setMusicStyleValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const songTableRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'details'>('create');

  const { setCurrentPage, stopP5Sound, setAllSongs, setIsAudioEnded, isAudioLoading } = useContext(SongContext);

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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Lyrics</h2>
                <button 
                  onClick={toggleImportForm}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {showImportForm ? 'Create' : 'Import'}
                </button>
              </div>

              {showImportForm ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={sunoUrl}
                    onChange={(e) => setSunoUrl(e.target.value)}
                    placeholder="Enter Suno URL"
                    className="w-full p-2 border rounded"
                    disabled={isImporting}
                  />
                  <button 
                    onClick={handleImport}
                    className={`mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <>
                        Importing...
                        <svg className="inline-block ml-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </>
                    ) : 'Import'}
                  </button>
                </div>
              ) : (
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
              <SongDetails song={selectedSong} />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>     
  );
};

export default CreatePage;
