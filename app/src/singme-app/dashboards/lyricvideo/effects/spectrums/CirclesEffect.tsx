import p5 from 'p5';

export const CirclesEffect = (p: p5, spectrum: number[], energy: number) => {
  p.push(); // Save the current drawing state
  p.noFill();
  
  // Use the entire canvas for the effect
  const centerX = p.width / 2;
  const centerY = p.height / 2;
  const maxRadius = Math.min(p.width, p.height) * 0.4;
  
  for (let i = 0; i < spectrum.length; i += 10) {
    let angle = p.map(i, 0, spectrum.length, 0, p.TWO_PI);
    let amp = spectrum[i];
    let r = p.map(amp, 0, 256, 20, maxRadius);
    let x = centerX + r * p.cos(angle);
    let y = centerY + r * p.sin(angle);
    p.stroke(i, 255, 255);
    p.line(centerX, centerY, x, y);
  }
  
  p.pop(); // Restore the previous drawing state
};

export const CirclesTitleStyle = (p: p5, title: string) => {
  p.push();
  
  p.fill(255);
  p.textAlign(p.CENTER, p.TOP);
  p.textSize(48);
  
  // Create a 3D effect
  for (let i = 0; i < 5; i++) {
    p.fill(255, 255 - i * 50);
    p.text(title, p.width / 2 + i, 20 + i);
  }
  
  p.pop();
};