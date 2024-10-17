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
const numParticles = 100;
let musicNotes: MusicNote[] = [];
const numNotes = 10;
let isInitialized = false;

const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♮', '♯'];

let canvasWidth: number;
let canvasHeight: number;

let songImage: p5.Image | null = null;
let rotation = 0;

export const OceanWaveEffect = (p: p5, spectrum: number[], energy: number, waveform: number[]) => {
  if (!isInitialized || canvasWidth !== p.width || canvasHeight !== p.height) {
    initOceanWaveEffect(p);
    isInitialized = true;
    canvasWidth = p.width;
    canvasHeight = p.height;
  }

  p.background(0, 0, 10, 10); // Deep blue background with slight transparency for trail effect

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

  // Draw rotating song image
  drawRotatingSongImage(p);

  // Update rotation
  rotation += 0.01; // Adjust this value to change rotation speed
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
    p.fill(255, 255, 255, 150); // Lighter music notes with more transparency
    p.text(note.symbol, note.x, note.y);
  }
}

// Add this helper function to calculate the average of the spectrum
function averageSpectrum(spectrum: number[]): number {
  return spectrum.reduce((sum, value) => sum + value, 0) / spectrum.length;
}

export const OceanWaveTitleStyle = (p: p5, title: string) => {
  p.fill(255, 255, 255, 180); // Lighter white text with some transparency
  p.textAlign(p.LEFT, p.TOP);
  p.textSize(24); // Adjust this size as needed
  p.textStyle(p.BOLD);
  
  let x = 20; // Left margin
  let y = 30; // Top margin
  
  p.text(title, x, y);
};

export function initOceanWaveEffect(p: p5) {
  // Clear existing waves, particles, and notes
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

function drawRotatingSongImage(p: p5) {
  if (songImage) {
    console.log('drawRotatingSongImage', songImage);
    p.push();
    const x = p.width * 0.8;
    const y = p.height * 0.2;
    const diameter = Math.min(p.width, p.height) * 0.3;

    // Create a circular mask
    let mask = p.createGraphics(diameter, diameter);
    mask.ellipseMode(p.CENTER);
    mask.fill(255);
    mask.noStroke();
    mask.ellipse(diameter / 2, diameter / 2, diameter, diameter);

    // Create a new graphics object for the rotated and masked image
    let rotatedImage = p.createGraphics(diameter, diameter);
    rotatedImage.imageMode(p.CENTER);
    rotatedImage.translate(diameter / 2, diameter / 2);
    rotatedImage.rotate(rotation);
    rotatedImage.image(songImage, 0, 0, diameter, diameter);

    // Apply the mask (with type assertion)
    (rotatedImage as any).mask(mask);

    // Draw the final image
    p.image(rotatedImage, x - diameter / 2, y - diameter / 2);

    // Draw a white circle border
    p.noFill();
    p.stroke(255);
    p.strokeWeight(4);
    p.ellipse(x, y, diameter, diameter);

    p.pop();
  }
}

// Add these functions to load and clear the song image
export const loadSongImage = (p: p5, imageUrl: string) => {
  p.loadImage(imageUrl, (img) => {
    songImage = img;
  });
};

export const clearSongImage = () => {
  songImage = null;
};
