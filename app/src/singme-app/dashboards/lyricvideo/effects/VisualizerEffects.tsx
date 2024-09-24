import p5 from 'p5';
import { ParticlesEffect, ParticlesTitleStyle } from './ParticlesEffect';
import { BarsEffect, BarsTitleStyle } from './BarsEffect';
import { CirclesEffect, CirclesTitleStyle } from './CirclesEffect';
import { WaveEffect, WaveTitleStyle } from './WaveEffect';
import { StarfieldEffect, StarfieldTitleStyle } from './StarfieldEffect';
import { SpectrogramEffect, SpectrogramTitleStyle } from './SpectrogramEffect';
import { LyricEffect } from './LyricEffect';

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number) => void;
  drawTitle: (p: p5, title: string) => void;
  displayLyrics: (p: p5, lyrics: Array<{ start: number; end: number; text: string }>, isPlaying: boolean, currentTime: number) => void;
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
    displayLyrics: LyricEffect
  },
  {
    name: 'Wave',
    draw: WaveEffect,
    drawTitle: WaveTitleStyle,
    displayLyrics: LyricEffect
  },
  {
    name: 'Starfield',
    draw: StarfieldEffect,
    drawTitle: StarfieldTitleStyle,
    displayLyrics: LyricEffect
  },
  {
    name: 'Spectrogram',
    draw: SpectrogramEffect,
    drawTitle: SpectrogramTitleStyle,
    displayLyrics: LyricEffect
  }
];