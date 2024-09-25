import p5 from 'p5';

let spectrogramHistory: number[][] = [];

export const SpectrogramEffect = (p: p5, spectrum: number[], energy: number) => {
  spectrogramHistory.unshift(spectrum);
  if (spectrogramHistory.length > p.height) {
    spectrogramHistory.pop();
  }

  p.loadPixels();
  for (let y = 0; y < spectrogramHistory.length; y++) {
    for (let x = 0; x < spectrum.length; x++) {
      let index = (x + y * p.width) * 4;
      let intensity = spectrogramHistory[y][x];
      p.pixels[index] = intensity;
      p.pixels[index + 1] = intensity;
      p.pixels[index + 2] = intensity;
      p.pixels[index + 3] = 255;
    }
  }
  p.updatePixels();
};

export const SpectrogramTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(32);
  
  // Create a glitch effect
  for (let i = 0; i < 5; i++) {
    let x = p.width / 2 + p.random(-5, 5);
    let y = 50 + p.random(-5, 5);
    p.fill(255, 0, 0);
    p.text(title, x + 1, y + 1);
    p.fill(0, 255, 255);
    p.text(title, x - 1, y - 1);
    p.fill(255);
    p.text(title, x, y);
  }
};