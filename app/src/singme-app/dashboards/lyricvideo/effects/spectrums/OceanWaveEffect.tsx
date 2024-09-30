import p5 from 'p5';

interface Wave {
  y: number;
  amplitude: number;
  period: number;
  phase: number;
}

let waves: Wave[] = [];
const numWaves = 5;
let particles: p5.Vector[] = [];
const numParticles = 100;
let isInitialized = false;

export const OceanWaveEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {
  if (!isInitialized) {
    initOceanWaveEffect(p);
    isInitialized = true;
  }

  p.background(0, 0, 10, 10); // Deep blue background with slight transparency for trail effect

  // Update and draw waves
  for (let i = 0; i < numWaves; i++) {
    let wave = waves[i];
    wave.phase += 0.02;
    drawWave(p, wave, spectrum, i, numWaves);
  }

  // Update and draw particles
  for (let particle of particles) {
    particle.add(p.createVector(p.random(-1, 1), p.random(-1, 1)));
    particle.y = (particle.y + p.height) % p.height;
    p.stroke(p.map(particle.y, 0, p.height, 0, 360), 80, 100, 50);
    p.point(particle.x, particle.y);
  }
};

function drawWave(p: p5, wave: Wave, spectrum: number[], index: number, totalWaves: number) {
  p.noFill();
  p.beginShape();
  
  const baseHue = p.map(index, 0, totalWaves, 180, 240); // Blue to purple range
  const saturation = p.map(averageSpectrum(spectrum), 0, 255, 50, 100);
  const brightness = p.map(index, 0, totalWaves, 100, 50);
  
  p.stroke(baseHue, saturation, brightness, 50);
  p.strokeWeight(2);

  for (let x = 0; x < p.width; x += 10) {
    let y = wave.y;
    let xAngle = p.map(x, 0, p.width, 0, p.TWO_PI * wave.period);
    let waveHeight = p.map(spectrum[x % spectrum.length], 0, 255, 0, wave.amplitude);
    y += p.sin(xAngle + wave.phase) * waveHeight;

    // Apply 3D perspective
    let z = p.map(index, 0, totalWaves, 0, -200);
    let perspective = p.map(z, 0, -200, 1, 0.5);
    let projectedY = p.map(y, 0, p.height, p.height * perspective, p.height * (1 - perspective));

    p.curveVertex(x, projectedY);

    // Add highlights
    if (x % 50 === 0) {
      p.push();
      p.fill(baseHue, saturation - 20, brightness + 20);
      p.noStroke();
      p.ellipse(x, projectedY, 5 * perspective, 5 * perspective);
      p.pop();
    }
  }
  
  p.endShape();
}

// Add this helper function to calculate the average of the spectrum
function averageSpectrum(spectrum: number[]): number {
  return spectrum.reduce((sum, value) => sum + value, 0) / spectrum.length;
}

export const OceanWaveTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textAlign(p.CENTER, p.TOP);
  p.textSize(36);
  p.textStyle(p.BOLD);
  
  // Create a wavy text effect
  let x = p.width / 2;
  let y = 30;
  let amplitude = 20;
  let frequency = 0.1;
  
  for (let i = 0; i < title.length; i++) {
    let char = title.charAt(i);
    let charWidth = p.textWidth(char);
    let waveY = y + Math.sin(x * frequency) * amplitude;
    p.text(char, x, waveY);
    x += charWidth;
  }
};

export function initOceanWaveEffect(p: p5) {
  // Clear existing waves and particles
  waves = [];
  particles = [];

  // Initialize waves
  for (let i = 0; i < numWaves; i++) {
    waves.push({
      y: p.map(i, 0, numWaves, p.height * 0.6, p.height),
      amplitude: p.map(i, 0, numWaves, 50, 10),
      period: p.random(2, 5),
      phase: p.random(p.TWO_PI)
    });
  }

  // Initialize particles
  for (let i = 0; i < numParticles; i++) {
    particles.push(p.createVector(p.random(p.width), p.random(p.height)));
  }
}