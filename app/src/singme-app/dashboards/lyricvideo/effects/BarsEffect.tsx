import p5 from 'p5';

export const BarsEffect = (p: p5, spectrum: number[], energy: number) => {
  p.noStroke();
  for (let i = 0; i < spectrum.length; i++) {
    let x = p.map(i, 0, spectrum.length, 0, p.width);
    let h = p.map(spectrum[i], 0, 255, 0, p.height);
    let hue = p.map(i, 0, spectrum.length, 0, 360);
    p.fill(hue, 100, 100);
    p.rect(x, p.height - h, p.width / spectrum.length, h);
  }
};

export const BarsTitleStyle = (p: p5, title: string) => {
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(28);
  
  // Create a 3D effect
  for (let i = 0; i < 5; i++) {
    p.fill(255, 255 - i * 50);
    p.text(title, p.width / 2 + i, 50 + i);
  }
};