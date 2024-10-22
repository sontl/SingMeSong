import { useState } from 'react';
import OpenAILogo from "../logos/OpenAILogo";
import ClaudeLogo from "../logos/ClaudeLogo";
import FFMPEGLogo from "../logos/FFMPEGLogo";
import GoogleGeminiLogo from "../logos/GoogleGeminiLogo";
import SunoLogo from "../logos/SunoLogo";
import RunwayMLLogo from "../logos/RunwayMLLogo";

const Tooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 w-64 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

export default function Clients() {
  const clients = [
    { logo: <OpenAILogo />, tooltip: "OpenAI for advanced music composition and precise audio transcription" },
    { logo: <ClaudeLogo />, tooltip: "Anthropic Claude for lyric enhancement" },
    { logo: <FFMPEGLogo />, tooltip: "FFMPEG for professional video processing" },
    { logo: <GoogleGeminiLogo />, tooltip: "Google Gemini for creative direction" },
    { logo: <SunoLogo />, tooltip: "Suno for advanced music composition" },
    { logo: <RunwayMLLogo width={230}/>, tooltip: "RunwayML for video processing" }
  ];

  return (
    <div className='mt-12 mx-auto max-w-7xl px-6 lg:px-8 flex flex-col items-between gap-y-6'>
      <h2 className='mb-6 text-center font-semibold tracking-wide text-gray-500 dark:text-white'>
      Melodized using
      </h2>

      <div className='mx-auto grid max-w-lg grid-cols-3 items-center gap-x-6 gap-y-12 sm:max-w-xl md:grid-cols-3 lg:grid-cols-6 sm:gap-x-10 sm:gap-y-14 lg:mx-0 lg:max-w-none'>
        {clients.map(({ logo, tooltip }, index) => (
          <Tooltip key={index} content={tooltip}>
            <div className='flex justify-center col-span-1 max-h-12 w-full object-contain dark:opacity-80'>
              {logo}
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  )
}
