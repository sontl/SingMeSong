import p5 from 'p5';

interface Lyric {
  start: number;
  end: number;
  sentence: string;
}

interface ScrollingUpLyricConfig {
  fontSize?: number;
  leftMargin?: number | null;
  textColor?: p5.Color;
  verticalAlign?: 'top' | 'center' | 'bottom';
  lineSpacing?: number; // New option for line spacing
}

export const ScrollingUpLyricEffect = (
  p: p5, 
  lyrics: Lyric[], 
  isPlaying: boolean, 
  currentTime: number,
  config: ScrollingUpLyricConfig = {}
) => {
  if (!isPlaying) return;

  const maxRows = 4;
  const maxWidth = p.width * 0.9;

  // Use config values if provided, otherwise use default values
  const fontSize = p.height * (config.fontSize || 0.03);
  const highlightedSize = fontSize * 1.33; // Increase by 33% for highlighted text
  const textColor = config.textColor || p.color(255);
  const verticalAlign = config.verticalAlign || 'bottom';
  const lineSpacing = config.lineSpacing !== undefined ? config.lineSpacing : 1.5; // Default to 1.5 times the fontSize if not specified

  const lineHeight = fontSize * lineSpacing;

  // Calculate startY based on verticalAlign
  let startY: number;
  switch (verticalAlign) {
    case 'top':
      startY = 20; // 20px from the top
      break;
    case 'center':
      startY = (p.height - (lineHeight * maxRows)) / 2;
      break;
    case 'bottom':
    default:
      startY = p.height - (lineHeight * maxRows) - 20;
      break;
  }

  // Use null coalescing operator to handle undefined leftMargin
  p.textAlign(config.leftMargin != null ? p.LEFT : p.CENTER, p.CENTER);

  let currentIndex = lyrics.findIndex(lyric => 
    currentTime >= lyric.start && currentTime <= lyric.end
  );

  // Handle case when no current lyric is found
  if (currentIndex === -1) {
    currentIndex = lyrics.findIndex(lyric => currentTime < lyric.start);
    if (currentIndex === -1) return; // No future lyrics, exit early
  }

  // Determine the start index for display
  let startIndex = Math.max(0, currentIndex - 1);
  if (currentIndex === 0) startIndex = 0;
  let displayLyrics = lyrics.slice(startIndex, startIndex + maxRows);

  // Ensure displayLyrics is not empty before proceeding
  if (displayLyrics.length === 0) return;

  let yOffset = 0;
  displayLyrics.forEach((lyric, index) => {
    const isCurrentLyric = (currentIndex === 0 && index === 0) || 
                           (currentIndex > 0 && index === 1);
    const currentFontSize = isCurrentLyric ? highlightedSize : fontSize;
    p.textSize(currentFontSize);
    
    p.fill(isCurrentLyric ? textColor : p.color(p.red(textColor), p.green(textColor), p.blue(textColor), 180));

    const wrappedLines = wrapText(p, lyric.sentence, maxWidth);
    wrappedLines.forEach((line, lineIndex) => {
      // Use null coalescing operator here as well
      const x = config.leftMargin != null ? p.width * config.leftMargin : p.width / 2;
      const y = startY + yOffset + (lineIndex * lineHeight);
      p.text(line, x, y);
    });

    yOffset += lineHeight * wrappedLines.length;
  });
};

// Helper function to wrap text
function wrapText(p: p5, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = p.textWidth(testLine);

    if (testWidth > maxWidth) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine !== '') {
    lines.push(currentLine);
  }

  return lines;
}
