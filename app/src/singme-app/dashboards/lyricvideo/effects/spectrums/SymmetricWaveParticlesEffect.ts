import p5 from 'p5';
const listOfColors = [
  "#1c77c3", "#39a9db", "#40bcd8", "#f39237", "#d63230",
  "#540d6e", "#ee4266", "#ffd23f", "#f3fcf0", "#19647E",
];

let particles: Particle[] = [];
let fft: p5.FFT;
const MAX_PARTICLES = 100; // Adjust this number as needed

class Particle {
  pos: p5.Vector;
  vel: p5.Vector;
  acc: p5.Vector;
  w: number;
  color: p5.Color;
  active: boolean;

  constructor(p: p5) {
    this.pos = p.createVector(p.random(-1, 1), p.random(-1, 1)).normalize().mult(175);
    this.vel = p.createVector(0, 0);
    this.acc = this.pos.copy().mult(p.random(0.0001, 0.00001));
    this.w = p.random(3, 12);
    this.color = p.color(listOfColors[p.floor(p.random(listOfColors.length))]);
    this.active = true;
    console.log("Particle created");
  }

  edges(p: p5): boolean {
    return (
      this.pos.x < -p.width / 2 || this.pos.x > p.width / 2 ||
      this.pos.y < -p.height / 2 || this.pos.y > p.height / 2 
    );
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

  show(p: p5): void {
    const col = p.color(listOfColors[p.floor(p.random(listOfColors.length))]);
    p.noStroke();
    p.fill(col);
    p.ellipse(this.pos.x, this.pos.y, this.w);
    console.log("Particle shown");
  }

  reset(p: p5): void {
    this.pos = p.createVector(p.random(-1, 1), p.random(-1, 1)).normalize().mult(175);
    this.vel = p.createVector(0, 0);
    this.acc = this.pos.copy().mult(p.random(0.0001, 0.00001));
    this.w = p.random(3, 12);
    this.active = true;
  }
}

export function initSymmetricWaveParticles(p: p5): void {
 // p.angleMode(p.DEGREES);
 // p.background(0);
}

export function SymmetricWaveParticlesEffect(p: p5, spectrum: number[], energy: number, waveform: number[]): void {
  p.background(0, 50);
  p.angleMode(p.DEGREES);
  p.push();
  p.translate(p.width / 2, p.height / 2);
  fft = new p5.FFT(0.3)
  const amp = fft.getEnergy(20, 200);
  const wave = waveform;

  const col = p.color(listOfColors[p.floor(p.random(listOfColors.length))]);
  p.stroke(col);
  p.strokeWeight(3);
  p.noFill();

  // Draw first set of symmetric waves
  for (let t = -1; t <= 1; t += 2) {
    p.beginShape();
    for (let i = 0; i <= 180; i += 0.5) {
      const index = p.floor(p.map(i, 0, 180, 0, wave.length - 1));
      const r = p.map(wave[index], -1, 1, 50, 300);
      const x = r * p.sin(i) * t;
      const y = r * p.cos(i);
      p.vertex(x, y);
    }
    p.endShape();
  }

  // Draw second set of symmetric waves
  for (let t = -1; t <= 1; t += 2) {
    p.beginShape();
    for (let e = 0; e <= 180; e += 0.5) {
      const index = p.floor(p.map(e, 0, 180, 0, wave.length - 1));
      const r = p.map(wave[index], -1, 1, 25, 200);
      const x = (r * p.sin(e) * t) / 2;
      const y = (r * p.cos(e)) / 2;
      p.vertex(x, y);
    }
    p.endShape();
  }

  // Draw third set of symmetric waves
  for (let h = -1; h <= 1; h += 2) {
    p.beginShape();
    for (let e = 0; e <= 180; e += 0.5) {
      const index = p.floor(p.map(e, 0, 180, 0, wave.length - 1));
      const r = p.map(wave[index], -1, 1, 45, 400);
      const x = (r * p.sin(e) * h) / 2;
      const y = (r * p.cos(e)) / 2;
      p.vertex(x, y);
    }
    p.endShape();
  }
  
  // Add new particle
  let inactiveParticle = particles.find(p => !p.active);
  if (inactiveParticle) {
    inactiveParticle.reset(p);
  } else if (particles.length < MAX_PARTICLES) {
  //  particles.push(new Particle(p));
  }

  // Update and show particles
  for (let l = particles.length - 1; l >= 0; l--) {
    if (!particles[l].edges(p)) {
      particles[l].update(p, amp > 200);
      particles[l].show(p);
    } else {
      particles[l].active = false;
    }
  }

  if (particles.length === 0) {
    for (let i = 0; i < 100; i++) {
  //    particles.push(new Particle(p));
    }
  }
  p.pop();
}

export function SymmetricWaveParticlesTitleStyle(p: p5, title: string): void {
  p.push();
  p.fill(255);
  p.textSize(p.width * 0.05);
  p.textAlign(p.CENTER, p.TOP);
  p.text(title, p.width / 2, p.height * 0.05);
  p.pop();
}

export function setupSymmetricWaveParticles(p: p5): void {
  p.angleMode(p.DEGREES);
  p.background(0);
  particles = [];
}
