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

function processWords(currentLyric: { start: number; end: number; text: string; words?: Array<{ text: string; start: number; end: number }> }): Word[][] {
  if (currentLyric.words && currentLyric.words.length > 0) {
    const totalWords = currentLyric.words.length;
    const wordsPerLine = Math.ceil(totalWords / 3);

    return [
      currentLyric.words.slice(0, wordsPerLine).map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end })),
      currentLyric.words.slice(wordsPerLine, wordsPerLine * 2).map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end })),
      currentLyric.words.slice(wordsPerLine * 2).map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end }))
    ];
  } else {
    const lines = splitIntoThreeLines(currentLyric.text);
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

export const GlowingLyricEffect = (p: p5, lyrics: Array<{ start: number; end: number; text: string; words?: Array<{ text: string; start: number; end: number }> }>, isPlaying: boolean, currentTime: number) => {
    if (!isPlaying) return;
    let currentLyric = lyrics.find(lyric => 
      currentTime >= lyric.start && currentTime <= lyric.end
    );

    if (currentLyric) {
        if (lyrics.indexOf(currentLyric) !== currentLyricIndex) {
            currentLyricIndex = lyrics.indexOf(currentLyric);
            words = processWords(currentLyric);
        }

        const lineHeight = p.height * 0.2;
        const totalHeight = lineHeight * 3;
        let y = p.height / 2 - totalHeight / 2;

        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(lineHeight * 0.8);

        const sentenceDuration = currentLyric.end - currentLyric.start;
        const totalWords = words.flat().length;
        const fadeOutDuration = sentenceDuration / totalWords * 3;

        words.forEach((line, lineIndex) => {
            const lineWidth = line.reduce((sum, word) => sum + p.textWidth(word.text), 0) + (line.length - 1) * p.textWidth(' ');
            let x = p.width / 2 - lineWidth / 2;
            
            line.forEach((word, wordIndex) => {
                const fadeInDuration = (word.endTime - word.startTime) * 0.4; // Fade in during the first 40% of the word duration

                if (currentTime >= word.startTime && currentTime <= word.endTime + fadeOutDuration) {
                    if (currentTime <= word.endTime) {
                        // Fade in
                        word.opacity = p.map(currentTime, word.startTime, word.startTime + fadeInDuration, 0, 255);
                    } else {
                        // Fade out
                        word.opacity = p.map(currentTime, word.endTime, word.endTime + fadeOutDuration, 255, 0);
                    }

                    // Apply glow effect
                    p.drawingContext.shadowBlur = 40 * lineIndex;
                    p.drawingContext.shadowColor = 'white';
                    
                    // Switch to RGB color mode before setting the fill color
                    p.colorMode(p.RGB);
                    p.fill(255, 255, 255, word.opacity);
                    p.text(word.text, x + p.textWidth(word.text) / 2, y + lineHeight * lineIndex);
                    
                    // Switch back to HSB color mode for consistency with the rest of the sketch
                    p.colorMode(p.HSB);
                    
                    // Reset shadow for next word
                    p.drawingContext.shadowBlur = 0;
                }

                x += p.textWidth(word.text + ' ');
            });
        });
    }
};