import p5 from 'p5';

export const SingleWordLyricEffect = (
  p: p5,
  lyrics: Array<{ start: number; end: number; sentence: string; words: Array<{ text: string; start: number; end: number }> }>,
  isPlaying: boolean,
  currentTime: number
) => {
  if (!isPlaying) return;

  const currentLyric = lyrics.find(lyric => 
    currentTime >= lyric.start && currentTime <= lyric.end
  );

  if (currentLyric) {
    const currentWord = currentLyric.words.find(word =>
      currentTime >= word.start && currentTime <= word.end
    );

    if (currentWord) {
      p.background(0, 100); // Semi-transparent background for a fade effect
      p.fill(255);
      const textSize = p.height * 0.1; // Larger text size for single word
      p.textSize(textSize);
      p.textAlign(p.CENTER, p.CENTER);
      p.text(currentWord.text, p.width / 2, p.height / 2);
    }
  }
};
