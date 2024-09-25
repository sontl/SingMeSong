import React, { useState, useEffect, useContext, useRef } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import p5 from 'p5';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser } from 'wasp/client/operations';
import { SongContext } from '../../context/SongContext';
import { visualizerEffects, VisualizerEffect } from './effects/VisualizerEffects';
import P5MusicPlayer from './P5MusicPlayer';
// Add this import
import { FaSpinner, FaExpand, FaCompress  } from 'react-icons/fa';

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
  const { data: songs, isLoading: isAllSongsLoading } = useQuery(getAllSongsByUser);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenDimensions, setFullscreenDimensions] = useState({ width: 0, height: 0 });
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
  const { 
    setAllSongs, 
    allSongs,
    currentSong, 
    isPlaying, 
    togglePlay, 
    p5SoundRef, 
    isAudioLoading, 
    currentPage,
    setCurrentPage,
    resetContext,
    stopP5Sound
  } = useContext(SongContext);
  const [currentEffect, setCurrentEffect] = useState<VisualizerEffect>(visualizerEffects[4]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isComponentMounted = useRef(true);

   // Add this effect to remove the <main> element with the canvas after the page is rendered
   useEffect(() => {
    const mainElement = document.getElementById('defaultCanvas0');
    if (mainElement) {
      mainElement.remove();
    }
  }, []);

  useEffect(() => {
    console.log('Setting current page to lyricVideo');
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
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
    try {
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

  const sketch = (p: p5) => {
    let fft: p5.FFT;

    const calculateCanvasSize = () => {
      if (isFullscreen) {
        return fullscreenDimensions;
      }

      const visualizerColumn = document.querySelector('.visualizer-column');
      if (!visualizerColumn) return { width: 0, height: 0 };

      const containerWidth = visualizerColumn.clientWidth * 0.96;
      const containerHeight = visualizerColumn.clientHeight * 0.96;
      const aspectRatio = 16 / 9;

      let width, height;

      if (containerWidth / containerHeight > aspectRatio) {
        // Container is wider than 16:9, so we'll use the height as the limiting factor
        height = containerHeight;
        width = height * aspectRatio;
      } else {
        // Container is taller than 16:9, so we'll use the width as the limiting factor
        width = containerWidth;
        height = width / aspectRatio;
      }

      return { width, height };
    };

    p.setup = () => {
      const { width, height } = calculateCanvasSize();
      p.createCanvas(width, height);
      fft = new p5.FFT();
    };

    p.windowResized = () => {
      if (isFullscreen) {
        setFullscreenDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
      const { width, height } = calculateCanvasSize();
      p.resizeCanvas(width, height);
    };

    const lyrics = [
      { "start": 0.00, "end": 7.56, "text": "Hư hư hư hư hư hư hư" },
      { "start": 7.56, "end": 11.04, "text": "Bao đêm đã thức trắng rồi" },
      { "start": 11.04, "end": 15.86, "text": "Đêm nay em lại vẫn ngồi héo hon" },
      { "start": 15.86, "end": 19.22, "text": "Thương anh em hãy ngủ ngon" },
      { "start": 19.22, "end": 22.78, "text": "Ngày mai bao chuyện mình còn phải lo" },
      { "start": 22.78, "end": 25.20, "text": "Ầu ơ... ví dầu..." },
      { "start": 25.40, "end": 29.28, "text": "Ngủ đi em, ngủ đi em" },
      { "start": 29.28, "end": 36.96, "text": "Ầu ơ... ví dầu... bình tâm em, ngủ đi mà" },
      { "start": 36.96, "end": 46.96, "text": "Gặp cơn sóng cả gió to, vững chèo khéo lái rồi đò sẽ qua" },
      { "start": 46.96, "end": 51.74, "text": "Sinh, lão, bệnh, tử người ta thường tình" },
      { "start": 51.74, "end": 54.46, "text": "Nghĩ gì những chuyện linh tinh" },
      { "start": 55.28, "end": 59.02, "text": "Ầu ơ... ví dầu... ngủ đi em" },
      { "start": 59.02, "end": 68.56, "text": "Ầu ơ... ví dầu... bệnh lui, anh khỏe nhà mình lại vui" },
      { "start": 68.56, "end": 75.18, "text": "Khuya rồi em, ngủ đi thôi" },
      { "start": 75.18, "end": 79.52, "text": "Còn bao nhiêu những mảnh đời khổ đau" },
      { "start": 79.52, "end": 83.18, "text": "Một mình lo hết được đâu" },
      { "start": 83.18, "end": 87.08, "text": "Đường xa gánh nặng san nhau ta cùng" },
      { "start": 87.08, "end": 89.00, "text": "Ầu ơ... ví dầu..." },
      { "start": 89.00, "end": 93.38, "text": "Ngủ đi em, ngủ đi em" },
      { "start": 93.38, "end": 101.00, "text": "Ầu ơ... ví dầu... ngủ đi, trời sắp hừng đông" },
      { "start": 101.00, "end": 107.04, "text": "Tiếng chân ai đã quẹt lòng phố xa" },
      { "start": 107.04, "end": 110.84, "text": "Ngày mai bạn đến chơi nhà" },
      { "start": 110.84, "end": 115.00, "text": "Em qua chợ nhớ mua hoa lúa vàng" },
      { "start": 115.00, "end": 118.98, "text": "Đón mừng ngày mới sang trang" },
      { "start": 119.00, "end": 131.00, "text": "Đêm khuya ru vợ, phổ thơ Nam Trần" }
  ];

    p.draw = () => {
      p.background(0, 10);
      
      if (p5SoundRef.current && isPlaying) {
        let spectrum = fft.analyze();
        let energy = fft.getEnergy("bass");
        let currentTime = p5SoundRef.current.currentTime();

        p.colorMode(p.HSB);

        currentEffect.draw(p, spectrum, energy);
        currentEffect.drawTitle(p, currentSong?.title || '');
        currentEffect.displayLyrics(p, lyrics, isPlaying, currentTime);
      } else {
        // Display a message when no song is selected or playing
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text("Select a song to visualize", p.width / 2, p.height / 2);
        p.textSize(16);
        p.text("Use the floating player to control playback", p.width / 2, p.height / 2 + 30);
      }
    };
  };

  return (
    <DefaultLayout user={user} hideFloatingPlayer={true} isFullscreen={isFullscreen}>
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="absolute top-4 right-4 group">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:bg-gray-800 rounded-full transition-colors duration-200"
            >
              <FaCompress size={20} />
            </button>
            <span className="absolute right-0 top-full mt-2 w-32 p-2 bg-white text-gray-800 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Exit Fullscreen
            </span>
          </div>
          <div className="w-full h-full">
            <ReactP5Wrapper sketch={sketch} isFullscreen={isFullscreen} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/4 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-200 p-4" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            <h2 className="text-xl font-bold mb-4">Your Songs</h2>
            {isAllSongsLoading ? (
              <p>Loading songs...</p>
            ) : (
              <ul className="space-y-2">
                {allSongs && allSongs.map((song) => (
                  <li
                    key={song.id}
                    className={`cursor-pointer p-2 hover:bg-gray-100 rounded ${
                      selectedSong?.id === song.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSongClick(song)}
                  >
                    {song.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full md:w-3/4 p-4 visualizer-column">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Song Visualizer</h2>
              <div className="relative group">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                >
                  {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
                </button>
                <span className="absolute right-0 top-full mt-2 w-32 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                </span>
              </div>
            </div>
            <div className="mb-4 flex flex-wrap">
              {visualizerEffects.map((effect) => (
                <button
                  key={effect.name}
                  className={`mr-2 mb-2 px-4 py-2 rounded ${currentEffect.name === effect.name ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={handleEffectChange(effect)}
                >
                  {effect.name}
                </button>
              ))}
              </div>
            {isLoading || isAudioLoading ? (
              <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin mr-2" size={24} />
                <p className="text-lg">Loading song...</p>
              </div>
            ) : (
              <div className="m-0 flex justify-center items-center">
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