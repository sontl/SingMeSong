import p5 from 'p5';

let angle = 0;
const w = 24;
let ma: number;
let maxD: number;
let zoomD: number;
const black = [53, 53, 53];
const white = [241, 250, 238];
let font: p5.Font;

function loadFont(p: p5) {
  if (!font) {
    font = p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Regular.otf');
  }
}

export function ModulatedWaveEffect(p: p5, spectrum: number[], energy: number, waveform: number[]): void {
  p.background(black[0], black[1], black[2]);
  
  p.ortho(-zoomD, zoomD, -zoomD, zoomD, 0, 1000);
  p.rotateX(-ma);
  p.rotateY(-p.QUARTER_PI);

  p.noStroke();
  p.strokeWeight(7);

  for (let z = 0; z < p.width; z += w) {
    for (let x = 0; x < p.width; x += w) {
      p.push();
      const d = p.dist(x, z, p.width / 2, p.height / 2);
      const offset = p.map(d, 0, maxD, -p.PI, p.PI);
      const a = angle - offset;
      const h = p.floor(p.map(p.sin(a + z + p.millis() / 5000), -1, 1, 75, 350));
      p.translate(x - p.width / 2, 0, z - p.height / 2);
      p.fill(black[0], black[1], black[2]);
      p.stroke(
        127.5 + 127.5 * p.cos(x + p.tan(p.millis() / 5000) + p.millis() / 500),
        127.5 + 127.5 * p.sin(z + p.cos(p.millis() / 500) + p.millis() / 500),
        255
      );
      p.box(h - h / 20, h - h / 20, w - w / 20);
      p.pop();
    }
  }
  angle += 0.05;
}

export function ModulatedWaveTitleStyle(p: p5, title: string): void {
  if (!font) {
    loadFont(p);
    return; // Skip rendering text if font is not loaded yet
  }

  p.push();
  p.translate(-p.width / 2, -p.height / 2);
  p.fill(255);
  p.textFont(font);
  p.textSize(p.width * 0.05);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(title, p.width / 2, p.height * 0.1);
  p.pop();
}

export function initModulatedWaveEffect(p: p5): void {
  const calculateCanvasSize = () => {
    const isFullscreen = document.fullscreenElement !== null;

    if (isFullscreen) {
      return { width: window.innerWidth, height: window.innerHeight };
    }

    const visualizerColumn = document.querySelector('.visualizer-column');
    if (!visualizerColumn) return { width: 0, height: 0 };

    const containerWidth = visualizerColumn.clientWidth * 0.96;
    const containerHeight = visualizerColumn.clientHeight * 0.96;
    const aspectRatio = 16 / 9;

    let width, height;

    if (containerWidth / containerHeight > aspectRatio) {
      height = containerHeight;
      width = height * aspectRatio;
    } else {
      width = containerWidth;
      height = width / aspectRatio;
    }

    return { width, height };
  };

  const { width, height } = calculateCanvasSize();
  p.createCanvas(width, height, p.WEBGL);
  p.colorMode(p.RGB);
  loadFont(p);

  ma = p.atan(1 / p.sqrt(2));
  maxD = p.dist(0, 0, 200, 200);
  zoomD = p.width - 25;
}
