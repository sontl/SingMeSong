import React from 'react';
import { FaMusic, FaMagic, FaPlayCircle } from 'react-icons/fa';

const steps = [
  {
    number: '01',
    title: 'Create',
    description: 'Enter the song description, or your own lyric, or import from Suno. You even can upload your own mp3 file',
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
    title: 'Review',
    description: 'Review with live caption and stunning lyric effect. Choose from various preset effects',
    icon: <FaPlayCircle className="text-5xl text-amber-500 mb-4" />,
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
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-white">
            Your Music. Our AI. Pure Magic.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {steps.map((step, index) => (
              <div 
                key={step.number}
                className="relative bg-white dark:bg-boxdark-2 p-8 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out mx-4 my-4"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-500"></div>
                <div className="text-6xl font-bold text-gray-200 dark:text-gray-700 absolute top-4 right-4 opacity-50">
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
    </div>
  );
};

export default HowItWorks;