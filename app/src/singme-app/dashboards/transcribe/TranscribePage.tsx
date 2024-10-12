import React, { useState, useContext, useMemo } from 'react';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser, transcribeSong, aiCorrectTranscription } from 'wasp/client/operations';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { useRedirectHomeUnlessUserIsAdmin } from '../../useRedirectHomeUnlessUserIsAdmin';
import { SongContext } from '../../context/SongContext';
import { FaDownload, FaClosedCaptioning, FaSpinner, FaArrowRight, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';

const TranscribePage = ({ user }: { user: AuthUser }) => {
  useRedirectHomeUnlessUserIsAdmin({ user });
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribingSongId, setTranscribingSongId] = useState<string | null>(null);
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser);
  const { setCurrentPage } = useContext(SongContext);
  const [inputLanguage, setInputLanguage] = useState('en');
  const [outputLanguage, setOutputLanguage] = useState('en');
  const [isAiCorrecting, setIsAiCorrecting] = useState(false);
  const [aiCorrectingSongId, setAiCorrectingSongId] = useState<string | null>(null);

  const languages = useMemo(() => [
    { value: "aa", label: "Afar" },
    { value: "ab", label: "Abkhazian" },
    { value: "ae", label: "Avestan" },
    { value: "af", label: "Afrikaans" },
    { value: "ak", label: "Akan" },
    { value: "am", label: "Amharic" },
    { value: "an", label: "Aragonese" },
    { value: "ar", label: "Modern Standard Arabic" },
    { value: "as", label: "Assamese" },
    { value: "av", label: "Avaric" },
    { value: "ay", label: "Aymara" },
    { value: "az", label: "Azerbaijani" },
    { value: "ba", label: "Bashkir" },
    { value: "be", label: "Belarusian" },
    { value: "bg", label: "Bulgarian" },
    { value: "bh", label: "Maïthil" },
    { value: "bi", label: "Bislama" },
    { value: "bm", label: "Bambara" },
    { value: "bn", label: "Bengali" },
    { value: "bo", label: "Tibetan" },
    { value: "br", label: "Breton" },
    { value: "bs", label: "Bosnian" },
    { value: "ca", label: "Catalan" },
    { value: "ce", label: "Chechen" },
    { value: "ch", label: "Chamorro" },
    { value: "co", label: "Corsican" },
    { value: "cr", label: "Cree" },
    { value: "cs", label: "Czech" },
    { value: "cu", label: "Slavonic" },
    { value: "cv", label: "Chuvash" },
    { value: "cy", label: "Welsh" },
    { value: "da", label: "Danish" },
    { value: "de", label: "German" },
    { value: "dv", label: "Divehi" },
    { value: "dz", label: "Dzongkha" },
    { value: "ee", label: "Ewe" },
    { value: "el", label: "Greek" },
    { value: "en", label: "English" },
    { value: "eo", label: "Esperanto" },
    { value: "es", label: "Spanish" },
    { value: "et", label: "Estonian" },
    { value: "eu", label: "Basque" },
    { value: "fa", label: "Persian" },
    { value: "ff", label: "Fulah" },
    { value: "fi", label: "Finnish" },
    { value: "fj", label: "Fijian" },
    { value: "fo", label: "Faroese" },
    { value: "fr", label: "French" },
    { value: "fy", label: "Frisian" },
    { value: "ga", label: "Irish" },
    { value: "gd", label: "Gaelic" },
    { value: "gl", label: "Galician" },
    { value: "gn", label: "Guarani" },
    { value: "gu", label: "Gujarati" },
    { value: "gv", label: "Manx" },
    { value: "ha", label: "Hausa" },
    { value: "he", label: "Hebrew" },
    { value: "hi", label: "Hindi" },
    { value: "ho", label: "Motu" },
    { value: "hr", label: "Croatian" },
    { value: "ht", label: "Haitian" },
    { value: "hu", label: "Hungarian" },
    { value: "hy", label: "Armenian" },
    { value: "hz", label: "Herero" },
    { value: "ia", label: "Interlingua" },
    { value: "id", label: "Indonesian" },
    { value: "ie", label: "Interlingue" },
    { value: "ig", label: "Igbo" },
    { value: "ii", label: "Yi" },
    { value: "ik", label: "Inupiaq" },
    { value: "io", label: "Ido" },
    { value: "is", label: "Icelandic" },
    { value: "it", label: "Italian" },
    { value: "iu", label: "Inuktitut" },
    { value: "ja", label: "Japanese" },
    { value: "jv", label: "Javanese" },
    { value: "ka", label: "Georgian" },
    { value: "kg", label: "Kongo" },
    { value: "ki", label: "Kikuyu" },
    { value: "kj", label: "Kwanyama" },
    { value: "kk", label: "Kazakh" },
    { value: "kl", label: "Greenlandic" },
    { value: "km", label: "Khmer" },
    { value: "kn", label: "Kannada" },
    { value: "ko", label: "Korean" },
    { value: "kr", label: "Kanuri" },
    { value: "ks", label: "Kashmiri" },
    { value: "ku", label: "Kurdish" },
    { value: "kv", label: "Komi" },
    { value: "kw", label: "Cornish" },
    { value: "ky", label: "Kirghiz" },
    { value: "la", label: "Latin" },
    { value: "lb", label: "Luxembourgish" },
    { value: "lg", label: "Ganda" },
    { value: "li", label: "Limburgish" },
    { value: "ln", label: "Lingala" },
    { value: "lo", label: "Lao" },
    { value: "lt", label: "Lithuanian" },
    { value: "lu", label: "Luba" },
    { value: "lv", label: "Latvian" },
    { value: "mg", label: "Malagasy" },
    { value: "mh", label: "Marshallese" },
    { value: "mi", label: "Maori" },
    { value: "mk", label: "Macedonian" },
    { value: "ml", label: "Malayalam" },
    { value: "mn", label: "Mongolian" },
    { value: "mo", label: "Roumain1" },
    { value: "mr", label: "Marathi" },
    { value: "ms", label: "Malay" },
    { value: "mt", label: "Maltese" },
    { value: "my", label: "Burmese" },
    { value: "na", label: "Nauru" },
    { value: "nb", label: "Bokmål" },
    { value: "nd", label: "Ndebele" },
    { value: "ne", label: "Nepali" },
    { value: "ng", label: "Ndonga" },
    { value: "nl", label: "Dutch" },
    { value: "nn", label: "Nynorsk" },
    { value: "no", label: "Norwegian Bokmål" },
    { value: "nr", label: "Ndebele" },
    { value: "nv", label: "Navajo" },
    { value: "ny", label: "Chichewa" },
    { value: "oc", label: "Occitan" },
    { value: "oj", label: "Ojibwa" },
    { value: "om", label: "Oromo" },
    { value: "or", label: "Oriya" },
    { value: "os", label: "Ossetian" },
    { value: "pa", label: "Panjabi" },
    { value: "pi", label: "Pāli" },
    { value: "pl", label: "Polish" },
    { value: "ps", label: "Pashto" },
    { value: "pt", label: "Portuguese" },
    { value: "qu", label: "Quechua" },
    { value: "rm", label: "Romansh" },
    { value: "rn", label: "Kirundi" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "rw", label: "Kinyarwanda" },
    { value: "sa", label: "Sanskrit" },
    { value: "sc", label: "Sardinian" },
    { value: "sd", label: "Sindhi" },
    { value: "se", label: "Sami" },
    { value: "sg", label: "Sango" },
    { value: "sh", label: "Croatian" },
    { value: "si", label: "Sinhalese" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "sm", label: "Samoan" },
    { value: "sn", label: "Shona" },
    { value: "so", label: "Somali" },
    { value: "sq", label: "Albanian" },
    { value: "sr", label: "Serbian" },
    { value: "ss", label: "Swati" },
    { value: "st", label: "Sotho" },
    { value: "su", label: "Sundanese" },
    { value: "sv", label: "Swedish" },
    { value: "sw", label: "Swahili" },
    { value: "ta", label: "Tamil" },
    { value: "te", label: "Telugu" },
    { value: "tg", label: "Tajik" },
    { value: "th", label: "Thai" },
    { value: "ti", label: "Tigrinya" },
    { value: "tk", label: "Turkmen" },
    { value: "tl", label: "Tagalog" },
    { value: "tn", label: "Tswana" },
    { value: "to", label: "Tonga" },
    { value: "tr", label: "Turkish" },
    { value: "ts", label: "Tsonga" },
    { value: "tt", label: "Tatar" },
    { value: "tw", label: "Twi" },
    { value: "ty", label: "Tahitian" },
    { value: "ug", label: "Uighur" },
    { value: "uk", label: "Ukrainian" },
    { value: "ur", label: "Urdu" },
    { value: "uz", label: "Uzbek" },
    { value: "ve", label: "Venda" },
    { value: "vi", label: "Vietnamese" },
    { value: "vo", label: "Volapük" },
    { value: "wa", label: "Walloon" },
    { value: "wo", label: "Wolof" },
    { value: "xh", label: "Xhosa" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "za", label: "Zhuang" },
    { value: "zh", label: "Mandarin Chinese" },
    { value: "zu", label: "Zulu" }
  ], []);

  const isTranscribeDisabled = !selectedSong || (selectedSong && selectedSong.subtitle) || isTranscribing;

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
    try {
      const result = await transcribeSong({songId: selectedSong.id, inputLang: inputLanguage, outputLang: outputLanguage});

      if (result && result.success) {
        toast.success('Transcription completed successfully');
        refetch();
      } else {
        toast.error('Transcription failed');
      }
    } catch (error) {
      toast.error('An error occurred during transcription');
    } finally {
      setIsTranscribing(false);
      setTranscribingSongId(null);
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

  const handleAiCorrect = async (song: Song) => {
    if (!song.subtitle || !song.lyric) {
      toast.error('Song must have both transcription and lyrics for AI correction');
      return;
    }

    setIsAiCorrecting(true);
    setAiCorrectingSongId(song.id);
    try {
      // TODO: Implement the actual API call to Google Gemini Flash 1.5
      // This is a placeholder for the API call
      const correctedSubtitle = await aiCorrectTranscription({songId: song.id});
      
      // TODO: Update the song with the corrected subtitle
      // This is a placeholder for updating the song
      // await updateSong({ id: song.id, subtitle: correctedSubtitle });

      toast.success('AI correction completed successfully');
      refetch();
    } catch (error) {
      toast.error('An error occurred during AI correction');
    } finally {
      setIsAiCorrecting(false);
      setAiCorrectingSongId(null);
    }
  };

  return (
    <DefaultLayout user={user}>
      <div className='mx-auto max-w-270 h-[90vh] flex flex-col'>
        <div className='grid grid-cols-2 gap-8 flex-grow overflow-hidden'>
          <div className='col-span-1 flex flex-col overflow-hidden'>
            <div className='rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col h-full'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>Select Existing Song</h3>
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
                              onClick={(e) => handleDownload(song)}
                              className='text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                            >
                            <FaDownload  className='text-green-500'/>
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
          <div className='col-span-1 flex flex-col overflow-hidden'>
            <div className='rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark flex flex-col h-full'>
              <div className='border-b border-stroke py-4 px-7 dark:border-strokedark'>
                <h3 className='font-medium text-black dark:text-white'>Song Transcription</h3>
              </div>
              <div className='p-7 flex-grow overflow-y-auto'>
                <div className='mb-4 space-y-2'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-1'>
                      <label htmlFor="inputLanguage" className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                        Input Language
                      </label>
                      <select
                        id="inputLanguage"
                        value={inputLanguage}
                        onChange={(e) => setInputLanguage(e.target.value)}
                        className='w-full p-2 border rounded'
                      >
                        {languages.map((lang) => (
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
                        {languages.map((lang) => (
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
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <FaClosedCaptioning className='mr-2' />
                        Transcribe
                      </>
                    )}
                  </button>
                </div>
                {selectedSong ? (
                  selectedSong.transcription ? (
                    <>
                      <pre className='whitespace-pre-wrap'>{selectedSong.transcription}</pre>
                      {selectedSong.subtitle && selectedSong.lyric && (
                        <button
                          onClick={() => handleAiCorrect(selectedSong)}
                          className='mt-4 flex items-center justify-center px-4 py-2 rounded bg-secondary text-white hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                          disabled={isAiCorrecting}
                        >
                          {isAiCorrecting && aiCorrectingSongId === selectedSong.id ? (
                            <>
                              <FaSpinner className='mr-2 animate-spin' />
                              AI Correcting...
                            </>
                          ) : (
                            <>
                              <FaRobot className='mr-2' />
                              AI Correct
                            </>
                          )}
                        </button>
                      )}
                    </>
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