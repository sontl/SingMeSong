import React, { useState, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser, transcribeSong, aiCorrectTranscription, updateSubtitleSentence } from 'wasp/client/operations';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { SongContext } from '../../context/SongContext';
import { FaDownload, FaClosedCaptioning, FaSpinner, FaArrowRight, FaRobot, FaSearch, FaPencilAlt, FaCheck, FaPlay } from 'react-icons/fa';
import toast from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { LANGUAGES } from '../../shared/constants';
import { ignoreOverride } from 'openai/_vendor/zod-to-json-schema/Options.mjs';
import { useLocation, useHistory } from 'react-router-dom';
import JokeDisplay from '../../components/JokeDisplay';

const TranscribePage = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribingSongId, setTranscribingSongId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser, { searchTerm });
  const { setCurrentPage } = useContext(SongContext);
  const [inputLanguage, setInputLanguage] = useState('en');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [isAiCorrecting, setIsAiCorrecting] = useState(false);
  const [aiCorrectingSongId, setAiCorrectingSongId] = useState<string | null>(null);
  const [showWords, setShowWords] = useState(false);
  const [editingField, setEditingField] = useState<{ index: number; field: 'start' | 'end' | 'sentence' } | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const [showTranscribeOptions, setShowTranscribeOptions] = useState(false);
  const [transcriptionProgress, setTranscriptionProgress] = useState('');
  const location = useLocation();
  const songListRef = useRef<HTMLUListElement>(null);
  const history = useHistory();

  const isTranscribeDisabled = !selectedSong || isTranscribing;


  // Update this interface above the component
  interface SubtitleItem {
    start: number;
    end: number;
    sentence: string;
    words: Array<{ start: number; end: number; text: string }>;
  }

  // Update the Song type to include the correct subtitle type
  type SongWithSubtitle = Song & { subtitle: SubtitleItem[] };

  // Add this effect
  useEffect(() => {
    if (selectedSong && songs) {
      const updatedSong = songs.find((song: Song) => song.id === selectedSong.id);
      if (updatedSong) {
        setSelectedSong(updatedSong);
      }
    }
  }, [songs, selectedSong]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const songId = searchParams.get('songId');
    if (songId && songs) {
      const song = songs.find((s: Song) => s.id === songId);
      if (song) {
        setSelectedSong(song);
        // Scroll to the selected song
        setTimeout(() => {
          const songElement = document.getElementById(`song-${songId}`);
          if (songElement && songListRef.current) {
            songElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [location, songs]);


  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
  };

  const handleTranscribe = async () => {
    if (!selectedSong) {
      toast.error('Please select a song');
      return;
    }

    setIsTranscribing(true);
    setTranscribingSongId(selectedSong.id);
    setTranscriptionProgress('Transcribing...');
    try {
      const result = await transcribeSong({songId: selectedSong.id, inputLang: inputLanguage, outputLang: outputLanguage});

      if (result && result.success) {
        toast.success('Transcription completed successfully');
        setTranscriptionProgress('Transcription complete. Starting auto enhancement...');
        const updatedSong = result.updatedSong;
        if (inputLanguage !== 'en' && outputLanguage !== 'en') {
          await handleAiCorrect(updatedSong);
        }
      } else {
        toast.error('Transcription failed');
      }
    } catch (error) {
      toast.error('An error occurred during transcription');
    } finally {
      setIsTranscribing(false);
      setTranscribingSongId(null);
      setTranscriptionProgress('');
      refetch();
      if (showTranscribeOptions) {
        setShowTranscribeOptions(false);
      }
    }
  };

  const handleDownload = (song: Song) => {
    if (song.subtitle) {
      const element = document.createElement('a');
      //const file = new Blob([JSON.stringify(song.subtitle)], {type: 'application/json'});
      const file = new Blob([song.transcription!], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${song.title}_transcription.srt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleAiCorrect = async (song: Song) => {
    if (!song.subtitle || !song.lyric) {
      toast.error('Song must have both transcription and lyrics for AI correction');
      return;
    }

    setIsAiCorrecting(true);
    setAiCorrectingSongId(song.id);
    setTranscriptionProgress('Transcription enhancement is in progress. It may take a while...');
    try {
      const correctedSubtitle = await aiCorrectTranscription({songId: song.id});
      toast.success('AI correction completed successfully');
      refetch();
    } catch (error) {
      toast.error('An error occurred during AI correction');
    } finally {
      setIsAiCorrecting(false);
      setAiCorrectingSongId(null);
      setTranscriptionProgress('');
    }
  };

  const handleInputLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setInputLanguage(newLanguage);
    setOutputLanguage(newLanguage);
  };

  // Debounce the search to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.padStart(5, '0')}`;
  };

  const handleEdit = (index: number, field: 'start' | 'end' | 'sentence', value: number | string) => {
    setEditingField({ index, field });
    if (field === 'start' || field === 'end') {
      if (typeof value === 'number') {
        setEditedValue(value.toFixed(2));
      } else {
        setEditedValue(value);
      }
    } else {
      setEditedValue(value as string);
    }
  };

  const handleSave = async (index: number, field: 'start' | 'end' | 'sentence') => {
    if (selectedSong && selectedSong.subtitle && Array.isArray(selectedSong.subtitle)) {
      const typedSong = selectedSong as SongWithSubtitle;
      const currentValue = typedSong.subtitle[index][field];
      let newValue = editedValue;
      console.log('currentValue ', currentValue);
      console.log('newValue ', newValue);

      let isChanged = false;
  
      if (field === 'start' || field === 'end') {
        newValue = parseFloat(editedValue).toFixed(2);
        isChanged = newValue !== parseFloat(currentValue.toString()).toFixed(2);
      } else {
        isChanged = newValue !== currentValue;
      }
  
      // Check if the content has changed
      if (isChanged) {
        try {
          await updateSubtitleSentence({ songId: selectedSong.id, index, field, newValue });
          // Update the local state
          setSelectedSong(prevSong => {
            if (!prevSong) return prevSong;
            const typedPrevSong = prevSong as SongWithSubtitle;
            const updatedSubtitle = [...typedPrevSong.subtitle];
            updatedSubtitle[index] = {
              ...(updatedSubtitle[index] as SubtitleItem),
              [field]: field === 'sentence' ? newValue : parseFloat(newValue)
            };
            return { ...prevSong, subtitle: updatedSubtitle } as Song;
          });
          toast.success('Subtitle updated successfully');
          refetch();
        } catch (error) {
          toast.error('Failed to update subtitle');
        }
      }
      setEditingField(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number, field: 'start' | 'end' | 'sentence') => {
    if (e.key === 'Enter') {
      handleSave(index, field);
    }
  };

  const handleReTranscribeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowTranscribeOptions(e.target.checked);
    if (e.target.checked) {
      setSelectedSong(prevSong => ({...prevSong, subtitle: null} as Song));
    }
  };

  const handlePreview = () => {
    if (selectedSong) {
      history.push(`/lyric-video?songId=${selectedSong.id}`);
    } else {
      toast.error('Please select a song to preview');
    }
  };

  return (
    <DefaultLayout user={user}>
      <div className='mx-auto w-full px-4 h-[90vh] flex flex-col'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 flex-grow overflow-hidden'>
          <div className='col-span-1 flex flex-col overflow-hidden'>
            <div className='bg-white dark:bg-boxdark flex flex-col h-full'>
              <div className='py-4 px-7'>
                <h3 className='font-medium text-black dark:text-white'>Select Existing Song</h3>
              </div>
              <div className='p-7 pb-0'>
                <div className='relative mb-4'>
                  <input
                    type='text'
                    placeholder='Search songs...'
                    onChange={handleSearchChange}
                    className='w-full pl-10 pr-4 py-2 border rounded-md'
                  />
                  <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                </div>
              </div>
              <div className='p-7 flex-grow overflow-y-auto'>
                {isAllSongsLoading ? (
                  <p>Loading songs...</p>
                ) : (
                  <ul className='space-y-2' ref={songListRef}>
                    {songs?.map((song: Song) => (
                      <li 
                        id={`song-${song.id}`}
                        key={song.id} 
                        className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                          selectedSong?.id === song.id
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => handleSongSelect(song)}
                      >
                        <span>{song.title}</span>
                        <div className='flex items-center'>
                          {transcribingSongId === song.id && (
                            <span className='mr-2 text-sm font-medium'>
                              Transcribing...
                            </span>
                          )}
                          {song.subtitle && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(song);
                              }}
                              className='relative group'
                              aria-label="Download Transcription"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              <span className="absolute right-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                                SRT
                              </span>
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className='col-span-1 md:col-span-2 flex flex-col overflow-hidden'>
            <div className='bg-white dark:bg-boxdark flex flex-col h-full'>
              <div className='py-4 px-7 flex justify-between items-center'>
                <h3 className='font-medium text-black dark:text-white'>Song Transcription</h3>
                <div className='flex items-center space-x-4'>
                  {/* Add the Preview button with tooltip */}
                  <div className="relative group">
                    <button
                      onClick={handlePreview}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 relative"
                      disabled={!selectedSong}
                      id="previewButton"
                    >
                      <FaPlay className="text-primary" />
                    </button>
                    <span className="absolute right-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                      Preview in Lyric Video
                    </span>
                  </div>
                  {selectedSong && selectedSong.subtitle && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reTranscribe"
                        checked={showTranscribeOptions}
                        onChange={handleReTranscribeToggle}
                        className="mr-2"
                      />
                      <label htmlFor="reTranscribe">Re-transcribe</label>
                    </div>
                  )}
                </div>
              </div>
              <div className='p-7 flex-grow overflow-y-auto'>
                <div className='mb-4 space-y-2'>
                  {(!selectedSong?.subtitle || showTranscribeOptions) && (
                    <>
                      <div className='flex items-center space-x-4'>
                        <div className='flex-1'>
                          <label htmlFor="inputLanguage" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                            Input Language
                          </label>
                          <select
                            id="inputLanguage"
                            value={inputLanguage}
                            onChange={handleInputLanguageChange}
                            className='w-full p-2 border rounded'
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className='flex items-center justify-center'>
                          <FaArrowRight className='text-gray-500' />
                        </div>
                        <div className='flex-1'>
                          <label htmlFor="outputLanguage" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                            Output Language
                          </label>
                          <select
                            id="outputLanguage"
                            value={outputLanguage}
                            onChange={(e) => setOutputLanguage(e.target.value)}
                            className='w-full p-2 border rounded'
                          >
                            {LANGUAGES.map((lang) => (
                              <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={handleTranscribe}
                        className='w-full flex items-center justify-center px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isTranscribeDisabled as boolean}
                      >
                        {isTranscribing ? (
                          <>
                            <FaSpinner className='mr-2 animate-spin' />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaClosedCaptioning className='mr-2' />
                            Transcribe
                          </>
                        )}
                      </button>
                      {isTranscribing && <JokeDisplay />}
                    </>
                  )}
                  {selectedSong && selectedSong.subtitle && !showTranscribeOptions && (
                    <div>
                      {Array.isArray(selectedSong.subtitle) && selectedSong.subtitle.map((item: any, index: number) => (
                        <div key={index} className="mb-2">
                          {editingField?.index === index && editingField.field === 'start' ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onBlur={() => handleSave(index, 'start')}
                              onKeyDown={(e) => handleKeyDown(e, index, 'start')}
                              className="w-20 p-1 border rounded"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="text-gray-500 cursor-pointer"
                              onClick={() => handleEdit(index, 'start', item.start)}
                            >
                              {formatTime(item.start)}
                            </span>
                          )}
                          {' - '}
                          {editingField?.index === index && editingField.field === 'end' ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onBlur={() => handleSave(index, 'end')}
                              onKeyDown={(e) => handleKeyDown(e, index, 'end')}
                              className="w-20 p-1 border rounded"
                              autoFocus
                            />
                          ) : (
                            <span
                              className="text-gray-500 cursor-pointer"
                              onClick={() => handleEdit(index, 'end', item.end)}
                            >
                              {formatTime(item.end)}
                            </span>
                          )}
                          <div className="flex items-center">
                            {editingField?.index === index && editingField.field === 'sentence' ? (
                              <input
                                type="text"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                onBlur={() => handleSave(index, 'sentence')}
                                onKeyDown={(e) => handleKeyDown(e, index, 'sentence')}
                                                className="flex-grow p-1 border rounded"
                                autoFocus
                              />
                            ) : (
                              <span
                                className="flex-grow cursor-pointer"
                                onClick={() => handleEdit(index, 'sentence', item.sentence)}
                              >
                                {item.sentence}
                              </span>
                            )}
                          </div>
                          {showWords && (
                            <div className="ml-4">
                              {item.words.map((word: any, wordIndex: number) => (
                                <div key={wordIndex} className="text-sm">
                                  {formatTime(word.start)} - {formatTime(word.end)}: {word.text}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedSong ? (
                  selectedSong.transcription ? (
                    isTranscribing ? (
                      ''
                    ) : (
                      <p className='text-gray-500'>** End of transcription **</p>
                    )
                  ) : (
                    <p className='text-gray-500'>No transcription available for this song. Click the "Transcribe" button to generate one.</p>
                  )
                ) : (
                  <p className='text-gray-500'>Select a song to view its transcription.</p>
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
