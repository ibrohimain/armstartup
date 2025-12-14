import React, { useState, useEffect } from 'react';
import { Calendar, PlayCircle, Clock, ChevronRight } from 'lucide-react';
import { storageService } from '../services/storageService';
import { NewsItem, User } from '../types';
import CommentsSection from './CommentsSection';

interface NewsFeedProps {
    user?: User | null;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ user }) => {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Initial load
    setNews(storageService.getNews());

    // Listen for real-time updates (admin adding news or user liking)
    const handleUpdate = () => {
        setNews(storageService.getNews());
    };

    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
            Media Markaz
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Kutubxona hayotidagi so'nggi yangiliklar, tadbirlar va video darsliklar.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2">
          {news.map((item) => (
            <div key={item.id} className="group flex flex-col rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white">
              <div className="relative flex-shrink-0 overflow-hidden">
                {item.type === 'video' && item.videoUrl ? (
                  <div className="aspect-w-16 aspect-h-9 w-full h-72 bg-gray-900">
                     <iframe 
                       src={item.videoUrl} 
                       title={item.title}
                       className="w-full h-full"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                     ></iframe>
                  </div>
                ) : (
                  <div className="h-72 w-full relative overflow-hidden">
                      <img 
                        className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
                        src={item.imageUrl} 
                        alt={item.title} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md text-white ${item.type === 'video' ? 'bg-red-600/90' : 'bg-blue-600/90'}`}>
                        {item.type === 'video' ? 'Video Dars' : 'Yangilik'}
                    </span>
                </div>
              </div>
              <div className="flex-1 p-8 flex flex-col">
                  <div className="flex items-center text-sm text-gray-400 mb-3">
                     <Calendar className="h-4 w-4 mr-2"/>
                     {item.date}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-base text-gray-500 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                  
                  {/* Interactive Section */}
                  <CommentsSection 
                    targetId={item.id} 
                    targetType="news" 
                    currentUser={user || null} 
                    initialLikes={item.likes || 0}
                  />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsFeed;
