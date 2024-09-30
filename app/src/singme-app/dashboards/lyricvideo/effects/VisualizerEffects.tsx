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

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number, waveform: number[]) => void;
  drawTitle: (p: p5, title: string) => void;
  displayLyrics: (p: p5, lyrics: Array<{ start: number; end: number; sentence: string; words: Array<{ text: string; start: number; end: number }> }>, isPlaying: boolean, currentTime: number) => void;
  loadImage?: (p: p5, imageUrl: string) => void;
  initConfig: (p: p5) => void;
  config?: {
    leftMargin?: number;
    fontSize?: number;
  };
};

export const visualizerEffects: VisualizerEffect[] = [
  {
    name: 'Particles',
    draw: ParticlesEffect,
    drawTitle: ParticlesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0, 10),
    config: {
      leftMargin: 0.1, // 10% of screen width
    },  
  },
  {
    name: 'Bars',
    draw: BarsEffect,
    drawTitle: BarsTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => SixLineFadeEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.1, fontSize: 0.5, textColor: p.color(255, 255, 255) }),
    initConfig: (p: p5) => p.background(0),
    config: {
      leftMargin: 0.1, // 10% of screen width
      fontSize: 0.86,
    },
  },
  {
    name: 'Circles',
    draw: CirclesEffect,
    drawTitle: CirclesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0),
    config: {
      leftMargin: 0.1, // 10% of screen width
    },
  },
  {
    name: 'Wave',
    draw: WaveEffect,
    drawTitle: WaveTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0),
    config: {
      leftMargin: 0.1, // 10% of screen width
    },
  },
  {
    name: 'Starfield',
    draw: StarfieldEffect,
    drawTitle: StarfieldTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => p.background(0),
    config: {
      leftMargin: 0.1, // 10% of screen width
    },
  },
  {
    name: 'Spectrogram',
    draw: SpectrogramEffect,
    drawTitle: SpectrogramTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => SixLineFadeEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.1, fontSize: 0.36, textColor: p.color(255, 255, 255) }),
    initConfig: (p: p5) => p.background(0),
    config: {
      leftMargin: 0.1, // 10% of screen width
    },
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
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    initConfig: (p: p5) => {
      p.colorMode(p.HSB);
      p.background(0);
    },
    config: {
      leftMargin: 0.1,
    },
  },
];