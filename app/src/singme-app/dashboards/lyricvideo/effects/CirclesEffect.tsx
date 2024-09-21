import p5 from 'p5';

export const CirclesEffect = (p: p5, spectrum: number[], energy: number) => {
  p.noFill();
  // Translate to the center, but leave space at the top for the title
  p.translate(p.width / 2, p.height * 0.6);
  
  // Reduce the maximum radius to avoid overlapping with the title
  const maxRadius = Math.min(p.width, p.height) * 0.4;
  
  for (let i = 0; i < spectrum.length; i += 10) {
    let angle = p.map(i, 0, spectrum.length, 0, 360);
    let amp = spectrum[i];
    let r = p.map(amp, 0, 256, 20, maxRadius);
    let x = r * p.cos(angle);
    let y = r * p.sin(angle);
    p.stroke(i, 255, 255);
    p.line(0, 0, x, y);
  }
};

export const CirclesTitleStyle = (p: p5, title: string) => {
  p.push(); // Save the current drawing state
  
  p.fill(255);
  p.textAlign(p.CENTER, p.CENTER);
  p.textSize(28);
  
  // Create a 3D effect
  for (let i = 0; i < 5; i++) {
    p.fill(255, 255 - i * 50);
    // Move the title to the center of the canvas
    p.text(title, p.width / 2 + i, p.height / 2 + i);
  }
  
  p.pop(); // Restore the previous drawing state
};