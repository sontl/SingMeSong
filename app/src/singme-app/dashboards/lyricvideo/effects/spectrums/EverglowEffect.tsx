import p5 from 'p5';

class Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  w: number;
  color: number[];

  constructor(p: p5) {
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = p.createVector(0, 0);
    this.acc = this.pos.copy().mult(p.random(0.0001, 0.00001));
    this.w = p.random(3, 5);
    this.color = [p.random(200, 255), p.random(200, 255), p.random(200, 255)];
  }

  update(p: p5, cond: boolean): void {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    if (cond) {
      this.pos.add(this.vel);
      this.pos.add(this.vel);
      this.pos.add(this.vel);
    }
  }

  edges(p: p5): boolean {
    return (
      this.pos.x < -p.width / 2 - 50 ||
      this.pos.x > p.width / 2 + 50 ||
      this.pos.y < -p.height / 2 - 50 ||
      this.pos.y > p.height / 2 + 50
    );
  }

  show(p: p5): void {
    p.noStroke();
    p.fill(this.color);
    p.ellipse(this.pos.x, this.pos.y, this.w);
  }
}

let img: p5.Image | null = null;
let fft: p5.FFT;
let particles: Particle[] = [];

export const EverglowEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]): void => {
  p.background(0);
  p.translate(p.width / 2, p.height / 2);

  //const amp = energy; // Use the provided energy instead of fft.getEnergy()
  fft.analyze()
  const amp = fft.getEnergy(20, 200)
  p.push();
  if (amp > 230) {
    p.rotate(p.random(-0.5, 0.5));
  }

  if (img) {
    p.image(img, 0, 0, p.width + 100, p.height + 100);
  }
  p.pop();

  const alpha = p.map(amp, 0, 255, 180, 150);
  p.fill(0, alpha);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);

  p.stroke(255);
  p.strokeWeight(3);
  p.noFill();

  for (let t = -1; t <= 1; t += 2) {
    p.beginShape();
    for (let i = 0; i <= 180; i += 0.5) {
      const index = p.floor(p.map(i, 0, 180, 0, waveform.length - 1));
      const r = p.map(waveform[index], -1, 1, 150, 350);
      const x = r * p.sin(i) * t;
      const y = r * p.cos(i);
      p.vertex(x, y);
    }
    p.endShape();
  }
  
  // Create multiple particles each frame
    const newParticle = new Particle(p);
    particles.push(newParticle);

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(p, amp > 230);
    particles[i].show(p);
    
    if (particles[i].edges(p)) {
      particles.splice(i, 1);
    }
  }

  // Limit the number of particles
  while (particles.length > 1000) {
    particles.shift();
  }

  // Debug information
  p.fill(255);
  p.noStroke();
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(12);
  p.text(`Particles: ${particles.length}`, -p.width/2 + 10, -p.height/2 + 10);
  p.text(`Amp: ${amp.toFixed(2)}`, -p.width/2 + 10, -p.height/2 + 30);
};

export const EverglowTitleStyle = (p: p5, title: string): void => {
  p.fill(255);
  p.textSize(p.width * 0.05);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(title, 0, -p.height * 0.4);
};

export const initEverglowEffect = (p: p5): void => {
  p.angleMode(p.DEGREES);
  p.imageMode(p.CENTER);
  p.rectMode(p.CENTER);
  fft = new p5.FFT(0.3);
  particles = [];
};

export const loadEverglowImage = (p: p5, imageUrl: string): void => {
  p.loadImage(imageUrl, (loadedImg) => {
    img = loadedImg;
    img.filter(p.BLUR, 12);
  });
};