import React from 'react';
import { FaMusic, FaMagic, FaPlayCircle, FaFileImport, FaEdit, FaFilm } from 'react-icons/fa';

const steps = [
    {
        number: '01',
        title: 'Create',
        description: 'Describe your song idea or enter lyrics. AI will generate the music, or you can import from Suno or upload an MP3.',
        icon: <FaMusic className="text-5xl text-orange-500 mb-4" />,
      },
  {
    number: '02',
    title: 'Transcribe',
    description: 'Just select your song and AI does its Magic',
    icon: <FaMagic className="text-5xl text-yellow-500 mb-4" />,
  },
  {
    number: '03',
    title: 'Play',
    description: 'Review with live caption and stunning lyric effect. Choose from various preset effects',
    icon: <FaPlayCircle className="text-5xl text-amber-500 mb-4" />,
  },
];

const customizationOptions = [
  {
    title: 'Flexible Song Creation',
    description: 'Import from Suno or upload your own file to customize your song creation process.',
    icon: <FaFileImport className="text-4xl text-pink-400 mb-4" />,
  },
  {
    title: 'One-Click Text Editing',
    description: 'Easily edit the transcribed text with just one click for perfect accuracy.',
    icon: <FaEdit className="text-4xl text-orange-400 mb-4" />,
  },
  {
    title: 'Professional Music Videos',
    description: 'Coming soon: Create animated storytelling music videos with customizable content and cutscenes.',
    icon: <FaFilm className="text-4xl text-pink-500 mb-4" />,
  },
];

const HowItWorks: React.FC = () => {
  return (
    <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            How It Works
            <div className="w-24 h-2 bg-orange-500 mx-auto mt-4"></div>
          </h2>
          <p className="mt-6 mx-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Turn your music into visual lyrics easily
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out mx-4 my-4"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500"></div>
                <div className="text-6xl font-bold text-gray-300 dark:text-gray-500 absolute top-4 right-4 opacity-70">
                  {step.number}
                </div>
                <div className="relative z-10">
                  {step.icon}
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform translate-x-full">
                    <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Updated Customize Your Experience section with reduced margin */}
      <div className="mt-24 sm:mt-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Customize Your Experience
            <div className="w-24 h-2 bg-gradient-to-r from-orange-500 to-pink-400 mx-auto mt-4"></div>
          </h2>
          <p className="mt-6 mx-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Tailor every aspect of your music creation and visualization process
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {customizationOptions.map((option, index) => (
              <div 
                key={option.title}
                className="relative bg-white dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300 ease-in-out mx-4 my-4"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-orange-300 to-pink-300"></div>
                <div className="relative z-10">
                  {React.cloneElement(option.icon, { className: "text-4xl text-orange-500 mb-4" })}
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{option.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{option.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
