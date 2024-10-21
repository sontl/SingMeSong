import p5 from 'p5';
import { getSharedImage, getSharedBlurImage } from '../SharedImageLoader';

class Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  radius: number;
  color: p5.Color;
  strokeColor: p5.Color;

  constructor(p: p5) {
    this.pos = p.createVector(p.random(p.width), p.random(p.height));
    this.vel = p.createVector(0, 0);
    this.acc = p.createVector(0, 0);
    this.radius = p.random(10, 30);  // Increased size range
    this.color = p.color(p.random(255), p.random(255), p.random(255), 30);  // More transparent
    this.strokeColor = p.color(255, 255, 255, 80);  // More transparent stroke
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
    p.noFill();
    p.stroke(this.strokeColor);
    p.strokeWeight(0.5);  // Thinner stroke
    p.fill(this.color);
    p.ellipse(this.pos.x, this.pos.y, this.radius * 2);
    
    // Add highlight to create bubble effect
    p.noStroke();
    p.fill(255, 255, 255, 40);  // More transparent highlight
    p.ellipse(this.pos.x - this.radius / 3, this.pos.y - this.radius / 3, this.radius / 2);
  }
}

let particles: Particle[] = [];
let time = 0;
let prevWidth = 0;
let prevHeight = 0;

export const ParticlesEffect = (p: p5, spectrum: number[], energy: number) => {
  // Check if canvas size has changed
  if (p.width !== prevWidth || p.height !== prevHeight) {
    // Reinitialize particles
    particles = [];
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(p));
    }
    prevWidth = p.width;
    prevHeight = p.height;
  }

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

  // Particle logic
  p.push();
  particles.forEach(particle => {
    let x = p.map(particle.pos.x, 0, p.width, 0, spectrum.length);
    let scaleVal = p.map(spectrum[Math.floor(x)], 0, 255, 0, 1);
    particle.vel.y = p.map(scaleVal, 0, 1, -0.5, 0.5);  // Reduced velocity for slower movement
    particle.update(p, energy);
    particle.show(p);

    // Wrap particles around the canvas
    if (particle.pos.x < 0) particle.pos.x = p.width;
    if (particle.pos.x > p.width) particle.pos.x = 0;
    if (particle.pos.y < 0) particle.pos.y = p.height;
    if (particle.pos.y > p.height) particle.pos.y = 0;
  });
  p.pop();
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
