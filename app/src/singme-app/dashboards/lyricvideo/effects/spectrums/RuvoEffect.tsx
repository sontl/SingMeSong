import p5 from 'p5';

let img: p5.Image;
let bgimg: p5.Image;
let imgMask: p5.Graphics;
let font: p5.Font;
let time = 0;

export const loadRuvoImages = (p: p5, imageUrl: string) => {
  img = p.loadImage(imageUrl);
  font = p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf');
};

export const loadRuvoBlurImage = (p: p5, imageUrl: string) => {
  bgimg = p.loadImage(imageUrl);
};

export const initRuvoEffect = (p: p5) => {
  p.textFont(font);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(16);
  bgimg.filter(p.BLUR, 12);

  // Create a circular mask for the image
  imgMask = p.createGraphics(img.width, img.height);
  imgMask.ellipse(img.width/2, img.height/2, img.width, img.height);
};

export const RuvoEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {
  drawAnimatedBackground(p, energy);
  drawVisualizer(p, spectrum, waveform);
  createCircularImage(p, spectrum, waveform);
  
  // Update time for animation
  time += p.deltaTime * 0.001;  // Slowed down animation
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
  
  p.image(bgimg, x, y, newWidth, newHeight);
  
  // Apply semi-transparent overlay
  const alpha = p.map(energy, 0, 255, 180, 150);
  p.fill(0, alpha);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);
  
  p.pop();
};

const drawVisualizer = (p: p5, spectrum: number[], wave: number[]) => {
  let centerX = p.width / 2;
  let centerY = p.height / 2;
  let radius = 140;

  // Draw spectrum
  p.noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let angle = p.map(i, 0, spectrum.length, 0, p.TWO_PI);
    let r = p.map(spectrum[i], 0, 255, radius, radius + 100);
    let x = centerX + r * p.cos(angle);
    let y = centerY + r * p.sin(angle);
    p.fill(spectrum[i], 255 - spectrum[i], 255);
    p.ellipse(x, y, 4, 4);
  }

  // Draw waveform
  p.stroke(255, 165, 0);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < wave.length; i++) {
    let angle = p.map(i, 0, wave.length, 0, p.TWO_PI);
    let r = p.map(wave[i], -1, 1, radius - 20, radius + 20);
    let x = centerX + r * p.cos(angle);
    let y = centerY + r * p.sin(angle);
    p.vertex(x, y);
  }
  p.endShape(p.CLOSE);
};

const createCircularImage = (p: p5, spectrum: number[], wave: number[]) => {
  // Calculate the size and position of the circular image
  let imgSize = p.min(p.width, p.height) * 0.6;  // Increased from 0.4 to 0.7
  let imgX = p.width/2 - imgSize/2;
  let imgY = p.height/2 - imgSize/2;
  
  // Draw the circular image
  p.push();
  p.translate(p.width/2, p.height/2);
  p.imageMode(p.CENTER);
  (img as any).mask(imgMask);
  p.image(img, 0, 0, imgSize, imgSize);
  p.pop();
  
  // Draw the central visualizer
  p.noFill();
  p.strokeWeight(2);
  
  // Draw top waveform (curved shape)
  p.noFill();
  p.stroke(255, 165, 0);  // orange color
  p.strokeWeight(2);
  p.beginShape();
  for (let i = 0; i < wave.length; i++) {
    let x = p.map(i, 0, wave.length, 0, p.width);
    let y = p.map(wave[i], -1, 1, p.height * 0.01, p.height * 0.1);
    p.curveVertex(x, y);
  }
  p.endShape();
  
  // Draw bottom waveform (angular shape)
  p.stroke(0, 255, 255);  // Cyan color
  p.beginShape();
  for (let i = 0; i < wave.length; i += 20) {  // Increase step for more angular shape
    let x = p.map(i, 0, wave.length, 0, p.width);
    let y = p.map(wave[i], -1, 1, p.height * 0.8, p.height * 0.99);
    p.vertex(x, y);
  }
  p.endShape();
};

export const RuvoTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textSize(24);
  p.textAlign(p.CENTER, p.TOP);
  p.text(title, p.width / 2, 20);
};
