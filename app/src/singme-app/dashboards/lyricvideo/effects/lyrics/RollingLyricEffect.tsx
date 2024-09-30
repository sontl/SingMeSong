import p5 from 'p5';

interface Word {
  text: string;
  opacity: number;
  startTime: number;
  endTime: number;
}

interface RollingLyricConfig {
  fontSize?: number;
  bottomMargin?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
}

let words: Word[] = [];
let currentLyricIndex = -1;

function processWords(currentLyric: { start: number; end: number; sentence: string; words?: Array<{ text: string; start: number; end: number }> }): Word[] {
  if (currentLyric.words && currentLyric.words.length > 0) {
    return currentLyric.words.map(w => ({ ...w, opacity: 0, startTime: w.start, endTime: w.end }));
  } else {
    const wordCount = currentLyric.sentence.split(' ').length;
    const wordDuration = (currentLyric.end - currentLyric.start) / wordCount;
    
    return currentLyric.sentence.split(' ').map((word, index) => ({
      text: word,
      opacity: 0,
      startTime: currentLyric.start + index * wordDuration,
      endTime: currentLyric.start + (index + 1) * wordDuration
    }));
  }
}

export const RollingLyricEffect = (
  p: p5, 
  lyrics: Array<{ start: number; end: number; sentence: string; words?: Array<{ text: string; start: number; end: number }> }>, 
  isPlaying: boolean, 
  currentTime: number,
  config: {
    fontSize?: number;
    bottomMargin?: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
    enableWaveEffect?: boolean;
    waveAmplitude?: number;
    waveFrequency?: number;
    waveSpeed?: number;
  } = {}
) => {
  if (!isPlaying) return;
  
  const {
    fontSize = 0.03,  // 3% of screen height
    bottomMargin = 0.05,  // 5% of screen height
    fadeInDuration = 0.5,
    fadeOutDuration = 0.5,
    enableWaveEffect = false,
    waveAmplitude = 10,  // wave effect
    waveFrequency = 0.1,  // wave effect
    waveSpeed = 0.05,  // wave effect
  } = config;

  let currentLyric = lyrics.find(lyric => 
    currentTime >= lyric.start && currentTime <= lyric.end
  );

  if (currentLyric) {
    if (lyrics.indexOf(currentLyric) !== currentLyricIndex) {
      currentLyricIndex = lyrics.indexOf(currentLyric);
      words = processWords(currentLyric);
    }

    const textSize = p.height * fontSize;
    const y = p.height - (p.height * bottomMargin);

    p.textAlign(p.CENTER, p.BOTTOM);
    p.textSize(textSize);

    const middleWordIndex = Math.floor(words.length / 2);

    let x = p.width / 2;
    const totalWidth = words.reduce((sum, word) => sum + p.textWidth(word.text + ' '), 0);
    x -= totalWidth / 2;

    words.forEach((word, index) => {
      if (currentTime >= word.startTime - fadeInDuration && currentTime <= word.endTime + fadeOutDuration) {
        // Fade in
        if (currentTime <= word.endTime) {
          word.opacity = p.map(currentTime, word.startTime - fadeInDuration, word.startTime, 0, 255);
        } else {
          // Fade out
          word.opacity = p.map(currentTime, word.endTime, word.endTime + fadeOutDuration, 255, 0);
        }

        // Start fading out words before the middle word
        if (index < middleWordIndex && currentTime > words[middleWordIndex].startTime) {
          const fadeOutProgress = (currentTime - words[middleWordIndex].startTime) / ((words[words.length - 1].endTime - words[middleWordIndex].startTime) / 2);
          word.opacity = p.max(0, p.lerp(word.opacity, 0, fadeOutProgress));
        }

        // Calculate wave offset only if wave effect is enabled
        const waveOffset = enableWaveEffect
          ? Math.sin((x + p.frameCount * waveSpeed) * waveFrequency) * waveAmplitude
          : 0;

        p.fill(255, 255, 255, word.opacity);
        p.text(word.text, x + p.textWidth(word.text) / 2, y + waveOffset);
      }

      x += p.textWidth(word.text + ' ');
    });
  }
};