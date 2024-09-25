import p5 from 'p5';
import { ParticlesEffect, ParticlesTitleStyle } from './spectrums/ParticlesEffect';
import { BarsEffect, BarsTitleStyle } from './spectrums/BarsEffect';
import { CirclesEffect, CirclesTitleStyle } from './spectrums/CirclesEffect';
import { WaveEffect, WaveTitleStyle } from './spectrums/WaveEffect';
import { StarfieldEffect, StarfieldTitleStyle } from './spectrums/StarfieldEffect';
import { SpectrogramEffect, SpectrogramTitleStyle } from './spectrums/SpectrogramEffect';
import { LyricEffect } from './lyrics/LyricEffect1';
import { GlowingLyricEffect} from './lyrics/GlowingLyricEffect';

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number) => void;
  drawTitle: (p: p5, title: string) => void;
  displayLyrics: (p: p5, lyrics: Array<{ start: number; end: number; text: string; words: Array<{ text: string; start: number; end: number }> }>, isPlaying: boolean, currentTime: number) => void;
};

export const visualizerEffects: VisualizerEffect[] = [
  {
    name: 'Particles',
    draw: ParticlesEffect,
    drawTitle: ParticlesTitleStyle,
    displayLyrics: LyricEffect
  },
  {
    name: 'Bars',
    draw: BarsEffect,
    drawTitle: BarsTitleStyle,
    displayLyrics: LyricEffect
  },
  {
    name: 'Circles',
    draw: CirclesEffect,
    drawTitle: CirclesTitleStyle,
    displayLyrics: GlowingLyricEffect
  },
  {
    name: 'Wave',
    draw: WaveEffect,
    drawTitle: WaveTitleStyle,
    displayLyrics: GlowingLyricEffect
  },
  {
    name: 'Starfield',
    draw: StarfieldEffect,
    drawTitle: StarfieldTitleStyle,
    displayLyrics: GlowingLyricEffect
  },
  {
    name: 'Spectrogram',
    draw: SpectrogramEffect,
    drawTitle: SpectrogramTitleStyle,
    displayLyrics: GlowingLyricEffect
  }, 

];