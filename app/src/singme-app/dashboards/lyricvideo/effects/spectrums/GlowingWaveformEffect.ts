import p5 from 'p5';

let gradientColors: p5.Color[];

export function initGlowingWaveform(p: p5) {
  p.background(0);
  gradientColors = [
    p.color(138, 43, 226), // Purple
    p.color(30, 144, 255), // Blue
  ];
}export function GlowingWaveformEffect(p: p5, spectrum: number[], energy: number, waveform: number[]) {
    p.background(0);
  
    const centerY = p.height * 0.6; // Move the center down a bit
    const maxAmplitude = p.height * 0.2; // Reduce the max amplitude
    const bassIndex = Math.floor(spectrum.length * 0.1); // Use the first 10% of the spectrum for bass
    const bassEnergy = p.map(spectrum[bassIndex], 0, 255, 0, 1);
  
    // Create gradient
    let gradient = p.createGraphics(p.width, p.height);
    gradient.noFill();
    for (let y = 0; y < p.height; y++) {
      const inter = p.map(y, 0, p.height, 0, 1);
      const c = p.lerpColor(p.color(138, 43, 226), p.color(0, 191, 255), inter);
      gradient.stroke(c);
      gradient.line(0, y, p.width, y);
    }
  
    // Draw expanding waveform
    p.noStroke();
    for (let x = 0; x < p.width; x++) {
      const progress = x / p.width;
      const bassOffset = Math.sin(progress * Math.PI * 4 + p.frameCount * 0.1) * bassEnergy * maxAmplitude * 0.2;
      const y = centerY + Math.sin(progress * Math.PI * 2) * maxAmplitude * Math.pow(progress, 0.5) + bassOffset;
      const thickness = p.map(progress, 0, 1, 1, maxAmplitude * 0.5);
      
      for (let t = -thickness / 2; t < thickness / 2; t++) {
        const yPos = y + t;
        const alpha = p.map(Math.abs(t), 0, thickness / 2, 255, 0);
        const c = gradient.get(x, Math.floor(yPos));
        p.fill(p.red(c), p.green(c), p.blue(c), alpha);
        p.rect(x, yPos, 1, 1);
      }
    }
  
    // Add glow effect
    p.drawingContext.shadowBlur = 10;
    p.drawingContext.shadowColor = 'rgba(138, 43, 226, 0.5)';
  
    // Draw base line
    p.stroke(255, 100);
    p.line(0, p.height - 1, p.width, p.height - 1);
  }
export function GlowingWaveformTitleStyle(p: p5, title: string) {
  p.fill(255);
  p.noStroke();
  p.textAlign(p.CENTER, p.TOP);
  p.textSize(p.width * 0.05);
  p.text(title, p.width / 2, p.height * 0.05);
}
