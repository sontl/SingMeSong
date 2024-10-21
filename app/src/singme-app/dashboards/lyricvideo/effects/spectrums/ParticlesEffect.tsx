import p5 from 'p5';
import { getSharedImage, getSharedBlurImage } from '../SharedImageLoader';

class Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  w: number;
  color: p5.Color;

  constructor(p: p5) {
    this.pos = p.createVector(p.random(p.width), p.random(p.height));
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.w = p.random(3, 5);
    this.color = p.color(p.random(200, 255), p.random(200, 255), p.random(200, 255), 150);
  }

  update(p: p5, energy: number) {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    if (energy > 230) {
      this.pos.y = p.random(p.height);
    }

    if (this.pos.y < 0 || this.pos.y > p.height) {
      this.pos.y = p.random(p.height);
    }
  }

  show(p: p5) {
    p.noStroke();
    p.fill(this.color);
    p.ellipse(this.pos.x, this.pos.y, this.w);
  }
}

let particles: Particle[] = [];
let time = 0;

export const ParticlesEffect = (p: p5, spectrum: number[], energy: number) => {
  const blurredImg = getSharedBlurImage();
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

  // Existing particle logic
  if (particles.length === 0) {
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle(p));
    }
  }

  particles.forEach(particle => {
    let x = p.map(particle.pos.x, 0, p.width, 0, spectrum.length);
    let scaleVal = p.map(spectrum[Math.floor(x)], 0, 255, 0, 1);
    particle.vel.y = p.map(scaleVal, 0, 1, -1, 1);
    particle.update(p, energy);
    particle.show(p);
  });

  time += p.deltaTime * 1;
};

export const ParticlesTitleStyle = (p: p5, title: string) => {
  p.push();
  p.colorMode(p.HSB);
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(p.height * 0.06);
  p.textStyle(p.BOLD);
  
  // Create a glowing effect
  p.drawingContext.shadowBlur = 10;
  p.drawingContext.shadowColor = 'rgba(255, 255, 255, 0.5)';
  
  p.text(title, p.width / 2, 50);
  
  // Reset shadow
  p.drawingContext.shadowBlur = 0;
  p.pop();
};

export const initParticlesEffect = (p: p5): void => {
  p.background(0);
  p.imageMode(p.CORNER);
  p.rectMode(p.CORNER);
};
