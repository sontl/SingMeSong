import React, { useState, useEffect, useContext, useRef } from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import p5 from 'p5';
import P5 from 'p5';
// Ensure we're in a browser environment
if (typeof window !== 'undefined') {
  (window as any).p5 = p5;
  
  // Load p5.sound
  import('p5/lib/addons/p5.sound').then(() => {
    console.log('p5.sound loaded successfully');
    
    // Create a dummy p5 instance to force p5.sound initialization
    new p5(() => {});
    
    // Check if loadSound is available and is a function
    if (typeof p5.prototype.loadSound === 'function') {
      console.log('loadSound is now available');
    } else {
      console.error('loadSound is still not available');
    }
  }).catch(err => {
    console.error('Failed to load p5.sound:', err);
  });
}

import { type Song } from 'wasp/entities';
import DefaultLayout from '../../layout/DefaultLayout';
import { type AuthUser } from 'wasp/auth';
import { useQuery, getAllSongsByUser } from 'wasp/client/operations';
import { SongContext } from '../../context/SongContext';

const LyricVideoPage = ({ user }: { user: AuthUser }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { data: songs, isLoading: isAllSongsLoading } = useQuery(getAllSongsByUser);
  const { setAllSongs } = useContext(SongContext);
  const soundRef = useRef<p5.SoundFile | null>(null);
  const isSoundLoadedRef = useRef(false);

  useEffect(() => {
    if (songs) {
      const sortedSongs = [...songs].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setAllSongs(sortedSongs);
    }
  }, [songs, setAllSongs]);

  const handleSongClick = (song: Song) => {
    if (soundRef.current) {
      soundRef.current.stop(); // Stop previous sound if any
    }
    soundRef.current = new p5.SoundFile(
      new URL(song.audioUrl!, window.location.href).toString(),
      () => {
        isSoundLoadedRef.current = true;
        soundRef.current?.play(); // Play the sound once loaded
        console.log('Sound loaded and playing');
      }
    );
  };

  const preload = (p: p5) => {
    if (selectedSong) {
      soundRef.current = p5.prototype.loadSound(
        new URL(selectedSong.audioUrl!, window.location.href).toString(),
        () => {
          isSoundLoadedRef.current = true;
        }
      );
    }
  };

  const sketch = (p: p5) => {
    let sound: any;
    let fft: any;

    p.preload = () => preload(p);

    p.setup = () => {
      p.createCanvas(p.windowWidth * 0.75, p.windowHeight * 0.8);
      fft = new P5.FFT();
      if (sound) {
        sound.play();
      }
    };

    p.draw = () => {
      p.background(220);
      
      if (isSoundLoadedRef.current && soundRef.current) {
        // Visualizer
        let spectrum = fft.analyze();
        p.noStroke();
        p.fill(255, 0, 255);
        for (let i = 0; i < spectrum.length; i++) {
          let x = p.map(i, 0, spectrum.length, 0, p.width);
          let h = -p.height + p.map(spectrum[i], 0, 255, p.height, 0);
          p.rect(x, p.height, p.width / spectrum.length, h);
        }

        // Display song title
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text(selectedSong?.title || '', p.width / 2, 30);
      } else {
        // Display a message when no song is selected
        p.fill(0);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("Select a song to visualize", p.width / 2, p.height / 2);
      }
    };

    p.mouseClicked = () => {
      if (sound && sound.isLoaded()) {
        if (sound.isPlaying()) {
          sound.pause();
        } else {
          sound.play();
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
                  onClick={() => {
                    setSelectedSong(song);
                    handleSongClick(song);
                  }}
                >
                  {song.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="w-3/4 p-4">
          <h2 className="text-xl font-bold mb-4">Song Visualizer</h2>
          <ReactP5Wrapper sketch={sketch} />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default LyricVideoPage;