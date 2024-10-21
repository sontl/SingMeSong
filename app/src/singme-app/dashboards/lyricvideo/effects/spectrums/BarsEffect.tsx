import p5 from 'p5';
import { getSharedImage, getSharedBlurImage } from '../SharedImageLoader';

let time = 0;
let prevSpectrum: number[] = [];

export const BarsEffect = (p: p5, spectrum: number[], energy: number) => {
  const blurredImg = getSharedBlurImage();
  const originalImg = getSharedImage();

  if (blurredImg) {
    // Simplified background animation
    const scale = 1.2 + 0.05 * Math.sin(time * 0.001);
    const xOffset = Math.cos(time * 0.0007) * 10;
    const yOffset = Math.sin(time * 0.0005) * 10;

    const newWidth = p.width * scale;
    const newHeight = p.height * scale;
    const x = (p.width - newWidth) / 2 + xOffset;
    const y = (p.height - newHeight) / 2 + yOffset;
    p.image(blurredImg, x, y, newWidth, newHeight);
  } else {
    p.background(0);
  }

  // Apply semi-transparent overlay
  p.fill(0, p.map(energy, 0, 255, 180, 150));
  p.rect(0, 0, p.width, p.height);

  // Smooth transition for spectrum values
  if (prevSpectrum.length === 0) {
    prevSpectrum = spectrum.slice();
  } else {
    for (let i = 0; i < spectrum.length; i++) {
      prevSpectrum[i] = prevSpectrum[i] * 0.8 + spectrum[i] * 0.2;
    }
  }

  // Draw spectrum bars
  p.noStroke();
  const zoomFactor = 2; // Zoom in factor
  const barWidth = (p.width * zoomFactor) / spectrum.length;
  const maxHeight = p.height * 0.4;

  // Calculate the start position to center the zoomed-in bars
  const startX = -(p.width * (zoomFactor - 1)) / 2;

  for (let i = 0; i < spectrum.length; i++) {
    let h = p.map(prevSpectrum[i], 0, 255, 0, maxHeight);
    let hue = p.map(i, 0, spectrum.length - 1, 180, 360);
    
    // Make bars more transparent
    p.fill(hue, 100, 100, 50); // Reduced alpha to 50 (was 100)
    p.rect(startX + i * barWidth, p.height - h, barWidth, h);
  }

  if (originalImg) {
    // Draw rounded square with original image on the right side
    const squareSize = Math.min(p.width, p.height) * 0.5; // Increased from 0.3 to 0.4
    const cornerRadius = squareSize * 0.1;
    
    p.push();
    p.translate(p.width - squareSize * 0.86, p.height / 2); // Moved to the left (from 0.6 to 0.8)
    
    // Clip the image to the rounded square
    (p as any).clip(() => {
      p.rect(-squareSize/2, -squareSize/2, squareSize, squareSize, cornerRadius);
    });
    
    // Draw the original image
    const imgScale = Math.max(squareSize / originalImg.width, squareSize / originalImg.height);
    const imgWidth = originalImg.width * imgScale;
    const imgHeight = originalImg.height * imgScale;
    p.image(originalImg, -imgWidth/2, -imgHeight/2, imgWidth, imgHeight);
    
    p.pop();
  }

  time += p.deltaTime;
};

export const BarsTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(28);
  
  // Create a 3D effect
  for (let i = 0; i < 5; i++) {
    p.fill(255, 255 - i * 50);
    p.text(title, p.width / 2 + i, 50 + i);
  }
};
