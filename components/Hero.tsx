import React from 'react';
import { Search, ArrowRight, BookOpen, Database } from 'lucide-react';

interface HeroProps {
  onSearchClick: () => void;
  onDepartmentsClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSearchClick, onDepartmentsClick }) => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          {/* Diagonal Shape */}
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left animate-slideUp">
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-100 bg-blue-50 text-blue-800 text-xs font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                JizPI Axborot-Resurs Markazi 2030
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Cheksiz bilimlar</span>{' '}
                <span className="block text-blue-600 xl:inline">sizni kutmoqda</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                75,000 dan ortiq bosma va 20.000 dan ortiq elektron resurslar, zamonaviy o'quv zallari va sun'iy intellekt yordamchisi bilan ta'lim sifatini yangi bosqichga olib chiqing.
              </p>
              <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-3">
                <div className="rounded-md shadow">
                  <button
                    onClick={onSearchClick}
                    className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg transition-all shadow-blue-500/30 shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Katalogdan Qidirish
                  </button>
                </div>
                <div className="mt-3 sm:mt-0">
                  <button
                    onClick={onDepartmentsClick}
                    className="w-full flex items-center justify-center px-8 py-4 border border-gray-200 text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 md:py-4 md:text-lg transition-all"
                  >
                    Bo'limlar bilan tanishish
                    <ArrowRight className="ml-2 w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 gap-4 sm:flex sm:justify-center lg:justify-start text-sm text-gray-500 font-medium">
                  <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-blue-500"/> 70K+ Kitoblar</div>
                  <div className="flex items-center"><Database className="w-4 h-4 mr-2 text-green-500"/> Scopus & WoS</div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-gray-50">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="JizPI Library Interior"
        />
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply lg:hidden"></div>
      </div>
    </div>
  );
};

export default Hero;
