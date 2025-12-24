
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { ARMEvent } from '../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<ARMEvent[]>([]);

  useEffect(() => {
    const q = query(collection(db, "events"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ARMEvent)));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Tadbirlar va E'lonlar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length > 0 ? events.map(event => (
          <div key={event.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
                <p className="text-sm text-slate-500">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
              </div>
            </div>
            <p className="text-slate-600 mb-4 leading-relaxed">{event.description}</p>
            <button className="text-indigo-600 font-semibold text-sm hover:underline flex items-center gap-1">
              Batafsil ma'lumot
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )) : (
          <div className="col-span-full text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
            Hozircha faol tadbirlar mavjud emas.
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
