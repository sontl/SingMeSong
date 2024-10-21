import p5 from 'p5';
import { getSharedImage, getSharedBlurImage } from '../SharedImageLoader';

class Star {
  x: number;
  y: number;
  z: number;

  constructor(p: p5) {
    this.x = p.random(-p.width, p.width);
    this.y = p.random(-p.height, p.height);
    this.z = p.random(p.width);
  }

  update(p: p5, speed: number) {
    this.z = this.z - speed;
    if (this.z < 1) {
      this.z = p.width;
      this.x = p.random(-p.width, p.width);
      this.y = p.random(-p.height, p.height);
    }
  }

  show(p: p5) {
    let sx = p.map(this.x / this.z, 0, 1, 0, p.width);
    let sy = p.map(this.y / this.z, 0, 1, 0, p.height);
    let r = p.map(this.z, 0, p.width, 4, 0);
    p.fill(255);
    p.noStroke();
    p.ellipse(sx, sy, r, r);
  }
}

const stars: Star[] = [];
let time = 0;

export const StarfieldEffect = (p: p5, spectrum: number[], energy: number) => {
 // const blurredImg = getSharedBlurImage();
  const originalImg = getSharedImage();

  if (originalImg) {
    // Calculate animation values
    const scaleRange = 0.05;
    const scale = 1.2 + scaleRange + Math.sin(time * 0.001) * scaleRange;
    const xOffset = Math.cos(time * 0.0007) * 20;
    const yOffset = Math.sin(time * 0.0005) * 20;

    // Draw animated blurred background
    const newWidth = p.width * scale;
    const newHeight = p.height * scale;
    const x = (p.width - newWidth) / 2 + xOffset;
    const y = (p.height - newHeight) / 2 + yOffset;
    p.image(originalImg, x, y, newWidth, newHeight);
  }

  // Apply semi-transparent overlay
  const alpha = p.map(energy, 0, 255, 180, 150);
  p.fill(0, alpha);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);

  // Initialize stars if needed
  if (stars.length === 0) {
    for (let i = 0; i < 800; i++) {
      stars.push(new Star(p));
    }
  }

  p.push();
  p.translate(p.width / 2, p.height / 2);
  let speed = p.map(energy, 0, 255, 0, 20);
  
  stars.forEach(star => {
    star.update(p, speed);
    star.show(p);
  });
  p.pop();

  time += p.deltaTime * 1;
};

export const StarfieldTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(32);
  p.text(title, p.width / 2, 50);
  
  // Add twinkling stars around the title
  for (let i = 0; i < 10; i++) {
    let x = p.random(p.width);
    let y = p.random(100);
    let size = p.random(1, 3);
    p.fill(255, p.random(100, 255));
    p.ellipse(x, y, size, size);
  }
};

export const initStarfieldEffect = (p: p5): void => {
  p.background(0);
  p.imageMode(p.CORNER);
  p.rectMode(p.CORNER);
};
