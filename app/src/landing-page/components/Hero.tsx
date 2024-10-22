import { DocsUrl } from '../../shared/common';
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const VideoPopup = ({ src , onClose }: { src: string, onClose: () => void })  => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="relative w-full max-w-4xl">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <video src={src} controls autoPlay className="w-full" />
    </div>
  </div>
);

const VideoThumbnail = ({ videoId, thumbnail, title }: { videoId: string, thumbnail: string, title: string }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  const playVideo = () => {
    if (playerRef.current) {
      playerRef.current.src += "&autoplay=true";
    }
    setIsPlaying(true);
  };

  const previewUrl = `https://vz-a769f8ff-2b6.b-cdn.net/${videoId}/preview.webp`;

  return (
    <>
      <div 
        className="relative rounded-lg overflow-hidden cursor-pointer"
        style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={playVideo}
      >
        <img
          src={isHovering ? previewUrl : thumbnail}
          alt={title}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        {!isHovering && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
          {title}
        </div>
      </div>
      {isPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              ref={playerRef}
              width="100%"
              height="500"
              src={`https://iframe.mediadelivery.net/embed/330238/${videoId}?autoplay=true`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default function Hero() {
  return (
    <div className='relative pt-14 w-full '>
      <div
        className='absolute top-0 right-0 -z-10 transform-gpu overflow-hidden w-full blur-3xl sm:top-0 '
        aria-hidden='true'
      >
        <div
          className='aspect-[1020/880] w-[55rem] flex-none sm:right-1/4 sm:translate-x-1/2 dark:hidden bg-gradient-to-tr from-amber-400 to-purple-300 opacity-40'
          style={{
            clipPath: 'polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)',
          }}
        />
      </div>
      <div
        className='absolute inset-x-0 top-[calc(100%-40rem)] sm:top-[calc(100%-65rem)] -z-10 transform-gpu overflow-hidden blur-3xl'
        aria-hidden='true'
      >
        <div
          className='relative aspect-[1020/880] sm:-left-3/4 sm:translate-x-1/4 dark:hidden bg-gradient-to-br from-amber-400 to-purple-300  opacity-50 w-[72.1875rem]'
          style={{
            clipPath: 'ellipse(80% 30% at 80% 50%)',
          }}
        />
      </div>
      <div className='py-24 sm:py-32'>
        <div className='mx-auto max-w-8xl px-6 lg:px-8'>
          <div className='lg:mb-18 mx-auto max-w-3xl text-center'>
            <h1 className='text-4xl font-bold text-gray-900 sm:text-6xl dark:text-white'>
              From <span className='italic'>Imagination</span> to <span className='italic'>Symphony</span>
            </h1>
            <p className='mt-6 mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-white'>
              Transform your musical ideas into reality with AI-powered song creation, professional-grade transcription, and stunning visual production - all in one revolutionary platform.
            </p>
            <div className='mt-10 flex items-center justify-center'>
              <div className='w-full max-w-3xl flex shadow-lg rounded-lg overflow-hidden'>
                <input
                  type="text"
                  placeholder="An acoustic ode to a banana’s downfall!"
                  className="flex-grow px-6 py-4 text-base text-gray-700 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
                <a
                  href="/signup"
                  className="flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors duration-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"></path>
                    <circle cx="6" cy="18" r="3"></circle>
                    <circle cx="18" cy="16" r="3"></circle>
                  </svg>
                  Create a Song
                </a>
              </div>
            </div>
          </div>
          <div className='mt-14 flow-root sm:mt-14'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              <VideoThumbnail
                videoId="378ae5ec-5b99-467b-9607-ab43b0fe5ef4"
                thumbnail="https://cdn2.suno.ai/47f59c3f-8caa-4768-a749-4526e2b3ce57_fc3037a9.jpeg"
                title="miami bass r&b  song"
              />
              <VideoThumbnail
                videoId="7efa2718-8bff-4334-a651-e7fad3d38d5a"
                thumbnail="https://cdn2.suno.ai/image_27c3e552-6afa-48d0-a024-3bacb83be571.jpeg"
                title="English, Japanese, pop, hip hop, happy song"
              />
              <VideoThumbnail
                videoId="275b5671-6719-488b-aa6e-0cf1c73ff37d"
                thumbnail="https://cdn2.suno.ai/image_75ddd8ff-93bf-45f4-a4e4-18a47cf8e53b.jpeg"
                title="Pop, Inspirational, Upbeat, Tech, Empowering"
              />
              <VideoThumbnail
                videoId="14d19f42-9bd7-4284-a62d-d724c74d6bd3"
                thumbnail="https://cdn2.suno.ai/image_886b583b-8a1a-45a1-ab1d-79290b9b0b80.jpeg"
                title="Russian folk music"
              />
             
              <VideoThumbnail
                videoId="0fe2c210-0276-493e-8141-ebf8c2346a01"
                thumbnail="https://cdn2.suno.ai/image_32faefc4-64a3-4597-a767-f0193bb2bb49.jpeg"
                title="french chanson, french male vocal song"
              />
              <VideoThumbnail
                videoId="2a0ff765-ec40-446c-9c9b-c8b39bbc67ce"
                thumbnail="https://cdn2.suno.ai/c55bc172-69bb-4b14-bb07-203a014a3a2f_efd1ff37.jpeg"
                title="dark textured folk, deep raspy vocal, introspective, sorrowful, dark tango RnB song"
              />
              <VideoThumbnail
                videoId="4cfbd686-1f36-45dd-b25f-4a41e869b4ce"
                thumbnail="https://cdn2.suno.ai/image_611d68d2-0a40-4dce-8f30-fbbc0860b032.jpeg"
                title="indian, hindi, bollywood style, chill song"
              />
             
              <VideoThumbnail
                videoId="fc892ec2-0489-42a9-aac0-8362edde326f"
                thumbnail="https://cdn2.suno.ai/image_fbf06e53-b74a-4609-909e-1375d54d5e46.jpeg"
                title="Intense chinese folk powerful song"
              />
              <VideoThumbnail
                videoId="c7da615b-9411-4b17-8831-4b51b9a7c259"
                thumbnail="https://cdn2.suno.ai/image_large_c8753c23-c57b-4467-916c-c3201e43e906.jpeg"
                title="vietnamese, slow-building progression, virtuoso, acoustic pop, slow, soulful song"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
