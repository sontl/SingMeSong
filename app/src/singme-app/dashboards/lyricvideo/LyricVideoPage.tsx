import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import p5 from 'p5';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser } from 'wasp/client/operations';
import { SongContext } from '../../context/SongContext';
import { visualizerEffects, VisualizerEffect } from './effects/VisualizerEffects';
import P5MusicPlayer from './P5MusicPlayer';
import { clearSongImage } from './effects/spectrums/ImageWaveEffect';
import debounce from 'lodash/debounce';
import { FaSearch } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { FaSpinner, FaExpand, FaCompress, FaVideo, FaVideoSlash, FaClosedCaptioning } from 'react-icons/fa';
import { useHistory } from 'react-router-dom';

// Ensure we're in a browser environment
if (typeof window !== 'undefined') {
  (window as any).p5 = p5;
  
  // Load p5.sound
  import('p5/lib/addons/p5.sound').then(() => {
    console.log('p5.sound loaded successfully');
    // Create a dummy p5 instance to force p5.sound initialization
    new p5(() => {});
  }).catch(err => {
    console.error('Failed to load p5.sound:', err);
  });
}

const LyricVideoPage = ({ user }: { user: AuthUser }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: songs, isLoading: isAllSongsLoading, refetch } = useQuery(getAllSongsByUser, { searchTerm });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenDimensions, setFullscreenDimensions] = useState({ width: 0, height: 0 });
  const [showCustomMenu, setShowCustomMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const isRecordingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const isMediaRecorderSetupRef = useRef(false);
  const isFlashingRef = useRef(false);
  const flashingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { 
    setAllSongs, 
    allSongs, 
    currentSong, 
    isPlaying, 
    setIsPlaying,
    togglePlay, 
    p5SoundRef, 
    isAudioLoading, 
    currentPage,
    setCurrentPage,
    resetContext,
    stopP5Sound,
    isSeeking,
    setIsSeeking
  } = useContext(SongContext);
  const [currentEffect, setCurrentEffect] = useState<VisualizerEffect>(visualizerEffects[0]);
  const isInitialMount = useRef(true);
  const isComponentMounted = useRef(true);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [currentSmallImageUrl, setCurrentSmallImageUrl] = useState<string | null>(null);
  const location = useLocation();
  const songListRef = useRef<HTMLUListElement>(null);
  const history = useHistory();

  const setupMediaRecorder = useCallback(() => {
    // if (isMediaRecorderSetupRef.current || !canvasRef.current) return;

    console.log('Setting up MediaRecorder');
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }
    const stream = canvas.captureStream(30);

    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = 'lyric-video-recording.webm';
      a.click();
      window.URL.revokeObjectURL(url);
    };

    mediaRecorderRef.current = mediaRecorder;
    isMediaRecorderSetupRef.current = true;
    console.log('MediaRecorder set up');
  }, []);

  const startRecording = useCallback(() => {
    setupMediaRecorder();
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'inactive') return;
    console.log('Starting recording');
    recordedChunksRef.current = [];
    mediaRecorderRef.current.start();
    isRecordingRef.current = true;
    startFlashing();
  }, []);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
    console.log('Stopping recording');
    mediaRecorderRef.current.stop();
    isRecordingRef.current = false;
    stopFlashing();
  }, []);

  const startFlashing = useCallback(() => {
    if (flashingIntervalRef.current) return;
    isFlashingRef.current = true;
    flashingIntervalRef.current = setInterval(() => {
      isFlashingRef.current = !isFlashingRef.current;
      forceUpdate(); // We'll define this function to trigger a re-render
    }, 500);
  }, []);

  const stopFlashing = useCallback(() => {
    if (flashingIntervalRef.current) {
      clearInterval(flashingIntervalRef.current);
      flashingIntervalRef.current = null;
    }
    isFlashingRef.current = false;
    forceUpdate(); // Trigger a re-render to update the UI
  }, []);

  // Force update function to trigger re-renders when needed
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  const toggleRecording = useCallback(() => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      setIsSeeking(true);
      p5SoundRef.current.jump(0);
      
      setTimeout(() => {
        setIsSeeking(false);
        //wait for 100ms to make sure the seek is complete
        setTimeout(() => {
          startRecording();
        }, 100);
      }, 100);
    }
  }, [startRecording, stopRecording, setIsSeeking]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setFullscreenDimensions({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setFullscreenDimensions({ width: 0, height: 0 });
    }
  };

  useEffect(() => {
    if (isFullscreen) {
      // Hide cursor and button immediately when entering fullscreen
      setFullscreenDimensions({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setFullscreenDimensions({ width: 0, height: 0 });
    }
  }, [isFullscreen]);

  useEffect(() => {
   
    setCurrentPage('lyricVideo');

    // This effect runs only once when the component mounts
    if (isComponentMounted.current) {
      resetContext();
      console.log('resetContext on initial mount');
    }

    // Cleanup function
    return () => {
      if (isComponentMounted.current) {
        console.log('Component unmounting, resetting context');
        resetContext();
        stopP5Sound();
        isComponentMounted.current = false;
      }
    };
  }, [setCurrentPage, resetContext, stopP5Sound]);

  useEffect(() => {
    if (isInitialMount.current) {
      // This will only run once when the component mounts
      resetContext();
      setCurrentPage('lyricVideo');
      isInitialMount.current = false;
      console.log('resetContext on initial mount');
    }
  }, [setCurrentPage, resetContext]);

  useEffect(() => {
    if (songs) {
      const sortedSongs = [...songs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllSongs(sortedSongs);
    }
  }, [songs, setAllSongs]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreenNow = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;
      
      setIsFullscreen(!!isFullscreenNow);
    };
  
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleSongClick = async (song: Song) => {
    console.log('handleSongClick');
    setIsLoading(true);
    setSelectedSong(song);
    
    // Stop the currently playing song, if any
    if (currentSong && p5SoundRef.current) {
      p5SoundRef.current.stop();
      setIsPlaying(false);
    }

    // Clear the previous image and set the new image URLs
    clearSongImage();
    setCurrentImageUrl(song.imageUrl || null);
    setCurrentSmallImageUrl(song.imageUrl ? song.imageUrl.replace('image_large', 'image') : null);

    try {
      // Reset the audio context
      resetContext();
      
      // Play the new song
      await togglePlay(song);
    } catch (error) {
      console.error('Error playing song:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEffectChange = (effect: VisualizerEffect) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentEffect(effect);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    if (isFullscreen) {
      e.preventDefault();
      setShowCustomMenu(true);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCloseMenu = () => {
    setShowCustomMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowCustomMenu(false);
    };

    if (showCustomMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCustomMenu]);

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (flashingIntervalRef.current) {
        clearInterval(flashingIntervalRef.current);
      }
    };
  }, []);

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

  const handleTranscribe = () => {
    if (selectedSong) {
      history.push(`/transcribe?songId=${selectedSong.id}`);
    }
  };

  const sketch = useCallback((p: p5) => {
    let fft: p5.FFT;
    const calculateCanvasSize = () => {
      if (isFullscreen) {
        return fullscreenDimensions;
      }

      const visualizerColumn = document.querySelector('.visualizer-column');
      if (!visualizerColumn) return { width: 0, height: 0 };

      const containerWidth = visualizerColumn.clientWidth * 0.96;
      let containerHeight = visualizerColumn.clientHeight * 0.96;
      
      // Add a gap for mobile view
      if (window.innerWidth < 768) {  // Assuming 768px is the breakpoint for mobile
        containerHeight -= 80;  // Adjust this value as needed to create sufficient gap
      }

      const aspectRatio = 16 / 9;

      let width, height;

      if (containerWidth / containerHeight > aspectRatio) {
        height = containerHeight;
        width = height * aspectRatio;
      } else {
        width = containerWidth;
        height = width / aspectRatio;
      }

      return { width, height };
    };

    p.preload = () => {
      if (currentSmallImageUrl && currentEffect.loadSmallImage) {
        currentEffect.loadSmallImage(p, currentSmallImageUrl);
      }
      // Load the images if available
      if (currentImageUrl && currentEffect.loadImage) {
        currentEffect.loadImage(p, currentImageUrl);
      }

    };

    p.setup = () => {
     
      const { width, height } = calculateCanvasSize();
      const canvas = p.createCanvas(width, height);
      canvasRef.current = canvas.elt;
      fft = new p5.FFT();
      console.log('setup p5');
      // Set up the onended event
      p5SoundRef.current.onended(() => {
        if (!isSeeking) {
          console.log('Song ended naturally');
          if (isRecordingRef.current) {
            stopRecording();
          }
          if (isPlaying) {
            setIsPlaying(false);
          }
          p.noLoop();
          return;
          
        } else {
          console.log('Seek operation detected, not ending recording');
        }
      });
      currentEffect.setup(p);
    
    };

    p.windowResized = () => {
      if (isFullscreen) {
        setFullscreenDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
      const { width, height } = calculateCanvasSize();
      p.resizeCanvas(width, height);
    };

    p.draw = () => {
      if (p5SoundRef.current && isPlaying && currentSong) {
        let spectrum = fft.analyze();
        let energy = fft.getEnergy("bass");
        let waveform = fft.waveform();
        let currentTime = p5SoundRef.current.currentTime();
        
        // Use p.push() and p.pop() to isolate drawing settings
        p.push();
        currentEffect.draw(p, spectrum, energy, waveform);
        currentEffect.drawTitle(p, currentSong.title || '');
        
        if (currentSong.subtitle) {
          currentEffect.displayLyrics(p, currentSong.subtitle as any, isPlaying, currentTime);
        } else {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text("Lyrics not available for this song", p.width / 2, p.height - 30);
        }
        p.pop();
      } else {
        // Display a message when no song is selected or playing
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        if (isFullscreen) {
          p.text("Right click or press ESC to exit fullscreen", p.width / 2, p.height / 2);
        } else {
          p.text("Select a song to visualize", p.width / 2, p.height / 2);
          p.textSize(16);
          p.text("Use the floating player to control playback", p.width / 2, p.height / 2 + 30);
        }
        p.noLoop();
      }
    };
  }, [isFullscreen, fullscreenDimensions, isPlaying, currentSong, currentEffect, p5SoundRef, stopRecording, isSeeking, currentImageUrl, currentSmallImageUrl]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const songId = searchParams.get('songId');
    if (songId && songs) {
      const song = songs.find((s: Song) => s.id === songId);
      if (song) {
        setSelectedSong(song);
        handleSongClick(song);
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

  return (
    <DefaultLayout user={user} hideFloatingPlayer={true} isFullscreen={isFullscreen}>
      {isFullscreen ? (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center cursor-none"
          onContextMenu={handleRightClick}
        >
          <div className="w-full h-full">
            <ReactP5Wrapper sketch={sketch} isFullscreen={isFullscreen} />
          </div>
          {showCustomMenu && (
            <div 
              className="absolute bg-white rounded shadow-lg py-2"
              style={{ top: menuPosition.y, left: menuPosition.x }}
            >
              <button
                onClick={() => {
                  toggleFullscreen();
                  handleCloseMenu();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Exit Fullscreen
              </button>
              {/* Add more menu items here if needed */}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/4 overflow-y-auto border-b md:border-b-0  border-gray-200 p-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <h2 className="text-xl font-bold mb-4">Your Songs</h2>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search songs..."
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {isAllSongsLoading ? (
              <p>Loading songs...</p>
            ) : (
              <ul className="space-y-2" ref={songListRef}>
                {allSongs && allSongs.map((song) => (
                  <li
                    id={`song-${song.id}`}
                    key={song.id}
                    className={`cursor-pointer p-2 hover:bg-gray-100 rounded ${
                      selectedSong?.id === song.id ? 'bg-blue-100' : ''
                    } flex items-start`}
                    onClick={() => handleSongClick(song)}
                  >
                    <div className="flex-grow pr-2 break-words">
                      <span>{song.title}</span>
                    </div>
                    {song.subtitle && (
                      <FaClosedCaptioning 
                        className="text-gray-500 flex-shrink-0 mt-1" 
                        title="This song has lyrics"
                        size={16}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full md:w-3/4 p-4 visualizer-column">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Song Visualizer</h2>
              <div className="flex items-center">
                <div className="relative group mr-2">
                  <button
                    onClick={handleTranscribe}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    aria-label="Transcribe Song"
                    disabled={!selectedSong}
                  >
                    <FaClosedCaptioning size={20} className="text-primary" />
                  </button>
                  <span className="absolute right-0 top-full mt-2 w-32 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Transcribe Song
                  </span>
                </div>
                <div className="relative group">
                  <button
                    onClick={toggleRecording}
                    className={`p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 mr-2 ${
                      isRecordingRef.current && isFlashingRef.current ? 'bg-red-500' : ''
                    }`}
                    aria-label={isRecordingRef.current ? 'Stop Recording' : 'Start Recording'}
                  >
                    {isRecordingRef.current ? (
                      <FaVideoSlash size={20} color={isFlashingRef.current ? 'white' : 'red'} />
                    ) : (
                      <FaVideo size={20} className="text-primary" />
                    )}
                  </button>
                  <span className="absolute right-0 top-full mt-2 w-32 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isRecordingRef.current ? 'Stop Recording' : 'Start Recording'}
                  </span>
                </div>
                <div className="relative group">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <FaCompress size={20} className="text-primary" /> : <FaExpand size={20} className="text-primary" />}
                </button>
                <span className="absolute right-0 top-full mt-2 w-32 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </span>
                </div>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap">
              {visualizerEffects.map((effect) => (
                <div key={effect.name} className="relative group mr-2 mb-2">
                  <button
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs ${
                      currentEffect.name === effect.name
                        ? 'border-blue-500 text-blue-500'
                        : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700'
                    }`}
                    onClick={handleEffectChange(effect)}
                  >
                    {effect.name.charAt(0) + effect.name.charAt(1)}
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                    {effect.name}
                  </div>
                </div>
              ))}
            </div>
            {isLoading || isAudioLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <FaSpinner className="animate-spin mr-2" size={24} />
                    <p className="text-lg">Loading song...</p>
                  </div>
                ) : (
                  <div className={`m-0 flex justify-center items-center ${isRecordingRef.current ? 'border-4 border-red-500' : ''} mb-20 md:mb-0`}>
                    <ReactP5Wrapper sketch={sketch} />
                  </div>
                )}
          </div>
        </div>
      )}
      {!isFullscreen && <P5MusicPlayer />}
    </DefaultLayout>
  );
};

export default LyricVideoPage;
