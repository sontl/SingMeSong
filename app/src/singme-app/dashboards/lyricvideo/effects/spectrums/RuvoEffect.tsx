import p5 from 'p5';
import { getSharedImage, getSharedBlurImage } from '../SharedImageLoader';

let imgMask: p5.Graphics;
let font: p5.Font;
let time = 0;

export const initRuvoEffect = (p: p5) => {
  font = p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
  p.textFont(font);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(16);

  const img = getSharedImage();
  if (img && !imgMask) {
    imgMask = p.createGraphics(img.width, img.height);
    imgMask.ellipse(img.width/2, img.height/2, img.width, img.height);
  }
};

export const RuvoEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {
  const img = getSharedImage();
  const bgimg = getSharedBlurImage();

  drawAnimatedBackground(p, energy, bgimg);
  drawVisualizer(p, spectrum, waveform);
  createCircularImage(p, spectrum, waveform, img);
  
  // Update time for animation
  time += p.deltaTime * 0.001;
};

const drawAnimatedBackground = (p: p5, energy: number, bgimg: p5.Image | null) => {
  p.push();
  
  // Calculate animation values
  const scaleRange = 0.05;
  const scale = 1.2 + scaleRange + p.sin(time * 0.5) * scaleRange;
  const xOffset = p.cos(time * 0.3) * 20;
  const yOffset = p.sin(time * 0.2) * 20;

  // Draw animated blurred background if bgimg is not null
  if (bgimg) {
    const newWidth = p.width * scale;
    const newHeight = p.height * scale;
    const x = (p.width - newWidth) / 2 + xOffset;
    const y = (p.height - newHeight) / 2 + yOffset;
    p.image(bgimg, x, y, newWidth, newHeight);
  }
  
  // Apply semi-transparent overlay with reduced opacity
  const alpha = p.map(energy, 0, 255, 150, 150);
  p.fill(0, alpha);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);
  
  p.pop();
};

const drawVisualizer = (p: p5, spectrum: number[], wave: number[]) => {
  let centerX = p.width / 2;
  let centerY = p.height / 2;
  let minDimension = Math.min(p.width, p.height);
  
  // Base radius on the smaller dimension of the canvas
  let radius = minDimension * 0.3; // 20% of the smaller dimension
  let maxExpansion = minDimension * 0.1; // 5% of the smaller dimension

  // Draw spectrum
  p.noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let angle = p.map(i, 0, spectrum.length, 0, p.TWO_PI);
    let r = p.map(spectrum[i], 0, 255, radius, radius + maxExpansion);
    let x = centerX + r * p.cos(angle);
    let y = centerY + r * p.sin(angle);
    p.fill(spectrum[i], 255 - spectrum[i], 255);
    p.ellipse(x, y, minDimension * 0.01, minDimension * 0.01); // Point size based on canvas size
  }

  // Draw waveform
  p.stroke(255, 165, 0);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < wave.length; i++) {
    let angle = p.map(i, 0, wave.length, 0, p.TWO_PI);
    let r = p.map(wave[i], -1, 1, radius - (minDimension * 0.1), radius + (minDimension * 0.1));
    let x = centerX + r * p.cos(angle);
    let y = centerY + r * p.sin(angle);
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);
};

const createCircularImage = (p: p5, spectrum: number[], wave: number[], img: p5.Image | null) => {
  // Calculate the size and position of the circular image
  let imgSize = p.min(p.width, p.height) * 0.56;  // Increased from 0.4 to 0.7
  let imgX = p.width/2 - imgSize/2;
  let imgY = p.height/2 - imgSize/2;
  
  // Draw the circular image
  p.push();
  p.translate(p.width/2, p.height/2);
  p.imageMode(p.CENTER);
  if (img && imgMask) {
    (img as any).mask(imgMask);
    p.image(img, 0, 0, imgSize, imgSize);
  }
  p.pop();
  
  // Draw the central visualizer
  p.noFill();
  p.strokeWeight(2);
  
};

export const RuvoTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textSize(24);
  p.textAlign(p.CENTER, p.TOP);
  p.text(title, p.width / 2, 20);
};
