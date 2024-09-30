import p5 from 'p5';

interface LyricLine {
  sentence: string;
  start: number;
  end: number;
}

let currentLines: LyricLine[] = [];
let currentLyricIndex = -1;
let fadeInStartTime = 0;
let fadeOutStartTime = 0;
let textColor: p5.Color;

function processLyrics(lyrics: Array<{ start: number; end: number; sentence: string }>, startIndex: number): LyricLine[] {
  return lyrics.map(lyric => ({
    sentence: lyric.sentence,
    start: lyric.start,
    end: lyric.end
  }));
}

let josefinSans: p5.Font | null = null;

export const loadJosefinSansFont = (p: p5) => {
  if (!josefinSans) {
    p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf', (font) => {
      josefinSans = font;
    });
  }
};

export const SixLineFadeEffect = (
  p: p5,
  lyrics: Array<{ start: number; end: number; sentence: string; words?: Array<{ text: string; start: number; end: number }> }>,
  isPlaying: boolean,
  currentTime: number,
  config: { leftMargin: number | null; fontSize: number; textColor: p5.Color }
) => {
  if (!isPlaying || lyrics.length === 0) return;

  if (josefinSans) {
    p.textFont(josefinSans);
  }

  // Set the textColor variable
  textColor = config.textColor;

  const currentLyricIndex = lyrics.findIndex(lyric => currentTime >= lyric.start && currentTime < lyric.end);
  
  // If we've passed the last lyric, return
  if (currentLyricIndex === -1) return;

  const currentSetIndex = Math.floor(currentLyricIndex / 6);

  if (currentSetIndex !== Math.floor(currentLyricIndex / 6) || currentLines.length === 0 || currentTime >= fadeOutStartTime) {
    const startIndex = currentSetIndex * 6;
    const endIndex = Math.min(startIndex + 6, lyrics.length);
    currentLines = processLyrics(lyrics.slice(startIndex, endIndex), 0);
    
    if (currentLines.length === 0) return; // No more lyrics to display

    fadeInStartTime = currentLines[0].start;
    fadeOutStartTime = currentLines[currentLines.length - 1].end - 2; // Start fade-out 2 seconds before the last line ends
  }

  // Reduce the lineHeight to make the space between lines shorter
  const lineHeight = p.height * 0.07; // Reduced from 0.09 to 0.07
  const totalHeight = lineHeight * 6;
  let y = (p.height / 2 - totalHeight / 2) + lineHeight * 0.5;

  p.textAlign(config.leftMargin !== null ? p.LEFT : p.CENTER, p.CENTER);
  p.textSize(config.fontSize ? config.fontSize * lineHeight : lineHeight * 0.60); // Adjusted text size
  p.textStyle(p.BOLD);

  const fadeInDuration = 1; // 1 second fade-in for each sentence
  const fadeInStaggerDelay = 0.5; // 0.5 second delay between sentences for fade-in
  const fadeOutDuration = 1; // 1 second fade-out for each sentence
  const fadeOutStaggerDelay = 0.3; // 0.3 second delay between sentences for fade-out
  const moveRightDuration = 0.5; // 0.5 second for the move right animation
  const moveRightDistance = p.width * 0.02; // Move right by 2% of the screen width

  currentLines.forEach((line, index) => {
    const baseX = config.leftMargin !== null ? p.width * config.leftMargin : p.width / 2;
    let x = baseX;
    let opacity = 255;

    const lineStartTime = line.start;
    const lineEndTime = lineStartTime + fadeInDuration;
    const lineMoveStartTime = lineEndTime;
    const lineMoveEndTime = lineMoveStartTime + moveRightDuration;
    const lineFadeOutStartTime = fadeOutStartTime + index * fadeOutStaggerDelay;
    const lineFadeOutEndTime = lineFadeOutStartTime + fadeOutDuration;

    if (currentTime < lineStartTime) {
      opacity = 0;
    } else if (currentTime >= lineStartTime && currentTime < lineEndTime) {
      // Staggered fade-in for each sentence
      opacity = p.map(currentTime, lineStartTime, lineEndTime, 0, 255, true);
    } else if (currentTime >= lineMoveStartTime && currentTime < lineMoveEndTime) {
      // Move right animation
      x = p.map(currentTime, lineMoveStartTime, lineMoveEndTime, baseX, baseX + moveRightDistance, true);
    } else if (currentTime >= lineMoveEndTime && currentTime < lineFadeOutStartTime) {
      // Keep the line at the right position
      x = baseX + moveRightDistance;
    } else if (currentTime >= lineFadeOutStartTime && currentTime <= lineFadeOutEndTime) {
      // Staggered fade-out for each sentence
      opacity = p.map(currentTime, lineFadeOutStartTime, lineFadeOutEndTime, 255, 0, true);
      x = baseX + moveRightDistance;
    } else if (currentTime > lineFadeOutEndTime) {
      opacity = 0;
    }

    opacity = p.constrain(opacity, 0, 255); // Ensure opacity is within valid range
    p.fill(p.red(textColor), p.green(textColor), p.blue(textColor), opacity);
    p.text(line.sentence, x, y + (lineHeight * index));
  });
};