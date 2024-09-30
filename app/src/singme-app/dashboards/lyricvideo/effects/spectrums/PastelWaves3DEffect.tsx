import p5 from 'p5';

let cols: number, rows: number;
const scl = 20;
let terrain: number[][];
let flying = 0;
let font: p5.Font;

// Add this function to load the font
function loadFont(p: p5) {
  if (!font) {
    font = p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceSansPro-Regular.otf');
  }
}

// Add this function to initialize the terrain
function initTerrain(cols: number, rows: number) {
  terrain = new Array(cols);
  for (let i = 0; i < cols; i++) {
    terrain[i] = new Array(rows).fill(0);
  }
}

export function PastelWaves3DEffect(p: p5, spectrum: number[], energy: number, waveform: number[]) {
  p.background(280, 50, 15);
  
  flying -= 0.1;
  
  cols = Math.floor(p.width / scl);
  rows = Math.floor(p.height / scl);
  
  if (!terrain || terrain.length !== cols || terrain[0].length !== rows) {
    initTerrain(cols, rows);
  }
  
  let yoff = flying;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      terrain[x][y] = p.map(p.noise(xoff, yoff), 0, 1, -100, 100);
      xoff += 0.2;
    }
    yoff += 0.2;
  }
  
  p.push();
  p.translate(0, 50);
  p.rotateX(p.PI / 3);
  p.noStroke();
  
  for (let y = 0; y < rows - 1; y++) {
    p.beginShape(p.TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      const hue = p.map(terrain[x][y], -100, 100, 280, 360);
      const saturation = 70;
      const lightness = p.map(y, 0, rows, 70, 30);
      p.fill(hue, saturation, lightness, 0.8);
      
      p.vertex(x * scl - p.width / 2, y * scl - p.height / 2, terrain[x][y]);
      p.vertex(x * scl - p.width / 2, (y + 1) * scl - p.height / 2, terrain[x][y + 1]);
    }
    p.endShape();
  }
  
  p.pop();
}

export function PastelWaves3DTitleStyle(p: p5, title: string) {
  if (!font) {
    loadFont(p);
    return; // Skip rendering text if font is not loaded yet
  }

  p.push();
  p.translate(-p.width / 2, -p.height / 2);
  p.fill(0, 0, 100);
  p.textFont(font);
  p.textSize(p.width * 0.05);
  p.textAlign(p.CENTER, p.CENTER);
  p.text(title, p.width / 2, p.height * 0.1);
  p.pop();
}

function make2DArray(cols: number, rows: number): number[][] {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows).fill(0);
  }
  return arr;
}

// Add this function to initialize the effect
export function initPastelWaves3D(p: p5) {
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
  p.colorMode(p.HSL, 360, 100, 100, 1);
  loadFont(p);

  // Initialize terrain here
  cols = Math.floor(width / scl);
  rows = Math.floor(height / scl);
  initTerrain(cols, rows);
}
