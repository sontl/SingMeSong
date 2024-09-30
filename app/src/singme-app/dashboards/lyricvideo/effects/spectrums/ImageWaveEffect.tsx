import p5 from 'p5';

let songImage: p5.Image | null = null;

export const ImageWaveEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {
  // Draw the song image on the right side
  if (songImage) {
    const targetWidth = p.width * 0.36; // Target width is 1/4 of canvas width
    const targetHeight = p.height; // Target height is full canvas height
    const imageX = p.width - targetWidth;
    const imageY = 0;

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
  
  for (let i = 0; i < numBars; i++) {
    const waveformIndex = Math.floor(p.map(i, 0, numBars, 0, waveform.length));
    const barHeight = p.map(Math.abs(waveform[waveformIndex]), 0, 1, 0, waveHeight);
    const x = margin + i * (barWidth + barGap);
    const y = waveY + waveHeight / 2 - barHeight / 2;
    
    p.rect(x, y, barWidth, barHeight, 2); // Rounded corners with 2px radius
  }

  // Draw the center line
  p.stroke(255, 255, 255, 100); // Semi-transparent white
  p.strokeWeight(1);
  p.line(margin, waveY + waveHeight / 2, margin + waveWidth, waveY + waveHeight / 2);
};

export const ImageWaveTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textSize(32);
  p.textAlign(p.LEFT, p.TOP);
  p.text(title, 20, 20);
};

// Modify the loadSongImage function
export const loadSongImage = (p: p5, imageUrl: string) => {
  if (!songImage) {
    p.loadImage(imageUrl, (img) => {
      songImage = img;
    });
  }
};

// Add a new function to clear the image when changing songs
export const clearSongImage = () => {
  songImage = null;
};