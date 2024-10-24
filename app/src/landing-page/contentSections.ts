import { DocsUrl, BlogUrl } from '../shared/common';
import daBoiAvatar from '../client/static/da-boi.png';
import avatarPlaceholder from '../client/static/avatar-placeholder.png';
import { routes } from 'wasp/client/router';

export const navigation = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: routes.PricingPageRoute.build() },
  { name: 'Documentation', href: DocsUrl },
  // { name: 'Blog', href: BlogUrl },
];
export const features = [
  {
    name: 'AI Song Forge',
    description: 'Transform text prompts into fully-realized songs with our advanced AI composition engine. Create original melodies, harmonies, and arrangements in any genre within seconds.',
    icon: '🎵',
    href: DocsUrl,
  },
  {
    name: 'Crystal-Clear Transcription',
    description: 'Unlock industry-leading music transcription accuracy with AI-powered neural networks. Enjoy automated, high-accuracy video captions and customizable templates for enhanced visuals.',
    icon: '📝',
    href: DocsUrl,
  },
  {
    name: 'Multilingual Support',
    description: 'With advanced voice recognition and translation capabilities, your music and videos can reach a global audience, supporting over 100 languages.',
    icon: '🌎',
    href: DocsUrl,
  },
  {
    name: 'Immersive Lyric Videos',
    description: 'Create stunning lyric videos with dynamic visual effects, synchronized typography, and AI-generated backgrounds that match your song\'s mood and energy.',
    icon: '🎥',
    href: DocsUrl,
  },
  {
    name: 'Instant Lyric Video Preview',
    description: 'Experience the thrill of instant gratification with our real-time lyric video preview feature. Review your creations without any waiting time, ensuring a seamless and efficient workflow.',
    icon: '🚀',
    href: DocsUrl,
  },
  {
    name: 'Smart Video Producer',
    description: 'Coming soon: Transform your music into professional music videos with AI-directed scenes, perfect timing, and cinema-quality effects.',
    icon: '🎬',
    href: DocsUrl,
  },
];
export const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Independent Artist',
    avatarSrc: "https://pbs.twimg.com/profile_images/963739503625093120/XiXBdWZx_400x400.jpg",
    socialUrl: 'https://twitter.com/sarahchen',
    quote: 'This platform has revolutionized my creative process. I can now produce professional-quality songs and videos that used to take days in just minutes.',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Music Producer @ Rhythm Studios',
    avatarSrc: 'https://media.licdn.com/dms/image/v2/C5603AQFKxpkg8hHc3w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1517628429280?e=2147483647&v=beta&t=rR873f8Vf6oJ7rJUSXDh5RalyH7tyfoVklNZAb3ra9Y',
    socialUrl: 'https://linkedin.com/in/marcusrodriguez',
    quote: 'The transcription accuracy is mind-blowing. It saves me countless hours of manual notation and lets me focus on the creative aspects.',
  },
  {
    name: 'Emily Parker',
    role: 'YouTube Content Creator',
    avatarSrc: 'https://yt3.googleusercontent.com/ytc/AIdro_m0Ven--gXNRCX6AHqTHONfbRKIis6ibJ-W3MjqF7jfrIw=s160-c-k-c0x00ffffff-no-rj',
    socialUrl: 'https://youtube.com/@emilyparker',
    quote: 'The lyric video feature is a game-changer. My audience engagement has doubled since I started using these visually stunning videos.',
  },
  {
    name: 'James Wilson',
    role: 'Indie Band Leader',
    avatarSrc: 'https://i.scdn.co/image/ab67616d00004851178bbc65b95ac4ee046c8fb3',
    socialUrl: 'https://open.spotify.com/artist/2OM1dMkwtReAQfUbBKskuk',
    quote: 'From ideation to final production, this tool has streamlined our entire creative workflow. It\'s like having a professional studio in your pocket.',
  },
  {
    name: 'Thomas Blakemore',
    role: 'Edu-Influencer Of The Year',
    avatarSrc: 'https://p16-sign-sg.tiktokcdn.com/aweme/1080x1080/tos-alisg-avt-0068/c86638e3ffb7671151336cdf81fe73f8.jpeg?lk3s=a5d48078&nonce=10511&refresh_token=573139821f7bbb331bb9fbaaee38e606&x-expires=1729742400&x-signature=saRUA2DQPrAMselOGRdEzHFXCNk%3D&shp=a5d48078&shcp=81f88b70',
    socialUrl: 'https://www.tiktok.com/@thomasblakemore',
    quote: 'The AI transcription has transformed how I teach. My students can now focus on the creative aspects of music, while the technology handles the tedious tasks.',
  },
  {
    name: 'Agaust West',
    role: 'TikTok Creator',
    avatarSrc: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/c98dd6bac3cf20de6abf4cb5f8281174~c5_1080x1080.jpeg?lk3s=a5d48078&nonce=67988&refresh_token=2991cb70ab07d3beeb8f9f914b415b2b&x-expires=1729742400&x-signature=MKd%2F4xTd7xzWmIScBRK%2FbXsXWP4%3D&shp=a5d48078&shcp=81f88b70',
    socialUrl: 'https://www.tiktok.com/@agaustwest',
    quote: "I've been able to create professional-quality videos in minutes that used to take me hours.",
  },
  
];

export const faqs = [
  {
    id: 1,
    question: 'How accurate is the song transcription?',
    answer: 'Our AI-powered transcription achieves 95% accuracy for English and more than 80% for other languages, significantly outperforming traditional services for complex musical arrangements.',
    href: '/transcription',
  },
  {
    id: 2,
    question: 'Can I customize the visual effects in lyric videos?',
    answer: 'Coming soon! For now, users can select from a variety of presets to customize their lyric videos.',
    href: '/lyric-videos',
  },
  {
    id: 3,
    question: 'What music genres does the song creation support?',
    answer: 'Your imagination is the limit. Our AI does not have a specific genre limit, allowing you to explore and create music across any style or genre you envision.',
    href: '/genres',
  },
  {
    id: 4,
    question: 'How long does it take to create a song?',
    answer: 'Initial song generation takes 20-50 seconds, with lyric video creation available instantly for preview and 2-4 minutes for the export process. The transcription process itself takes 3-5 minutes as we try multiple solutions to provide the most accurate result.',
    href: '/process',
  },
  {
    id: 5,
    question: 'Do I own the rights to the created content?',
    answer: 'Yes, you retain 100% ownership of all content created on our platform, including songs, lyrics, and videos.',
    href: '/licensing',
  },
  {
    id: 7,
    question: 'How does the payment system work?',
    answer: 'Our product operates on a one-time payment basis. When you purchase a plan, you receive a set number of credits. After your credits are used up, you can repurchase the same or a different plan to get more.',
    href: '/pricing',
  },
  {
    id: 8,
    question: 'What happens to unused credits?',
    answer: 'Credits are valid for 30 days from the purchase date. Any unused credits will expire and be removed from your account after this period.',
    href: '/collaboration',
  },
  {
    id: 9,
    question: 'What is a \'credit\' in your plans?',
    answer: 'A credit is a unit of value that represents one use of our product. For example, one credit might be enough to generate one song, create one lyric video, or transcribe one song. The exact amount of credits needed depends on the complexity of the task you are performing.',
    href: '/pricing',
  },
  {
    id: 10,
    question: 'Are there any hidden fees in your plans?',
    answer: 'No, there are no hidden fees. All pricing is transparent and listed in the pricing table.',
    href: '/pricing',
  },
  {
    id: 11,
    question: 'Can I get a refund?',
    answer: 'Due to the high resources required for song generation, lyric transcription, and video processing, we do not offer refunds. Please carefully select your plan before purchase.',
    href: '/refunds',
  },
];
export const footerNavigation = {
  app: [
    { name: 'Documentation', href: DocsUrl },
    { name: 'Blog', href: BlogUrl },
  ],
  company: [
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
  ],
};
