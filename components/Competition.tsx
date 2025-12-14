import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { FacultyStat } from '../types';
import { storageService } from '../services/storageService';

const Competition: React.FC = () => {
  const [faculties, setFaculties] = useState<FacultyStat[]>([]);

  useEffect(() => {
    // Initial load
    setFaculties(storageService.getFacultyStats().sort((a, b) => b.points - a.points));

    // Listen for updates (Real-time update when Admin saves)
    const handleUpdate = () => {
        setFaculties(storageService.getFacultyStats().sort((a, b) => b.points - a.points));
    };

    window.addEventListener('storage_updated', handleUpdate);
    return () => window.removeEventListener('storage_updated', handleUpdate);
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 min-h-screen py-16 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-flex items-center justify-center p-3 bg-yellow-500/20 rounded-full mb-4 backdrop-blur-sm border border-yellow-500/50">
             <Trophy className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Fakultetlar Reytingi 2025
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-blue-200 mx-auto">
            Eng faol kitobxonlar va bilimga chanqoq talabalar bellashuvi. G'oliblik uchun kurashing!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Top 3 Leaders Visual */}
            {faculties.slice(0, 3).map((faculty, index) => (
                <div key={faculty.id} className={`relative flex flex-col items-center p-8 rounded-3xl border border-white/10 backdrop-blur-md transition-all duration-500 hover:scale-105 ${index === 0 ? 'bg-gradient-to-b from-yellow-500/20 to-transparent order-2 lg:scale-110 shadow-[0_0_50px_rgba(234,179,8,0.3)] z-10' : 'bg-white/5 order-last lg:order-none'}`}>
                    {index === 0 && <div className="absolute -top-6"><Trophy className="w-12 h-12 text-yellow-400 filter drop-shadow-lg" /></div>}
                    {index === 1 && <div className="absolute -top-4"><Award className="w-10 h-10 text-gray-300" /></div>}
                    {index === 2 && <div className="absolute -top-4"><Award className="w-10 h-10 text-orange-400" /></div>}
                    
                    <h3 className="mt-8 text-xl font-bold text-center mb-2">{faculty.name}</h3>
                    <div className="text-4xl font-black text-white mb-4 tracking-tighter">{faculty.points.toLocaleString()} <span className="text-sm font-normal text-blue-300">ball</span></div>
                    
                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-sm text-blue-200">
                            <span className="flex items-center"><Users className="w-4 h-4 mr-1"/> Talabalar</span>
                            <span>{faculty.activeStudents}</span>
                        </div>
                        <div className="flex justify-between text-sm text-blue-200">
                            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1"/> O'qilgan</span>
                            <span>{faculty.reads}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Full List */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10">
            <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex justify-between items-center">
                <h3 className="font-bold flex items-center"><TrendingUp className="w-5 h-5 mr-2"/> To'liq Jadval</h3>
                <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-1 rounded">Onlayn nazorat</span>
            </div>
            <div className="p-6 space-y-4">
                {faculties.map((faculty, index) => (
                    <div key={faculty.id} className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                        <div className="w-8 h-8 flex items-center justify-center font-bold text-lg text-white/50 mr-4">
                            {index + 1}
                        </div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-end mb-1">
                                <span className="font-bold text-lg">{faculty.name}</span>
                                <span className="font-mono text-yellow-400 font-bold">{faculty.points}</span>
                            </div>
                            <div className="w-full bg-black/30 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${faculties[0].points > 0 ? (faculty.points / faculties[0].points) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Competition;
