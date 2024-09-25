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
      {
        "start": 0.00,
        "end": 7.56,
        "text": "Hư hư hư hư hư hư hư",
        "words": [
         
        ]
      },
      {
        "start": 7.56,
        "end": 11.04,
        "text": "Bao đêm đã thức trắng rồi",
        "words": [
        
        ]
      },
      {
        "start": 11.04,
        "end": 15.86,
        "text": "Đêm nay em lại vẫn ngồi héo hon",
        "words": [
          { "text": "Đêm", "start": 11.04, "end": 11.64 },
          { "text": "nay", "start": 11.64, "end": 12.24 },
          { "text": "em", "start": 12.24, "end": 12.84 },
          { "text": "lại", "start": 12.84, "end": 13.44 },
          { "text": "vẫn", "start": 13.44, "end": 14.04 },
          { "text": "ngồi", "start": 14.04, "end": 14.64 },
          { "text": "héo", "start": 14.64, "end": 15.24 },
          { "text": "hon", "start": 15.24, "end": 15.86 }
        ]
      },
      {
        "start": 15.86,
        "end": 19.22,
        "text": "Thương anh em hãy ngủ ngon",
        "words": [
          { "text": "Thương", "start": 15.86, "end": 16.54 },
          { "text": "anh", "start": 16.54, "end": 17.22 },
          { "text": "em", "start": 17.22, "end": 17.90 },
          { "text": "hãy", "start": 17.90, "end": 18.58 },
          { "text": "ngủ", "start": 18.58, "end": 18.90 },
          { "text": "ngon", "start": 18.90, "end": 19.22 }
        ]
      },
      {
        "start": 19.22,
        "end": 22.78,
        "text": "Ngày mai bao chuyện mình còn phải lo",
        "words": [
          { "text": "Ngày", "start": 19.22, "end": 19.74 },
          { "text": "mai", "start": 19.74, "end": 20.26 },
          { "text": "bao", "start": 20.26, "end": 20.78 },
          { "text": "chuyện", "start": 20.78, "end": 21.30 },
          { "text": "mình", "start": 21.30, "end": 21.82 },
          { "text": "còn", "start": 21.82, "end": 22.34 },
          { "text": "phải", "start": 22.34, "end": 22.56 },
          { "text": "lo", "start": 22.56, "end": 22.78 }
        ]
      },
      {
        "start": 22.78,
        "end": 25.20,
        "text": "Ầu ơ... ví dầu...",
        "words": [
          { "text": "Ầu", "start": 22.78, "end": 23.58 },
          { "text": "ơ...", "start": 23.58, "end": 24.38 },
          { "text": "ví", "start": 24.38, "end": 24.79 },
          { "text": "dầu...", "start": 24.79, "end": 25.20 }
        ]
      },
      {
        "start": 25.40,
        "end": 29.28,
        "text": "Ngủ đi em, ngủ đi em",
        "words": [
          { "text": "Ngủ", "start": 25.40, "end": 26.17 },
          { "text": "đi", "start": 26.17, "end": 26.94 },
          { "text": "em,", "start": 26.94, "end": 27.71 },
          { "text": "ngủ", "start": 27.71, "end": 28.48 },
          { "text": "đi", "start": 28.48, "end": 28.88 },
          { "text": "em", "start": 28.88, "end": 29.28 }
        ]
      },
      {
        "start": 29.28,
        "end": 36.96,
        "text": "Ầu ơ... ví dầu... bình tâm em, ngủ đi mà",
        "words": [
          { "text": "Ầu", "start": 29.28, "end": 30.08 },
          { "text": "ơ...", "start": 30.08, "end": 30.88 },
          { "text": "ví", "start": 30.88, "end": 31.68 },
          { "text": "dầu...", "start": 31.68, "end": 32.48 },
          { "text": "bình", "start": 32.48, "end": 33.28 },
          { "text": "tâm", "start": 33.28, "end": 34.08 },
          { "text": "em,", "start": 34.08, "end": 34.88 },
          { "text": "ngủ", "start": 34.88, "end": 35.68 },
          { "text": "đi", "start": 35.68, "end": 36.32 },
          { "text": "mà", "start": 36.32, "end": 36.96 }
        ]
      },
      {
        "start": 36.96,
        "end": 46.96,
        "text": "Gặp cơn sóng cả gió to, vững chèo khéo lái rồi đò sẽ qua",
        "words": [
          { "text": "Gặp", "start": 36.96, "end": 37.96 },
          { "text": "cơn", "start": 37.96, "end": 38.96 },
          { "text": "sóng", "start": 38.96, "end": 39.96 },
          { "text": "cả", "start": 39.96, "end": 40.96 },
          { "text": "gió", "start": 40.96, "end": 41.96 },
          { "text": "to,", "start": 41.96, "end": 42.96 },
          { "text": "vững", "start": 42.96, "end": 43.96 },
          { "text": "chèo", "start": 43.96, "end": 44.46 },
          { "text": "khéo", "start": 44.46, "end": 44.96 },
          { "text": "lái", "start": 44.96, "end": 45.46 },
          { "text": "rồi", "start": 45.46, "end": 45.96 },
          { "text": "đò", "start": 45.96, "end": 46.46 },
          { "text": "sẽ", "start": 46.46, "end": 46.71 },
          { "text": "qua", "start": 46.71, "end": 46.96 }
        ]
      },
      {
        "start": 46.96,
        "end": 51.74,
        "text": "Sinh, lão, bệnh, tử người ta thường tình",
        "words": [
          { "text": "Sinh,", "start": 46.96, "end": 47.76 },
          { "text": "lão,", "start": 47.76, "end": 48.56 },
          { "text": "bệnh,", "start": 48.56, "end": 49.36 },
          { "text": "tử", "start": 49.36, "end": 50.16 },
          { "text": "người", "start": 50.16, "end": 50.56 },
          { "text": "ta", "start": 50.56, "end": 50.96 },
          { "text": "thường", "start": 50.96, "end": 51.35 },
          { "text": "tình", "start": 51.35, "end": 51.74 }
        ]
      },
      {
        "start": 51.74,
        "end": 54.46,
        "text": "Nghĩ gì những chuyện linh tinh",
        "words": [
          { "text": "Nghĩ", "start": 51.74, "end": 52.28 },
          { "text": "gì", "start": 52.28, "end": 52.82 },
          { "text": "những", "start": 52.82, "end": 53.36 },
          { "text": "chuyện", "start": 53.36, "end": 53.90 },
          { "text": "linh", "start": 53.90, "end": 54.18 },
          { "text": "tinh", "start": 54.18, "end": 54.46 }
        ]
      },
      {
        "start": 55.28,
        "end": 59.02,
        "text": "Ầu ơ... ví dầu... ngủ đi em",
        "words": [
          { "text": "Ầu", "start": 55.28, "end": 56.08 },
          { "text": "ơ...", "start": 56.08, "end": 56.88 },
          { "text": "ví", "start": 56.88, "end": 57.68 },
          { "text": "dầu...", "start": 57.68, "end": 58.48 },
          { "text": "ngủ", "start": 58.48, "end": 58.75 },
          { "text": "đi", "start": 58.75, "end": 58.89 },
          { "text": "em", "start": 58.89, "end": 59.02 }
        ]
      },
      {
        "start": 59.02,
        "end": 68.56,
        "text": "Ầu ơ... ví dầu... bệnh lui, anh khỏe nhà mình lại vui",
        "words": [
          { "text": "Ầu", "start": 59.02, "end": 59.82 },
          { "text": "ơ...", "start": 59.82, "end": 60.62 },
          { "text": "ví", "start": 60.62, "end": 61.42 },
          { "text": "dầu...", "start": 61.42, "end": 62.22 },
          { "text": "bệnh", "start": 62.22, "end": 63.02 },
          { "text": "lui,", "start": 63.02, "end": 63.82 },
          { "text": "anh", "start": 63.82, "end": 64.62 },
          { "text": "khỏe", "start": 64.62, "end": 65.42 },
          { "text": "nhà", "start": 65.42, "end": 66.22 },
          { "text": "mình", "start": 66.22, "end": 67.02 },
          { "text": "lại", "start": 67.02, "end": 67.79 },
          { "text": "vui", "start": 67.79, "end": 68.56 }
        ]
      },
      {
        "start": 68.56,
        "end": 75.18,
        "text": "Khuya rồi em, ngủ đi thôi",
        "words": [
          { "text": "Khuya", "start": 68.56, "end": 69.95 },
          { "text": "rồi", "start": 69.95, "end": 71.34 },
          { "text": "em,", "start": 71.34, "end": 72.73 },
          { "text": "ngủ", "start": 72.73, "end": 74.12 },
          { "text": "đi", "start": 74.12, "end": 74.65 },
          { "text": "thôi", "start": 74.65, "end": 75.18 }
        ]
      },
      {
        "start": 75.18,
        "end": 79.52,
        "text": "Còn bao nhiêu những mảnh đời khổ đau",
        "words": [
          { "text": "Còn", "start": 75.18, "end": 75.90 },
          { "text": "bao", "start": 75.90, "end": 76.62 },
          { "text": "nhiêu", "start": 76.62, "end": 77.34 },
          { "text": "những", "start": 77.34, "end": 78.06 },
          { "text": "mảnh", "start": 78.06, "end": 78.42 },
          { "text": "đời", "start": 78.42, "end": 78.78 },
          { "text": "khổ", "start": 78.78, "end": 79.14 },
          { "text": "đau", "start": 79.14, "end": 79.52 }
        ]
      },
      {
        "start": 79.52,
        "end": 83.18,
        "text": "Một mình lo hết được đâu",
        "words": [
          { "text": "Một", "start": 79.52, "end": 80.22 },
          { "text": "mình", "start": 80.22, "end": 80.92 },
          { "text": "lo", "start": 80.92, "end": 81.62 },
          { "text": "hết", "start": 81.62, "end": 82.32 },
          { "text": "được", "start": 82.32, "end": 82.75 },
          { "text": "đâu", "start": 82.75, "end": 83.18 }
        ]
      },
      {
        "start": 83.18,
        "end": 87.08,
        "text": "Đường xa gánh nặng san nhau ta cùng",
        "words": [
          { "text": "Đường", "start": 83.18, "end": 83.88 },
          { "text": "xa", "start": 83.88, "end": 84.58 },
          { "text": "gánh", "start": 84.58, "end": 85.28 },
          { "text": "nặng", "start": 85.28, "end": 85.98 },
          { "text": "san", "start": 85.98, "end": 86.33 },
          { "text": "nhau", "start": 86.33, "end": 86.68 },
          { "text": "ta", "start": 86.68, "end": 86.88 },
          { "text": "cùng", "start": 86.88, "end": 87.08 }
        ]
      },
      {
        "start": 87.08,
        "end": 89.00,
        "text": "Ầu ơ... ví dầu...",
        "words": [
          { "text": "Ầu", "start": 87.08, "end": 87.72 },
          { "text": "ơ...", "start": 87.72, "end": 88.36 },
          { "text": "ví", "start": 88.36, "end": 88.68 },
          { "text": "dầu...", "start": 88.68, "end": 89.00 }
        ]
      },
      {
        "start": 89.00,
        "end": 93.38,
        "text": "Ngủ đi em, ngủ đi em",
        "words": [
          { "text": "Ngủ", "start": 89.00, "end": 89.88 },
          { "text": "đi", "start": 89.88, "end": 90.76 },
          { "text": "em,", "start": 90.76, "end": 91.64 },
          { "text": "ngủ", "start": 91.64, "end": 92.52 },
          { "text": "đi", "start": 92.52, "end": 92.95 },
          { "text": "em", "start": 92.95, "end": 93.38 }
        ]
      },
      {
        "start": 93.38,
        "end": 101.00,
        "text": "Ầu ơ... ví dầu... ngủ đi, trời sắp hừng đông",
        "words": [
          { "text": "Ầu", "start": 93.38, "end": 94.28 },
          { "text": "ơ...", "start": 94.28, "end": 95.18 },
          { "text": "ví", "start": 95.18, "end": 96.08 },
          { "text": "dầu...", "start": 96.08, "end": 96.98 },
          { "text": "ngủ", "start": 96.98, "end": 97.88 },
          { "text": "đi,", "start": 97.88, "end": 98.78 },
          { "text": "trời", "start": 98.78, "end": 99.68 },
          { "text": "sắp", "start": 99.68, "end": 100.34 },
          { "text": "hừng", "start": 100.34, "end": 100.67 },
          { "text": "đông", "start": 100.67, "end": 101.00 }
        ]
      },
      {
        "start": 101.00,
        "end": 107.04,
        "text": "Tiếng chân ai đã quẹt lòng phố xa",
        "words": [
          { "text": "Tiếng", "start": 101.00, "end": 102.01 },
          { "text": "chân", "start": 102.01, "end": 103.02 },
          { "text": "ai", "start": 103.02, "end": 104.03 },
          { "text": "đã", "start": 104.03, "end": 105.04 },
          { "text": "quẹt", "start": 105.04, "end": 105.70 },
          { "text": "lòng", "start": 105.70, "end": 106.37 },
          { "text": "phố", "start": 106.37, "end": 106.70 },
          { "text": "xa", "start": 106.70, "end": 107.04 }
        ]
      },
      {
        "start": 107.04,
        "end": 110.84,
        "text": "Ngày mai bạn đến chơi nhà",
        "words": [
          { "text": "Ngày", "start": 107.04, "end": 107.99 },
          { "text": "mai", "start": 107.99, "end": 108.94 },
          { "text": "bạn", "start": 108.94, "end": 109.89 },
          { "text": "đến", "start": 109.89, "end": 110.36 },
          { "text": "chơi", "start": 110.36, "end": 110.60 },
          { "text": "nhà", "start": 110.60, "end": 110.84 }
        ]
      },
      {
        "start": 110.84,
        "end": 115.00,
        "text": "Em qua chợ nhớ mua hoa lúa vàng",
        "words": [
          { "text": "Em", "start": 110.84, "end": 111.67 },
          { "text": "qua", "start": 111.67, "end": 112.50 },
          { "text": "chợ", "start": 112.50, "end": 113.33 },
          { "text": "nhớ", "start": 113.33, "end": 114.16 },
          { "text": "mua", "start": 114.16, "end": 114.58 },
          { "text": "hoa", "start": 114.58, "end": 114.79 },
          { "text": "lúa", "start": 114.79, "end": 114.89 },
          { "text": "vàng", "start": 114.89, "end": 115.00 }
        ]
      },
      {
        "start": 115.00,
        "end": 118.98,
        "text": "Đón mừng ngày mới sang trang",
        "words": [
          { "text": "Đón", "start": 115.00, "end": 115.80 },
          { "text": "mừng", "start": 115.80, "end": 116.60 },
          { "text": "ngày", "start": 116.60, "end": 117.40 },
          { "text": "mới", "start": 117.40, "end": 118.20 },
          { "text": "sang", "start": 118.20, "end": 118.59 },
          { "text": "trang", "start": 118.59, "end": 118.98 }
        ]
      },
      {
        "start": 119.00,
        "end": 131.00,
        "text": "Đêm khuya ru vợ, phổ thơ Nam Trần",
        "words": [
          { "text": "Đêm", "start": 119.00, "end": 121.00 },
          { "text": "khuya", "start": 121.00, "end": 123.00 },
          { "text": "ru", "start": 123.00, "end": 125.00 },
          { "text": "vợ,", "start": 125.00, "end": 127.00 },
          { "text": "phổ", "start": 127.00, "end": 128.50 },
          { "text": "thơ", "start": 128.50, "end": 129.75 },
          { "text": "Nam", "start": 129.75, "end": 130.37 },
          { "text": "Trần", "start": 130.37, "end": 131.00 }
        ]
      }
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