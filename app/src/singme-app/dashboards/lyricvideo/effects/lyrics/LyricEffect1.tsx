import p5 from 'p5';

export const LyricEffect = (p: p5, lyrics: Array<{ start: number; end: number; sentence: string }>, isPlaying: boolean, currentTime: number) => {
    if (!isPlaying) return;

    let currentLyric = lyrics.find(lyric => 
      currentTime >= lyric.start && currentTime <= lyric.end
    );

    if (currentLyric) {
        p.noStroke();
        p.noFill();
        p.rect(0, p.height - 80, p.width, 80);
        p.fill(255);
        const textSize = p.height * 0.05; // Calculate text size based on canvas height
        p.textSize(textSize);
        p.textAlign(p.CENTER, p.CENTER);
        p.text(currentLyric.sentence, p.width / 2, p.height - 40);
    }
};