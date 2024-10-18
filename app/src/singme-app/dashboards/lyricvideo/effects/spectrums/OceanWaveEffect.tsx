import p5 from 'p5';

interface Wave {
  y: number;
  amplitude: number;
  period: number;
  phase: number;
}

interface MusicNote {
  x: number;
  y: number;
  symbol: string;
}

let waves: Wave[] = [];
const numWaves = 5;
let particles: p5.Vector[] = [];
let musicNotes: MusicNote[] = [];
const numNotes = 10;

const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♮', '♯'];

let isLightning = false;
let lightningIntensity = 0;
let lightningDuration = 0;

export const OceanWaveEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {

  p.background(0, 0, 10, 10); // Deep blue background with slight transparency for trail effect

  // Update lightning effect
  updateLightning(p, spectrum);

  // Update and draw waves
  for (let i = 0; i < numWaves; i++) {
    let wave = waves[i];
    wave.phase += 0.02;
    drawWave(p, wave, spectrum, i, numWaves);
  }

  // Update and draw particles
  updateAndDrawParticles(p);

  // Update and draw music notes
  updateAndDrawMusicNotes(p, spectrum);
};

function drawWave(p: p5, wave: Wave, spectrum: number[], index: number, totalWaves: number) {
  p.noFill();
  p.beginShape();
  
  const baseHue = p.map(index, 0, totalWaves, 180, 240); // Blue to purple range
  const saturation = p.map(averageSpectrum(spectrum), 0, 255, 50, 100);
  let brightness = p.map(index, 0, totalWaves, 100, 50);
  
  // Apply lightning effect
  if (isLightning) {
    brightness = p.lerp(brightness, 100, lightningIntensity);
    p.strokeWeight(3 + lightningIntensity * 2); // Increase stroke weight during lightning
  } else {
    p.strokeWeight(2);
  }
  
  p.stroke(baseHue, saturation, brightness, isLightning ? 80 : 50);
  p.stroke(baseHue, saturation, brightness, 50);

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

function updateAndDrawMusicNotes(p: p5, spectrum: number[]) {
  p.textSize(24);
  p.textAlign(p.CENTER, p.CENTER);

  for (let i = 0; i < musicNotes.length; i++) {
    let note = musicNotes[i];
    
    // Update note position
    note.x = (note.x + 1) % p.width;
    let waveHeight = p.map(spectrum[Math.floor(note.x) % spectrum.length], 0, 255, 0, 50);
    note.y = p.height * 0.5 + p.sin(note.x * 0.05) * waveHeight;

    // Check for collisions with other notes
    for (let j = i + 1; j < musicNotes.length; j++) {
      let otherNote = musicNotes[j];
      let d = p.dist(note.x, note.y, otherNote.x, otherNote.y);
      
      if (d < MIN_NOTE_DISTANCE) {
        // Move the notes apart
        let angle = p.atan2(otherNote.y - note.y, otherNote.x - note.x);
        let moveDistance = (MIN_NOTE_DISTANCE - d) / 2;
        
        note.x -= p.cos(angle) * moveDistance;
        note.y -= p.sin(angle) * moveDistance;
        otherNote.x += p.cos(angle) * moveDistance;
        otherNote.y += p.sin(angle) * moveDistance;
        
        // Wrap around the canvas if needed
        note.x = (note.x + p.width) % p.width;
        note.y = (note.y + p.height) % p.height;
        otherNote.x = (otherNote.x + p.width) % p.width;
        otherNote.y = (otherNote.y + p.height) % p.height;
      }
    }

    // Draw note
    p.fill(0, 0, 100, 150); // Lighter music notes with more transparency in HSB mode
    p.text(note.symbol, note.x, note.y);
  }
}

// Add this helper function to calculate the average of the spectrum
function averageSpectrum(spectrum: number[]): number {
  return spectrum.reduce((sum, value) => sum + value, 0) / spectrum.length;
}

export const OceanWaveTitleStyle = (p: p5, title: string) => {
  p.fill(0, 0, 100, 150);  // Lighter white text with some transparency
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(24); // Adjust this size as needed
  p.textStyle(p.BOLD);
  
  let x = 20; // Left margin
  let y = 30; // Top margin
  
  p.text(title, x, y);
};

export function initOceanWaveEffect(p: p5) {
  // Clear existing waves, particles, and notes
  p.colorMode(p.HSB);
  p.background(0);

  waves = [];
  particles = [];
  musicNotes = [];

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
  const particleDensity = 0.0001; // Adjust this value to change the number of particles
  const totalParticles = Math.floor(p.width * p.height * particleDensity);
  
  for (let i = 0; i < totalParticles; i++) {
    particles.push(p.createVector(p.random(p.width), p.random(p.height)));
  }

  // Initialize music notes with collision avoidance
  musicNotes = [];
  for (let i = 0; i < numNotes; i++) {
    let newNote: MusicNote;
    let isOverlapping: boolean;
    
    do {
      isOverlapping = false;
      newNote = {
        x: p.random(p.width),
        y: p.height * 0.5 + p.random(-50, 50),
        symbol: p.random(noteSymbols)
      };
      
      // Check for overlaps with existing notes
      for (let existingNote of musicNotes) {
        if (p.dist(newNote.x, newNote.y, existingNote.x, existingNote.y) < MIN_NOTE_DISTANCE) {
          isOverlapping = true;
          break;
        }
      }
    } while (isOverlapping);
    
    musicNotes.push(newNote);
  }
}

function updateAndDrawParticles(p: p5) {
  for (let particle of particles) {
    particle.add(p.createVector(p.random(-1, 1), p.random(-1, 1)));
    
    // Wrap particles around the canvas
    particle.x = (particle.x + p.width) % p.width;
    particle.y = (particle.y + p.height) % p.height;
    
    p.stroke(p.map(particle.y, 0, p.height, 0, 360), 80, 100, 50);
    p.point(particle.x, particle.y);
  }
}

// Add this constant for minimum distance between notes
const MIN_NOTE_DISTANCE = 50;

function updateLightning(p: p5, spectrum: number[]) {
  const bassEnergy = averageSpectrum(spectrum.slice(0, 10)); // Use first 10 elements for bass
  const lightningThreshold = 200; // Adjust this value to change lightning sensitivity

  if (!isLightning) {
    // Trigger lightning based on bass energy
    if (bassEnergy > lightningThreshold) {
      isLightning = true;
      lightningIntensity = p.map(bassEnergy, lightningThreshold, 255, 0.5, 1);
      lightningDuration = p.map(bassEnergy, lightningThreshold, 255, 5, 15); // Duration based on bass intensity
    }
  } else {
    lightningDuration -= 1;
    if (lightningDuration <= 0) {
      isLightning = false;
      lightningIntensity = 0;
    }
  }
}