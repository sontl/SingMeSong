import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import p5 from 'p5';
import { useQuery, getSongById } from 'wasp/client/operations';
import { visualizerEffects, VisualizerEffect } from './effects/VisualizerEffects';
import { FaSpinner } from 'react-icons/fa';
import { type Song } from 'wasp/entities';

const FullscreenVisualizerPage = () => {
  const { songId } = useParams<{ songId: string }>();
  const [currentEffect] = useState<VisualizerEffect>(visualizerEffects[1]);
  const { data: song, isLoading: isSongLoading, error: songError } = useQuery(getSongById, { songId });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(true);
  const p5SoundRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const captureCanvasRef = useRef<p5.Renderer>();
  const mediaRecorderRef = useRef<MediaRecorder>();
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isSketchReady, setIsSketchReady] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const isMediaRecorderSetupRef = useRef(false);
  const isPlayingRef = useRef(false);
  const songRef = useRef<Song>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const setupMediaRecorder = useCallback(() => {
    if (isMediaRecorderSetupRef.current || !canvasRef.current) return;

    console.log('Setting up MediaRecorder');
    const canvas = canvasRef.current;
    const stream = canvas.captureStream(30);
    // Add audio track to the stream if it's not already present
    if (p5SoundRef.current && p5SoundRef.current.sourceNode) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(p5SoundRef.current.sourceNode.mediaStream);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      stream.addTrack(destination.stream.getAudioTracks()[0]);
    }

    const options = { mimeType: 'video/webm' };
    
    mediaRecorderRef.current = new MediaRecorder(stream,);
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      p5SoundRef.current.stop();
      setIsPlaying(false);
      (window as any).recordedVideoBlob = blob;
      (window as any).recordingFinished = true;
    };

    isMediaRecorderSetupRef.current = true;
    console.log('MediaRecorder set up');
  }, []);

  const sketch = useCallback((p: p5) => {
    let fft: p5.FFT;
    let frameCount = 0;
    p.setup = () => {
      const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      canvasRef.current = canvas.elt;
      fft = new p5.FFT();
      p.noCursor();
      p.frameRate(30);
      console.log('Canvas created:', canvasRef.current);
      
      // Signal that the sketch is ready
      setIsSketchReady(true);
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
    };

    p.draw = () => {
      frameCount++;
      p.background(0, 10);
      if (p5SoundRef.current  && songRef.current) {
        let spectrum = fft.analyze();
        let energy = fft.getEnergy("bass");
        let currentTime = p5SoundRef.current.currentTime();
        let waveform = fft.waveform();
        p.colorMode(p.HSB);

        currentEffect.draw(p, spectrum, energy, waveform);
        currentEffect.drawTitle(p, songRef.current.title || '');
        
        if (songRef.current.subtitle) {
          currentEffect.displayLyrics(p, songRef.current.subtitle as any, isPlayingRef.current, currentTime);
        } else {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(16);
          p.text("Lyrics not available for this song", p.width / 2, p.height - 30);
        }
      } else {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text("Loading...", p.width / 2, p.height / 2);
      }
    };
  }, [currentEffect]);

  useEffect(() => {
    if (song) {
      songRef.current = song;
    }
  }, [song]);

  useEffect(() => {
    (window as any).startRecording = startRecording;
    (window as any).stopRecording = stopRecording;
    (window as any).isRecordingFinished = isRecordingFinished;
    (window as any).isSketchReady = () => isSketchReady && isAudioLoaded;
    (window as any).getRecordedVideo = getRecordedVideo;
    
    if (song && song.audioUrl) {
      if (p5SoundRef.current) {
        p5SoundRef.current.stop();
        p5SoundRef.current.disconnect()
        p5SoundRef.current.dispose();
        p5SoundRef.current = null;
      }
      p5SoundRef.current = new (window as any).p5.SoundFile(song.audioUrl, 
        () => {
          setIsAudioLoading(false);
          setIsAudioLoaded(true);
          
          // Properly set up the onended event
          p5SoundRef.current.onended(() => {
            console.log('Song ended naturally');
            stopRecording();
          });

        },
    
        (error: any) => {
          console.error('Error loading audio:', error);
          setIsAudioLoading(false);
          setIsAudioLoaded(false);
        }
      );
    }

    return () => {
      if (p5SoundRef.current) {
        p5SoundRef.current.stop();
      }
    };
  }, [song, isAudioLoaded, isSketchReady]);

  useEffect(() => {
    if (isSketchReady && !isMediaRecorderSetupRef.current) {
      setupMediaRecorder();
    }
  }, [isSketchReady, setupMediaRecorder]);


  const startRecording = () => {
    if (p5SoundRef.current && !isPlayingRef.current && isAudioLoaded && isSketchReady) {
      console.log('Starting recording');
      recordedChunksRef.current = [];
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        mediaRecorderRef.current.start();
        console.log('MediaRecorder started');
      } else {
        console.error('MediaRecorder not available or already active');
      }
      p5SoundRef.current.play();
      isPlayingRef.current = true;
      setIsPlaying(true);
    } else {
      console.log('Cannot start recording:', { p5SoundRef: !!p5SoundRef.current, isPlaying: isPlayingRef.current, isAudioLoaded });
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('MediaRecorder stopped');
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      console.error('MediaRecorder not available or not recording');
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  };

  const isRecordingFinished = () => {
    return !isPlaying && (window as any).recordingFinished === true;
  };

  const getRecordedVideo = () => {
    return (window as any).recordedVideoBlob;
  };

  if (isSongLoading || isAudioLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <FaSpinner className="animate-spin mr-2" size={24} />
        <p className="text-lg text-white">Loading...</p>
      </div>
    );
  }

  if (songError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <p className="text-lg text-white">Error loading song: {songError.message}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black">
      <ReactP5Wrapper sketch={sketch} />
    </div>
  );
};

export default FullscreenVisualizerPage;