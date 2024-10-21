import p5 from 'p5';
import { getSharedImage } from '../SharedImageLoader';

let lastShakeTime = 0;
const shakeInterval = 500; // Minimum time between shakes in milliseconds
const energyThreshold = 200; // Minimum energy to trigger a shake (0-255)

export const ImageWaveEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {
  let shakeX = 0;
  let shakeY = 0;
 
  p.background(240, 240, 240);
  // Only shake if energy is above threshold and enough time has passed since last shake
  if (energy > energyThreshold && p.millis() - lastShakeTime > shakeInterval) {
    const maxShake = 10; // Increased maximum shake amount
    shakeX = p.map(energy, energyThreshold, 255, 0, maxShake) * (Math.random() * 2 - 1);
    shakeY = p.map(energy, energyThreshold, 255, 0, maxShake) * (Math.random() * 2 - 1);
    lastShakeTime = p.millis();
  }

  const songImage = getSharedImage();
  if (songImage) {
    const targetWidth = p.width * 0.36; // Target width is 1/4 of canvas width
    const targetHeight = p.height; // Target height is full canvas height
    const imageX = p.width - targetWidth + shakeX; // Apply shake to X position
    const imageY = 0 + shakeY; // Apply shake to Y position

    // Calculate scaling factor to fit the image height
    const scale = targetHeight / songImage.height;
    const scaledWidth = songImage.width * scale;
    const scaledHeight = targetHeight;

    // Calculate cropping values if the scaled width is larger than the target width
    const sx = scaledWidth > targetWidth ? (scaledWidth - targetWidth) / 2 / scale : 0;
    const sWidth = scaledWidth > targetWidth ? targetWidth / scale : songImage.width;

    p.image(songImage, imageX, imageY, targetWidth, targetHeight, sx, 0, sWidth, songImage.height);
  }

  // Draw the waveform
  const waveColor = p.color(173, 216, 230); // Soft light blue color
  p.noStroke();
  p.fill(waveColor);
  
  const margin = 40;
  const leftSideWidth = p.width * 0.64; // Width of the left side
  const waveWidth = leftSideWidth - margin * 2;
  const waveHeight = p.height * 0.2;
  const waveY = p.height - waveHeight - margin;
  
  const barWidth = 5;
  const barGap = 5;
  const numBars = Math.floor(waveWidth / (barWidth + barGap));
  
  // New code: Use a smaller portion of the waveform
  const waveformSubsample = 4; // Adjust this value to control the "speed" of the waveform
  const waveformStart = Math.floor(p.frameCount % (waveform.length / waveformSubsample)) * waveformSubsample;
  
  for (let i = 0; i < numBars; i++) {
    const waveformIndex = (waveformStart + Math.floor(p.map(i, 0, numBars, 0, waveform.length / waveformSubsample))) % waveform.length;
    const nextIndex = (waveformIndex + 1) % waveform.length;
    const t = (i % (waveform.length / waveformSubsample)) / (waveform.length / waveformSubsample);
    const interpolatedValue = p.lerp(Math.abs(waveform[waveformIndex]), Math.abs(waveform[nextIndex]), t);
    
    const barHeight = p.map(interpolatedValue, 0, 1, 0, waveHeight);
    const x = margin + i * (barWidth + barGap);
    const y = waveY + waveHeight / 2 - barHeight / 2;
    
    p.rect(x, y, barWidth, barHeight, 2); // Rounded corners with 2px radius
  }
};

export const ImageWaveTitleStyle = (p: p5, title: string) => {
  p.fill(0);
  p.textSize(26);
  //make text bold
  p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.TOP);
  p.text(title, 34, 34);
};

export const initImageWaveEffect = (p: p5) => {
  p.colorMode(p.RGB);
  p.background(240, 240, 240);
};
