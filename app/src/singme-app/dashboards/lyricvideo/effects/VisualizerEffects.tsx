import p5 from 'p5';
import { ParticlesEffect, ParticlesTitleStyle } from './spectrums/ParticlesEffect';
import { BarsEffect, BarsTitleStyle } from './spectrums/BarsEffect';
import { CirclesEffect, CirclesTitleStyle } from './spectrums/CirclesEffect';
import { WaveEffect, WaveTitleStyle } from './spectrums/WaveEffect';
import { StarfieldEffect, StarfieldTitleStyle } from './spectrums/StarfieldEffect';
import { SpectrogramEffect, SpectrogramTitleStyle } from './spectrums/SpectrogramEffect';
import { LyricEffect } from './lyrics/LyricEffect1';
import { GlowingLyricEffect} from './lyrics/GlowingLyricEffect';
import { ImageWaveEffect, ImageWaveTitleStyle, loadSongImage } from './spectrums/ImageWaveEffect';
import { ShadowLyricEffect, loadJosefinSansFont } from './lyrics/ShadowLyricEffect';
import { RandomHighlightLyricEffect } from './lyrics/RandomHighlightLyricEffect';
import { SixLineFadeEffect } from './lyrics/SixLineFadeEffect';
import { OceanWaveEffect, OceanWaveTitleStyle } from './spectrums/OceanWaveEffect';
import { RollingLyricEffect } from './lyrics/RollingLyricEffect';
import { PastelWaves3DEffect, PastelWaves3DTitleStyle, initPastelWaves3D } from './spectrums/PastelWaves3DEffect';
import { EverglowEffect, EverglowTitleStyle, initEverglowEffect, loadEverglowImage } from './spectrums/EverglowEffect';
import { ScrollingUpLyricEffect } from './lyrics/ScrollingUpLyricEffect';
import { SunoEffect, SunoTitleStyle, initSunoEffect, loadSunoImage } from './spectrums/SunoEffect';

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number, waveform: number[]) => void;
  drawTitle: (p: p5, title: string) => void;
  displayLyrics: (p: p5, lyrics: Array<{ start: number; end: number; sentence: string; words: Array<{ text: string; start: number; end: number }> }>, isPlaying: boolean, currentTime: number) => void;
  loadImage?: (p: p5, imageUrl: string) => void;
  initConfig: (p: p5) => void;
  
};

export const visualizerEffects: VisualizerEffect[] = [
  {
    name: 'Particles',
    draw: ParticlesEffect,
    drawTitle: ParticlesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => ScrollingUpLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0, 10),
  
  },
  {
    name: 'Bars',
    draw: BarsEffect,
    drawTitle: BarsTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => SixLineFadeEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.1, fontSize: 0.5, textColor: p.color(255, 255, 255) }),
    initConfig: (p: p5) => p.background(0),
   
  },
  {
    name: 'Circles',
    draw: CirclesEffect,
    drawTitle: CirclesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
        fontSize: 0.03, 
        bottomMargin: 0.05, 
        fadeInDuration: 0.5, 
        fadeOutDuration: 0.5,
        enableWaveEffect: false // Wave effect disabled
      }),
    initConfig: (p: p5) => p.background(0),
   
  },
  {
    name: 'Wave',
    draw: WaveEffect,
    drawTitle: WaveTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0),
  },
  {
    name: 'Starfield',
    draw: StarfieldEffect,
    drawTitle: StarfieldTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0),
  },
  {
    name: 'Spectrogram',
    draw: SpectrogramEffect,
    drawTitle: SpectrogramTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => SixLineFadeEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.1, fontSize: 0.36, textColor: p.color(255, 255, 255) }),
    initConfig: (p: p5) => p.background(0),
    
  }, 
  {
    name: 'ImageWave',
    draw: ImageWaveEffect,
    drawTitle: ImageWaveTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => RandomHighlightLyricEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.04, fontSize: 0.66 }),
    loadImage: loadSongImage,
    initConfig: (p: p5) => {
      p.colorMode(p.RGB);
      p.background(240, 240, 240);
      loadJosefinSansFont(p);  // Load the font during initialization
    }
  },
  {
    name: 'OceanWave',
    draw: OceanWaveEffect,
    drawTitle: OceanWaveTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
        fontSize: 0.06, 
        bottomMargin: 0.05, 
        fadeInDuration: 0.4, 
        fadeOutDuration: 0.4,
        enableWaveEffect: true, // Wave effect enabled
        waveAmplitude: 5,
        waveFrequency: 0.1,
        waveSpeed: 0.05
      }),
    loadImage: loadSongImage,  // Add this line
    initConfig: (p: p5) => {
      p.colorMode(p.HSB);
      p.background(0);
    },
   
  },
  {
    name: 'PastelWaves3D',
    draw: PastelWaves3DEffect,
    drawTitle: PastelWaves3DTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
        fontSize: 0.04, 
        bottomMargin: 0.1, 
        fadeInDuration: 0.5, 
        fadeOutDuration: 0.5,
        enableWaveEffect: true,
        waveAmplitude: 3,
        waveFrequency: 0.05,
        waveSpeed: 0.03
      }),
    initConfig: initPastelWaves3D,
  },
  {
    name: 'Everglow',
    draw: EverglowEffect,
    drawTitle: EverglowTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
        fontSize: 0.04, 
        bottomMargin: 0.1, 
        fadeInDuration: 0.5, 
        fadeOutDuration: 0.5,
        enableWaveEffect: true,
        waveAmplitude: 3,
        waveFrequency: 0.05,
        waveSpeed: 0.03
      }),
    initConfig: initEverglowEffect,
    loadImage: loadEverglowImage,
  },
  {
    name: 'Suno',
    draw: SunoEffect,
    drawTitle: SunoTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => ScrollingUpLyricEffect(p, lyrics, isPlaying, currentTime),
    loadImage: loadSunoImage,
    initConfig: initSunoEffect,
  },
];
