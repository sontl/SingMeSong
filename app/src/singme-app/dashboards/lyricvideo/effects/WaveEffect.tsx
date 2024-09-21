import p5 from 'p5';

export const WaveEffect = (p: p5, spectrum: number[], energy: number) => {
  p.stroke(255);
  p.noFill();
  p.beginShape();
  for (let i = 0; i < spectrum.length; i++) {
    let x = p.map(i, 0, spectrum.length, 0, p.width);
    let y = p.map(spectrum[i], 0, 255, p.height, 0);
    p.vertex(x, y);
  }
  p.endShape();
};

export const WaveTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(32);
  p.text(title, p.width / 2, 50);
  
  // Add a wavy underline
  p.stroke(255);
  p.noFill();
  p.beginShape();
  for (let x = p.width / 2 - 100; x < p.width / 2 + 100; x += 5) {
    let y = 70 + p.sin((x - p.frameCount) * 0.1) * 5;
    p.vertex(x, y);
  }
  p.endShape();
};