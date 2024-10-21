import p5 from 'p5';

let sharedImage: p5.Image | null = null;
let sharedBlurImage: p5.Image | null = null;
let currentImageUrl: string | null = null;
let currentBlurImageUrl: string | null = null;

export const loadSharedImage = (p: p5, imageUrl: string): void => {
    currentImageUrl = imageUrl;
    p.loadImage(imageUrl, (loadedImg) => {
      sharedImage = loadedImg;
    });
};

export const loadSharedBlurImage = (p: p5, imageUrl: string): void => {
  if (imageUrl !== currentBlurImageUrl) {
    currentBlurImageUrl = imageUrl;
    p.loadImage(imageUrl, (loadedImg) => {
      sharedBlurImage = loadedImg.get();
      sharedBlurImage.filter(p.BLUR, 10);
    });
  }
};

export const getSharedImage = (): p5.Image | null => sharedImage;
export const getSharedBlurImage = (): p5.Image | null => sharedBlurImage;
