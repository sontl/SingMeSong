import p5 from 'p5';

interface Word {
  text: string;
  opacity: number;
  startTime: number;
  endTime: number;
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
  if (currentLyric.words && currentLyric.words.length > 0) {
    const totalWords = currentLyric.words.length;
    const wordsPerLine = Math.ceil(totalWords / 3);

    return [
      currentLyric.words.slice(0, wordsPerLine).map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end })),
      currentLyric.words.slice(wordsPerLine, wordsPerLine * 2).map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end })),
      currentLyric.words.slice(wordsPerLine * 2).map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end }))
    ];
  } else {
    const lines = splitIntoThreeLines(currentLyric.sentence);
    const totalWords = lines.reduce((sum, line) => sum + line.split(' ').length, 0);
    const wordDuration = (currentLyric.end - currentLyric.start) / totalWords;

    let wordStartTime = currentLyric.start;
    return lines.map(line => 
      line.split(' ').map(word => {
        const wordObj = {
          text: word,
          opacity: 0,
          startTime: wordStartTime,
          endTime: wordStartTime + wordDuration
        };
        wordStartTime += wordDuration;
        return wordObj;
      })
    );
  }
}

// Move this outside of the effect function
let josefinSans: p5.Font | null = null;

export const loadJosefinSansFont = (p: p5) => {
  if (!josefinSans) {
    p.loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Bold.otf', (font) => {
      josefinSans = font;
    });
  }
};

export const ShadowLyricEffect = (
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

      const lineHeight = p.height * 0.15;
      const totalHeight = lineHeight * 3;
      let y = (p.height / 2 - totalHeight / 2) + lineHeight * 0.5;

      p.textAlign(config.leftMargin !== null ? p.LEFT : p.CENTER, p.CENTER);
      p.textSize(config.fontSize ? config.fontSize * lineHeight : lineHeight * 0.50);

      const sentenceDuration = currentLyric.end - currentLyric.start;
      const totalWords = words.flat().length;
      const fadeOutDuration = sentenceDuration / totalWords * 3;

      words.forEach((line, lineIndex) => {
          let x = config.leftMargin !== null ? p.width * config.leftMargin : p.width / 2;
          
          if (config.leftMargin === null) {
              const lineWidth = line.reduce((sum, word) => sum + p.textWidth(word.text + ' '), 0);
              x -= lineWidth / 2;
          }
          
          line.forEach((word, wordIndex) => {
              const fadeInDuration = (word.endTime - word.startTime) * 0.4;

              if (currentTime >= word.startTime && currentTime <= word.endTime + fadeOutDuration) {
                  if (currentTime <= word.endTime) {
                      word.opacity = p.map(currentTime, word.startTime, word.startTime + fadeInDuration, 0, 255);
                  } else {
                      word.opacity = p.map(currentTime, word.endTime, word.endTime + fadeOutDuration, 255, 0);
                  }

                  p.drawingContext.shadowBlur = 10;
                  p.drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
                  
                  p.colorMode(p.RGB);
                  p.fill(0, 0, 0, word.opacity);
                  p.text(word.text, x, y + lineHeight * lineIndex);
                  
                  p.colorMode(p.HSB);
                  
                  p.drawingContext.shadowBlur = 0;
              }

              x += p.textWidth(word.text + ' ');
          });
      });
  }
};