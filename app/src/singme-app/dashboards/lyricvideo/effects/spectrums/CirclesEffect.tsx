import p5 from 'p5';

let originalImg: p5.Image | null = null;
let maskImg: p5.Graphics | null = null;
let bgImg: p5.Image | null = null;
let time = 0;

export const CirclesEffect = (p: p5, spectrum: number[], energy: number) => {
  p.push(); // Save the current drawing state
  
  // Draw animated background
  if (bgImg) {
    drawAnimatedBackground(p, energy);
  }
  
  p.noFill();
  p.colorMode(p.HSB, 360, 100, 100, 1); // Use HSB color mode for easier color manipulation
  
  // Use the entire canvas for the effect
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  const maxRadius = Math.min(p.width, p.height) * 0.75; // Increased from 0.4 to 0.75
  
  // Draw the spectrum lines
  for (let i = 0; i < spectrum.length; i += 5) {
    let angle = p.map(i, 0, spectrum.length, 0, p.TWO_PI);
    let amp = spectrum[i];
    let r = p.map(amp, 0, 256, maxRadius * 0.2, maxRadius);
    let x = centerX + r * p.cos(angle);
    let y = centerY + r * p.sin(angle);
    
    // Create a vibrant color based on the angle and amplitude
    let hue = p.map(angle, 0, p.TWO_PI, 0, 360);
    let saturation = p.map(amp, 0, 256, 50, 100);
    let brightness = p.map(amp, 0, 256, 70, 100);
    
    p.stroke(hue, saturation, brightness);
    p.strokeWeight(2);
    p.line(centerX, centerY, x, y);
  }
  
  // Draw the circular image in the center if it's loaded
  if (originalImg && maskImg) {
    const imgSize = maxRadius * 0.66; // Increased from 0.4 to 0.66
    p.imageMode(p.CENTER);
    
    // Apply the circular mask to the original image
    let maskedImg = originalImg.get();
    (maskedImg as any).mask(maskImg);
    
    // Draw the masked (circular) image
    p.image(maskedImg, centerX, centerY, imgSize, imgSize);

    // Add glowing dotted border with colors based on the spectrum
    drawGlowingDottedBorder(p, centerX, centerY, imgSize, spectrum);
  }
  
  p.pop(); // Restore the previous drawing state
  
  // Update time for animation
  time += p.deltaTime * 0.001;
};

const drawAnimatedBackground = (p: p5, energy: number) => {
  p.push();
  
  // Calculate animation values
  const scaleRange = 0.05;
  const scale = 1.2 + scaleRange + p.sin(time * 0.5) * scaleRange;
  const xOffset = p.cos(time * 0.3) * 20;
  const yOffset = p.sin(time * 0.2) * 20;

  // Draw animated blurred background
  const newWidth = p.width * scale;
  const newHeight = p.height * scale;
  const x = (p.width - newWidth) / 2 + xOffset;
  const y = (p.height - newHeight) / 2 + yOffset;
  
  (p as any).image(bgImg, x, y, newWidth, newHeight);
  
  // Apply semi-transparent overlay with reduced opacity
  const alpha = p.map(energy, 0, 255, 150, 150);
  p.fill(0, alpha);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);
  
  p.pop();
};

export const CirclesTitleStyle = (p: p5, title: string) => {
  
  p.fill(255);
  p.textSize(24);
  p.textAlign(p.CENTER, p.TOP);
  p.text(title, p.width / 2, 20);
  
};

export const loadCirclesImage = (p: p5, imageUrl: string): void => {
  
};

export const loadCirclesBlurImage = (p: p5, imageUrl: string): void => {
  p.loadImage(imageUrl, (loadedImg) => {
    bgImg = loadedImg.get();
    bgImg.filter(p.BLUR, 6);

    originalImg = loadedImg.get();
    // Create a circular mask
    const size = Math.min(loadedImg.width, loadedImg.height);
    maskImg = p.createGraphics(size, size);
    maskImg.ellipseMode(p.CENTER);
    maskImg.fill(255);
    maskImg.noStroke();
    maskImg.ellipse(size/2, size/2, size, size);
  });   

  p.loadImage(imageUrl, (loadedImg) => {

  
  });
};

// Update the drawDottedBorder function to create a glowing effect
const drawGlowingDottedBorder = (p: p5, x: number, y: number, size: number, spectrum: number[]) => {
  const numDots = 100;
  const baseDotSize = 3;
  const radius = size / 2 + 5; // Slightly larger than the image
  const glowLayers = 3; // Reduced number of glow layers for less prominent glow

  // Calculate bass intensity (use the first few elements of the spectrum)
  const bassRange = 10; // Adjust this value to change how many low frequencies to consider
  const bassIntensity = spectrum.slice(0, bassRange).reduce((sum, val) => sum + val, 0) / bassRange;
  const bassScale = p.map(bassIntensity, 0, 255, 1, 1.5); // Max 50% increase in size

  p.push();
  p.noStroke();
  p.colorMode(p.HSB, 360, 100, 100, 1);

  for (let i = 0; i < numDots; i++) {
    const angle = p.map(i, 0, numDots, 0, p.TWO_PI);
    const dotX = x + radius * p.cos(angle);
    const dotY = y + radius * p.sin(angle);

    const spectrumIndex = Math.floor(p.map(i, 0, numDots, 0, spectrum.length - 1));
    const amp = spectrum[spectrumIndex];

    const hue = p.map(angle, 0, p.TWO_PI, 0, 360);
    const saturation = p.map(amp, 0, 256, 50, 100);
    const brightness = p.map(amp, 0, 256, 70, 100);

    // Apply bass-reactive scaling to dot size
    const scaledBaseDotSize = baseDotSize * bassScale;

    // Draw glow effect with reduced opacity in normal mode
    for (let j = glowLayers; j > 0; j--) {
      const baseAlpha = p.map(j, 0, glowLayers, 0.05, 0.2); // Reduced base alpha values
      const alpha = baseAlpha * bassScale; // Increase alpha with bass intensity
      const dotSize = scaledBaseDotSize + (glowLayers - j) * 2 * bassScale;
      p.fill(hue, saturation, brightness, alpha);
      p.ellipse(dotX, dotY, dotSize, dotSize);
    }

    // Draw main dot
    p.fill(hue, saturation, brightness);
    p.ellipse(dotX, dotY, scaledBaseDotSize, scaledBaseDotSize);
  }

  p.pop();
};
