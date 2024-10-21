import p5 from 'p5';
import { ParticlesEffect, ParticlesTitleStyle } from './spectrums/ParticlesEffect';
import { BarsEffect, BarsTitleStyle } from './spectrums/BarsEffect';
import { CirclesEffect, CirclesTitleStyle, initCirclesEffect, loadCirclesBlurImage, loadCirclesImage } from './spectrums/CirclesEffect';
import { WaveEffect, WaveTitleStyle } from './spectrums/WaveEffect';
import { StarfieldEffect, StarfieldTitleStyle } from './spectrums/StarfieldEffect';
import { SpectrogramEffect, SpectrogramTitleStyle } from './spectrums/SpectrogramEffect';
import { LyricEffect } from './lyrics/LyricEffect1';
import { GlowingLyricEffect} from './lyrics/GlowingLyricEffect';
import { SingleWordLyricEffect } from './lyrics/SingleWordLyricEffect';
import { ImageWaveEffect, ImageWaveTitleStyle, initImageWaveEffect, loadSongImage } from './spectrums/ImageWaveEffect';
import { ShadowLyricEffect, loadJosefinSansFont } from './lyrics/ShadowLyricEffect';
import { RandomHighlightLyricEffect } from './lyrics/RandomHighlightLyricEffect';
import { SixLineFadeEffect } from './lyrics/SixLineFadeEffect';
import { OceanWaveEffect, OceanWaveTitleStyle, initOceanWaveEffect } from './spectrums/OceanWaveEffect';
import { RollingLyricEffect } from './lyrics/RollingLyricEffect';
import { PastelWaves3DEffect, PastelWaves3DTitleStyle, initPastelWaves3D } from './spectrums/PastelWaves3DEffect';
import { ScrollingUpLyricEffect } from './lyrics/ScrollingUpLyricEffect';
import { SunoEffect, SunoTitleStyle, initSunoEffect, loadSunoImage, loadBlurImage } from './spectrums/SunoEffect';
import { RuvoEffect, RuvoTitleStyle, initRuvoEffect, loadRuvoImages, loadRuvoBlurImage } from './spectrums/RuvoEffect';
import { GlowingWaveformEffect, GlowingWaveformTitleStyle, initGlowingWaveform } from './spectrums/GlowingWaveformEffect';
import { SymmetricWaveParticlesEffect, SymmetricWaveParticlesTitleStyle, initSymmetricWaveParticles } from './spectrums/SymmetricWaveParticlesEffect';

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number, waveform: number[], fft?: p5.FFT) => void;
  drawTitle: (p: p5, title: string) => void;
  displayLyrics: (p: p5, lyrics: Array<{ start: number; end: number; sentence: string; words: Array<{ text: string; start: number; end: number }> }>, isPlaying: boolean, currentTime: number) => void;
  loadImage?: (p: p5, imageUrl: string) => void;
  loadSmallImage?: (p: p5, imageUrl: string) => void;
  setup: (p: p5) => void;
};

export const visualizerEffects: VisualizerEffect[] = [
  {
    name: 'Suno',
    draw: SunoEffect,
    drawTitle: SunoTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => ScrollingUpLyricEffect(p, lyrics, isPlaying, currentTime),
    loadImage: loadSunoImage,
    loadSmallImage: loadBlurImage,
    setup: initSunoEffect,
  },

  {
    name: 'Ruvo',
    draw: RuvoEffect,
    drawTitle: RuvoTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      RollingLyricEffect(p, lyrics, isPlaying, currentTime, {fontSize: 0.05, bottomMargin: 0.06}),
    loadImage: loadRuvoImages,
    loadSmallImage: loadRuvoBlurImage,
    setup: initRuvoEffect,
  },
  {
    name: 'Circles',
    draw: CirclesEffect,
    drawTitle: CirclesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
        fontSize: 0.06, 
        bottomMargin: 0.05, 
        fadeInDuration: 0.5, 
        fadeOutDuration: 0.5,
        enableWaveEffect: false // Wave effect disabled
      }),
    loadImage: loadCirclesImage,
    loadSmallImage: loadCirclesBlurImage,
    setup: initCirclesEffect,
  },
  {
    name: 'ImageWave',
    draw: ImageWaveEffect,
    drawTitle: ImageWaveTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => RandomHighlightLyricEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.04, fontSize: 0.66 }),
    loadImage: loadSongImage,
    loadSmallImage: loadSongImage,
    setup: initImageWaveEffect,
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
    setup: initOceanWaveEffect,
  },
  
  // {
  //   name: 'Bars',
  //   draw: BarsEffect,
  //   drawTitle: BarsTitleStyle,
  //   displayLyrics: (p, lyrics, isPlaying, currentTime) => SixLineFadeEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.1, fontSize: 0.5, textColor: p.color(255, 255, 255) }),
  //   initConfig: (p: p5) => p.background(0),
   
  // },
  
  // {
  //   name: 'Wave',
  //   draw: WaveEffect,
  //   drawTitle: WaveTitleStyle,
  //   displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
  //   initConfig: (p: p5) => p.background(0),
  // },
  // {
  //   name: 'Spectrogram',
  //   draw: SpectrogramEffect,
  //   drawTitle: SpectrogramTitleStyle,
  //   displayLyrics: (p, lyrics, isPlaying, currentTime) => SixLineFadeEffect(p, lyrics, isPlaying, currentTime, { leftMargin: 0.1, fontSize: 0.36, textColor: p.color(255, 255, 255) }),
  //   initConfig: (p: p5) => p.background(0),
    
  // }, 
 
  // {
  //   name: 'PastelWaves3D',
  //   draw: PastelWaves3DEffect,
  //   drawTitle: PastelWaves3DTitleStyle,
  //   displayLyrics: (p, lyrics, isPlaying, currentTime) => 
  //     RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
  //       fontSize: 0.04, 
  //       bottomMargin: 0.1, 
  //       fadeInDuration: 0.5, 
  //       fadeOutDuration: 0.5,
  //       enableWaveEffect: true,
  //       waveAmplitude: 3,
  //       waveFrequency: 0.05,
  //       waveSpeed: 0.03
  //     }),
  //   initConfig: initPastelWaves3D,
  // },
  
  // {
  //   name: 'GlowingWaveform',
  //   draw: GlowingWaveformEffect,
  //   drawTitle: GlowingWaveformTitleStyle,
  //   displayLyrics: (p, lyrics, isPlaying, currentTime) => 
  //     RollingLyricEffect(p, lyrics, isPlaying, currentTime, { 
  //       fontSize: 0.04, 
  //       bottomMargin: 0.1, 
  //       fadeInDuration: 0.5, 
  //       fadeOutDuration: 0.5,
  //       enableWaveEffect: false,
  //     }),
  //   setup: initGlowingWaveform,
  // },
  {
    name: 'SymmetricWaveParticles',
    draw: SymmetricWaveParticlesEffect,
    drawTitle: SymmetricWaveParticlesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => 
      SingleWordLyricEffect(p, lyrics, isPlaying, currentTime),
    setup: initSymmetricWaveParticles,
  },

  {
    name: 'Starfield',
    draw: StarfieldEffect,
    drawTitle: StarfieldTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    setup: (p: p5) => p.background(0),
  },
  {
    name: 'Particles',
    draw: ParticlesEffect,
    drawTitle: ParticlesTitleStyle,
    displayLyrics: (p, lyrics, isPlaying, currentTime) => GlowingLyricEffect(p, lyrics, isPlaying, currentTime),
    setup: (p: p5) => p.background(0, 10),
  
  },
];
