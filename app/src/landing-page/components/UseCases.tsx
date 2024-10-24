import { FaMusic, FaYoutube, FaAd, FaGamepad, FaGraduationCap, FaFilm, FaCalendarAlt, FaHeartbeat, FaGlobe } from 'react-icons/fa';

const useCases = [
  { icon: FaMusic, title: 'Music Industry', description: 'Empower indie artists with rapid music creation and dynamic lyric visualizations.' },
  { icon: FaYoutube, title: 'Content Creation', description: 'Enhance videos with custom soundtracks and captivating animated lyrics.' },
  { icon: FaAd, title: 'Advertising', description: 'Craft catchy jingles and eye-catching lyric-based visuals for impactful marketing.' },
  { icon: FaGamepad, title: 'Gaming', description: 'Generate immersive game soundtracks and interactive lyric displays for cutscenes.' },
  { icon: FaGraduationCap, title: 'Education', description: 'Inspire students with hands-on music composition and synchronized word animation projects.' },
  { icon: FaFilm, title: 'Film & Video', description: 'Quickly produce scores, soundtracks, and kinetic typography for any scene.' },
  { icon: FaCalendarAlt, title: 'Event Planning', description: 'Create personalized music and moving lyric displays for weddings and corporate events.' },
  { icon: FaHeartbeat, title: 'Therapy', description: 'Enhance therapeutic sessions with tailored music and rhythmic word visualizations.' },
  { icon: FaGlobe, title: 'And Many More', description: 'Explore countless other applications across various industries and creative fields.' },
];

export default function UseCases() {
  return (
    <section className="mt-12 mx-auto max-w-7xl px-6 lg:px-8">
      <div className="py-24 relative">
        <div className="relative">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-white text-center relative z-10">
            Unleash Creativity <br/> <span className="text-yellow-500">Across Industries</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-12">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white/80 dark:bg-boxdark/80 p-6 rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
                <useCase.icon className="text-4xl mb-4 text-yellow-500" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{useCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
