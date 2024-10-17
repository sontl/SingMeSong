import p5 from 'p5';

interface Lyric {
  start: number;
  end: number;
  sentence: string;
}

export const ScrollingUpLyricEffect = (p: p5, lyrics: Lyric[], isPlaying: boolean, currentTime: number) => {
  if (!isPlaying) return;

  const maxRows = 4; // Changed from 3 to 4
  const maxWidth = p.width * 0.9;
  const normalSize = p.height * 0.03;
  const highlightedSize = p.height * 0.04;
  const lineHeight = p.height * 0.05;
  const startY = p.height - (lineHeight * maxRows) - 20;

  p.textAlign(p.CENTER, p.CENTER);

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
    p.textSize(isCurrentLyric ? highlightedSize : normalSize);
    
    p.fill(isCurrentLyric ? 255 : 180);

    const wrappedLines = wrapText(p, lyric.sentence, maxWidth);
    wrappedLines.forEach((line, lineIndex) => {
      const y = startY + yOffset + (lineIndex * lineHeight);
      p.text(line, p.width / 2, y);
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
