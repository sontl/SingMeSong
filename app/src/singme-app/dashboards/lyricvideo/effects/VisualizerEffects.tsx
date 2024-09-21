import p5 from 'p5';

export type VisualizerEffect = {
  name: string;
  draw: (p: p5, spectrum: number[], energy: number) => void;
};

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

const particles: Particle[] = [];

export const visualizerEffects: VisualizerEffect[] = [
  {
    name: 'Particles',
    draw: (p: p5, spectrum: number[], energy: number) => {
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
    }
  },
  {
    name: 'Bars',
    draw: (p: p5, spectrum: number[]) => {
      p.noStroke();
      for (let i = 0; i < spectrum.length; i++) {
        let x = p.map(i, 0, spectrum.length, 0, p.width);
        let h = p.map(spectrum[i], 0, 255, 0, p.height);
        let hue = p.map(i, 0, spectrum.length, 0, 360);
        p.fill(hue, 100, 100);
        p.rect(x, p.height - h, p.width / spectrum.length, h);
      }
    }
  },
  {
    name: 'Circles',
    draw: (p: p5, spectrum: number[]) => {
      p.noFill();
      p.translate(p.width / 2, p.height / 2);
      for (let i = 0; i < spectrum.length; i += 10) {
        let angle = p.map(i, 0, spectrum.length, 0, 360);
        let amp = spectrum[i];
        let r = p.map(amp, 0, 256, 20, p.width / 2);
        let x = r * p.cos(angle);
        let y = r * p.sin(angle);
        p.stroke(i, 255, 255);
        p.line(0, 0, x, y);
      }
    }
  }
];