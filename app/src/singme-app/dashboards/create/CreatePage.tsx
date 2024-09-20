import React, { useState, useRef, useContext, useEffect } from 'react';
import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import MusicStyle from './MusicStyle';
import Title from './Title';
import Lyrics from './Lyrics';
import CreateSongButton from './CreateSongButton';
import { useQuery, getAllSongsByUser } from 'wasp/client/operations';
import SongTable from './SongTable';
import SongDetails from './SongDetails';
import { type Song } from 'wasp/entities';
import { SongContext } from '../../context/SongContext';

const CreatePage = ({ user }: { user: AuthUser }) => {
  const [lyricsValue, setLyricsValue] = useState('');
  const [musicStyleValue, setMusicStyleValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { data: songs, isLoading: isSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const songTableRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'details'>('create');

  const { setCurrentSong, isPlaying, togglePlay, setAllSongs, setIsAudioEnded } = useContext(SongContext);

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
    if (songTableRef.current) {
      songTableRef.current.scrollTop = songTableRef.current.scrollHeight;
    }
    
    // Wait for 10 seconds, then refetch songs
    setTimeout(() => {
      refetch();
    }, 10000);
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    //setCurrentSong(song);
    //togglePlay(song); // Reset playing state when selecting a new song
  };

  useEffect(() => {
    if (songs) {
      const sortedSongs = [...songs].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setAllSongs(sortedSongs);
    }
  }, [songs, setAllSongs]);

  // Add this effect to reset isAudioEnded when a new song is selected
  useEffect(() => {
    if (selectedSong) {
      setIsAudioEnded(false);
    }
  }, [selectedSong, setIsAudioEnded]);

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

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 h-[calc(100vh-100px)]'>
          {/* Column 1: Song Creation */}
          <div className={`col-span-1 overflow-hidden flex flex-col ${activeTab !== 'create' ? 'hidden md:flex' : ''}`}>
            <div className='rounded-sm bg-white shadow-default dark:bg-boxdark p-7 flex-grow overflow-y-auto'>
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
            </div>
          </div>
          
          {/* Column 2: List of Created Songs */}
          <div className={`col-span-1 overflow-hidden ${activeTab !== 'list' ? 'hidden md:block' : ''}`}>
            <div ref={songTableRef} className='rounded-sm bg-white shadow-default dark:bg-boxdark p-7 h-full overflow-y-auto'>
              <SongTable 
                songs={songs || []} 
                isLoading={isSongsLoading} 
                onSongSelect={handleSongSelect} 
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
