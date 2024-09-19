import { type AuthUser } from 'wasp/auth';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { useState } from 'react';
import MusicStyle from './MusicStyle';
import Title from './Title';
import Lyrics from './Lyrics';
import { CgSpinner } from 'react-icons/cg';
import { TiDelete } from 'react-icons/ti';
import CreateSongButton from './CreateSongButton';
import { useQuery, getAllSongsByUser } from 'wasp/client/operations';
import SongTable from './SongTable'; // Add this import
import SongDetails from './SongDetails';
import { type Song } from 'wasp/entities';
const CreatePage = ({ user }: { user: AuthUser }) => {
  const [lyricsValue, setLyricsValue] = useState('');
  const [musicStyleValue, setMusicStyleValue] = useState('');
  const [titleValue, setTitleValue] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { data: songs, isLoading: isSongsLoading } = useQuery(getAllSongsByUser);

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

  return (
    <DefaultLayout user={user}>
      <div className='max-w-screen-2xl mx-auto'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Column 1: Song Creation */}
          <div className='col-span-1'>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7'>
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
                <CreateSongButton lyricsValue={lyricsValue} musicStyleValue={musicStyleValue} titleValue={titleValue} />
              </div>
            </div>
          </div>

          {/* Column 2: List of Created Songs */}
          <div className='col-span-1'>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7'>
              <SongTable songs={songs || []} isLoading={isSongsLoading} onSongSelect={setSelectedSong} />
            </div>
          </div>

          {/* Column 3: Song Details */}
          <div className='col-span-1'>
            <div className='rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-7'>
              <SongDetails song={selectedSong} />
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default CreatePage;
