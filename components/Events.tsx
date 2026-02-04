
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { ARMEvent } from '../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<ARMEvent[]>([]);
  const [filter, setFilter] = useState<'Hammasi' | 'Yangilik' | 'Tadbir'>('Hammasi');
  const [selectedEvent, setSelectedEvent] = useState<ARMEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ARMEvent)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredEvents = events.filter(e => filter === 'Hammasi' || e.category === filter);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
      {/* Oddiy Sarlavha qismi */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Yangiliklar va Tadbirlar</h1>
        <div className="w-16 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Kamtarona Filtrlar */}
      <div className="flex justify-center gap-4 mb-10">
        {['Hammasi', '', 'Tadbir'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all border ${
              filter === cat 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center opacity-30">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Mazmun qismi (Rasmdagi kabi matn asosiy o'rinda) */}
              <div className="p-8 flex-grow">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${event.category === 'Tadbir' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.category}</span>
                </div>
                <h3 className="text-xl font-medium text-slate-800 leading-relaxed mb-4">
                  {event.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-4 leading-relaxed italic">
                  "{event.description}"
                </p>
              </div>

              {/* Pastki qism (Rasmdagi kabi muallif va ko'rishlar soni) */}
              <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] font-medium text-emerald-600/70 hover:underline">ARM Administratsiyasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[11px] font-bold">{Math.floor(Math.random() * 5000) + 1000}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Oddiy Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 sm:p-12">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{selectedEvent.category} • {new Date(selectedEvent.date).toLocaleDateString()}</span>
                  <h2 className="text-2xl font-bold text-slate-800 mt-2">{selectedEvent.title}</h2>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-300 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed italic border-l-4 border-indigo-100 pl-6 mb-10">
                {selectedEvent.description}
              </p>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>Manzil: {selectedEvent.location || 'ARM HUB'}</span>
                <button onClick={() => setSelectedEvent(null)} className="px-6 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition-colors">Yopish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
