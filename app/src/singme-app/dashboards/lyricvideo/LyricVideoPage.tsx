import React, { useState, useEffect, useContext, useRef } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import p5 from 'p5';
import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser } from 'wasp/client/operations';
import { SongContext } from '../../context/SongContext';
import { visualizerEffects, VisualizerEffect } from './effects/VisualizerEffects';
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
  const { setAllSongs } = useContext(SongContext);
  const soundRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<VisualizerEffect>(visualizerEffects[0]);

  useEffect(() => {
    if (songs) {
      const sortedSongs = [...songs].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setAllSongs(sortedSongs);
    }
  }, [songs, setAllSongs]);

  const stopCurrentSound = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleSongClick = (song: Song) => {
    setIsLoading(true);
    stopCurrentSound();
    setSelectedSong(song);

    p5.prototype.loadSound(
      new URL(song.audioUrl!, window.location.href).toString(),
      (loadedSound) => {
        soundRef.current = loadedSound;
        loadedSound.play();
        setIsPlaying(true);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
        console.error('Failed to load sound');
      }
    );
  };

  const handleEffectChange = (effect: VisualizerEffect) => (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the click from propagating to the canvas
    setCurrentEffect(effect);
  };

  const sketch = (p: p5) => {
    let fft: p5.FFT;

    p.setup = () => {
      p.createCanvas(p.windowWidth * 0.75, p.windowHeight * 0.8);
      fft = new p5.FFT();
    };

    p.draw = () => {
      p.background(0, 10);
      
      if (soundRef.current && isPlaying) {
        let spectrum = fft.analyze();
        let energy = fft.getEnergy("bass");

        p.colorMode(p.HSB);

        currentEffect.draw(p, spectrum, energy);

        // Use the custom title drawing function
        currentEffect.drawTitle(p, selectedSong?.title || '');
      } else {
        // Display a message when no song is selected
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text("Select a song to visualize", p.width / 2, p.height / 2);
      }
    };

    p.mouseClicked = () => {
      if (soundRef.current) {
        if (isPlaying) {
          soundRef.current.pause();
          setIsPlaying(false);
        } else {
          soundRef.current.play();
          setIsPlaying(true);
        }
      }
    };
  };

  return (
    <DefaultLayout user={user}>
      <div className="flex h-full">
        <div className="w-1/4 overflow-y-auto border-r border-gray-200 p-4">
          <h2 className="text-xl font-bold mb-4">Your Songs</h2>
          {isAllSongsLoading ? (
            <p>Loading songs...</p>
          ) : (
            <ul>
              {songs && songs.map((song) => (
                <li
                  key={song.id}
                  className={`cursor-pointer p-2 hover:bg-gray-100 ${
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
        <div className="w-3/4 p-4">
          <h2 className="text-xl font-bold mb-4">Song Visualizer</h2>
          <div className="mb-4">
            {visualizerEffects.map((effect) => (
              <button
                key={effect.name}
                className={`mr-2 px-4 py-2 rounded ${currentEffect.name === effect.name ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={handleEffectChange(effect)}
              >
                {effect.name}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-lg">Loading song...</p>
            </div>
          ) : (
            <ReactP5Wrapper sketch={sketch} />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default LyricVideoPage;