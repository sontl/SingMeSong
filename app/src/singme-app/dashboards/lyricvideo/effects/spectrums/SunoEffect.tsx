import p5 from 'p5';

let blurredImg: p5.Image | null = null;
let originalImg: p5.Image | null = null;
let time = 0;
export const SunoEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]): void => {
  
  if (blurredImg) {
    // Calculate animation values
    const scaleRange = 0.05;
    const scale = 1.2 + scaleRange + Math.sin(time * 0.001) * scaleRange; // Increased base scale to 1.2
    const xOffset = Math.cos(time * 0.0007) * 20;
    const yOffset = Math.sin(time * 0.0005) * 20;

    // Draw animated blurred background to overfill the canvas
    const newWidth = p.width * scale;
    const newHeight = p.height * scale;

    const x = (p.width - newWidth) / 2 + xOffset;
    const y = (p.height - newHeight) / 2 + yOffset;
    p.image(blurredImg, x, y, newWidth, newHeight);
  }

  // Apply semi-transparent overlay
  const alpha = p.map(energy, 0, 255, 180, 150);
  p.fill(0, alpha);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);

  if (originalImg) {
    // Draw rounded square with original image in the center
    const squareSize = Math.min(p.width, p.height) * 0.5; // Increased from 0.4 to 0.5
    const cornerRadius = squareSize * 0.1;
    
    p.push();
    p.translate(p.width / 2, p.height / 2 - squareSize * 0.15);
    
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

  time += p.deltaTime * 1;

};

export const SunoTitleStyle = (p: p5, title: string): void => {
  p.fill(255);
  p.textSize(p.width * 0.02);
  p.textAlign(p.CENTER, p.TOP);
  p.text(title, p.width / 2, p.height * 0.05);
};

export const initSunoEffect = (p: p5): void => {
  p.background(0);
  p.imageMode(p.CORNER);
  p.rectMode(p.CORNER);
};

export const loadSunoImage = (p: p5, imageUrl: string): void => {
  p.loadImage(imageUrl, (loadedImg) => {
    originalImg = loadedImg.get();
  });
};

export const loadBlurImage = (p: p5, imageUrl: string): void => {
  p.loadImage(imageUrl, (loadedImg) => {
    blurredImg = loadedImg.get();
    blurredImg.filter(p.BLUR, 10); // Increased blur amount from 12 to 24
  });
};

