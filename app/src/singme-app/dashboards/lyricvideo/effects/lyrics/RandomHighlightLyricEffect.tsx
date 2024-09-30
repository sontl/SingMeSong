import p5 from 'p5';

interface Word {
  text: string;
  opacity: number;
  startTime: number;
  endTime: number;
  isHighlighted: boolean;
}

let words: Word[][] = [[], [], []];
let currentLyricIndex = -1;

function splitIntoThreeLines(text: string): string[] {
  const words = text.split(' ');
  const wordsPerLine = Math.ceil(words.length / 3);
  return [
    words.slice(0, wordsPerLine).join(' '),
    words.slice(wordsPerLine, wordsPerLine * 2).join(' '),
    words.slice(wordsPerLine * 2).join(' ')
  ];
}

function processWords(currentLyric: { start: number; end: number; sentence: string; words?: Array<{ text: string; start: number; end: number }> }): Word[][] {
  let processedWords: Word[];

  if (currentLyric.words && currentLyric.words.length > 0) {
    processedWords = currentLyric.words.map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end, isHighlighted: false }));
  } else {
    const totalDuration = currentLyric.end - currentLyric.start;
    const words = currentLyric.sentence.split(' ');
    const wordDuration = totalDuration / words.length;
    
    processedWords = words.map((word, index) => ({
      text: word,
      opacity: 0,
      startTime: currentLyric.start + index * wordDuration,
      endTime: currentLyric.start + (index + 1) * wordDuration,
      isHighlighted: false
    }));
  }

  // Randomly select one word to highlight
  const randomIndex = Math.floor(Math.random() * processedWords.length);
  processedWords[randomIndex].isHighlighted = true;

  // Split into three lines
  const wordsPerLine = Math.ceil(processedWords.length / 3);
  return [
    processedWords.slice(0, wordsPerLine),
    processedWords.slice(wordsPerLine, wordsPerLine * 2),
    processedWords.slice(wordsPerLine * 2)
  ];
}

let josefinSans: p5.Font | null = null;

export const loadJosefinSansFont = (p: p5) => {
  if (!josefinSans) {
    p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf', (font) => {
      josefinSans = font;
    });
  }
};

export const RandomHighlightLyricEffect = (
  p: p5,
  lyrics: Array<{ start: number; end: number; sentence: string; words?: Array<{ text: string; start: number; end: number }> }>,
  isPlaying: boolean,
  currentTime: number,
  config: { leftMargin: number | null; fontSize: number }
) => {
  if (!isPlaying) return;

  if (josefinSans) {
    p.textFont(josefinSans);
  }

  let currentLyric = lyrics.find(lyric => 
    currentTime >= lyric.start && currentTime <= lyric.end
  );

  if (currentLyric) {
    if (lyrics.indexOf(currentLyric) !== currentLyricIndex) {
      currentLyricIndex = lyrics.indexOf(currentLyric);
      words = processWords(currentLyric);
    }

    // Reduce line height to bring lines closer together
    const lineHeight = p.height * 0.12; // Reduced from 0.15
    const totalHeight = lineHeight * 3;
    let y = (p.height / 2 - totalHeight / 2) + lineHeight * 0.5;

    p.textAlign(config.leftMargin !== null ? p.LEFT : p.CENTER, p.CENTER);
    p.textSize(config.fontSize ? config.fontSize * lineHeight : lineHeight * 0.50);
    
    // Set text style to bold
    p.textStyle(p.BOLD);

    const sentenceDuration = currentLyric.end - currentLyric.start;
    const totalWords = words.flat().length;
    const fadeOutDuration = sentenceDuration / totalWords * 3;

    words.forEach((line, lineIndex) => {
      let x = config.leftMargin !== null ? p.width * config.leftMargin : p.width / 2;
      
      if (config.leftMargin === null) {
        const lineWidth = line.reduce((sum, word) => sum + p.textWidth(word.text + ' '), 0);
        x -= lineWidth / 2;
      }
      
      line.forEach((word) => {
        const fadeInDuration = (word.endTime - word.startTime) * 0.4;

        if (currentTime >= word.startTime && currentTime <= word.endTime + fadeOutDuration) {
          if (currentTime <= word.endTime) {
            word.opacity = p.map(currentTime, word.startTime, word.startTime + fadeInDuration, 0, 255);
          } else {
            word.opacity = p.map(currentTime, word.endTime, word.endTime + fadeOutDuration, 255, 0);
          }

          p.colorMode(p.RGB);
          if (word.isHighlighted) {
            // Calculate color transition from blue to orange
            const colorProgress = p.map(currentTime, word.startTime, word.endTime, 0, 1);
            const r = p.lerp(173, 255, colorProgress);
            const g = p.lerp(216, 165, colorProgress);
            const b = p.lerp(230, 0, colorProgress);

            // Draw background for highlighted word
            p.fill(r, g, b, word.opacity);
            const padding = 4;
            const wordWidth = p.textWidth(word.text);
            const wordHeight = p.textAscent() + p.textDescent();
            p.rect(x - padding, y + lineHeight * lineIndex - wordHeight/2 - padding, wordWidth + padding*2, wordHeight + padding*2);
            
            // Draw black text for highlighted word
            p.fill(0, 0, 0, word.opacity);
          } else {
            // Draw black text for non-highlighted words
            p.fill(0, 0, 0, word.opacity);
          }
          p.text(word.text, x, y + lineHeight * lineIndex);
        }

        x += p.textWidth(word.text + ' ');
      });
    });
  }
};