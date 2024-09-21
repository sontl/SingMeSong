import p5 from 'p5';
import { ParticlesEffect, ParticlesTitleStyle } from './ParticlesEffect';
import { BarsEffect, BarsTitleStyle } from './BarsEffect';
import { CirclesEffect, CirclesTitleStyle } from './CirclesEffect';
import { WaveEffect, WaveTitleStyle } from './WaveEffect';
import { StarfieldEffect, StarfieldTitleStyle } from './StarfieldEffect';
import { SpectrogramEffect, SpectrogramTitleStyle } from './SpectrogramEffect';

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number) => void;
  drawTitle: (p: p5, title: string) => void;
};

export const visualizerEffects: VisualizerEffect[] = [
  {
    name: 'Particles',
    draw: ParticlesEffect,
    drawTitle: ParticlesTitleStyle
  },
  {
    name: 'Bars',
    draw: BarsEffect,
    drawTitle: BarsTitleStyle
  },
  {
    name: 'Circles',
    draw: CirclesEffect,
    drawTitle: CirclesTitleStyle
  },
  {
    name: 'Wave',
    draw: WaveEffect,
    drawTitle: WaveTitleStyle
  },
  {
    name: 'Starfield',
    draw: StarfieldEffect,
    drawTitle: StarfieldTitleStyle
  },
  {
    name: 'Spectrogram',
    draw: SpectrogramEffect,
    drawTitle: SpectrogramTitleStyle
  }
];