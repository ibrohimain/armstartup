
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { Consultation, ScientificContent } from '../types';

const ScientificRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'videos' | 'booking'>('guides');
  const [content, setContent] = useState<ScientificContent[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [bookingForm, setBookingForm] = useState({ teacherName: '', topic: '', date: '', time: '', type: 'Oflayn' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Content (guides and videos)
    const qContent = query(collection(db, "scientific_content"), orderBy("createdAt", "desc"));
    const unsubContent = onSnapshot(qContent, (snapshot) => {
      setContent(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScientificContent)));
    });

    // Consultations
    const qCons = query(collection(db, "consultations"), orderBy("createdAt", "desc"));
    const unsubCons = onSnapshot(qCons, (snapshot) => {
      setConsultations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation)));
    });

    return () => { unsubContent(); unsubCons(); };
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "consultations"), {
        ...bookingForm,
        status: 'Kutilmoqda',
        createdAt: Date.now()
      });
      alert("Konsultatsiya so'rovi yuborildi. Tez orada siz bilan bog'lanamiz.");
      setBookingForm({ teacherName: '', topic: '', date: '', time: '', type: 'Oflayn' });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredGuides = content.filter(c => c.type === 'guide');
  const filteredVideos = content.filter(c => c.type === 'video');

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 mb-2">
            Xorijiy Axborot Resurslari
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Ilmiy Yo‘l Xarita</h1>
          <p className="text-slate-500 font-medium">Scopus va Web of Science bazalarida maqola chop etish strategiyasi.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('guides')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'guides' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Yo‘riqnomalar</button>
          <button onClick={() => setActiveTab('videos')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'videos' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Video darslar</button>
          <button onClick={() => setActiveTab('booking')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'booking' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Konsultatsiya</button>
        </div>
      </div>

      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
          {filteredGuides.length > 0 ? filteredGuides.map((g) => (
            <div key={g.id} className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all group flex flex-col">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
              </div>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-3">{g.category} Yo'riqnomasi</span>
              <h3 className="font-black text-xl text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3.5rem]">{g.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-grow">{g.description}</p>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
                To'liq o'qish
              </button>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
               <p className="text-slate-300 font-bold italic">Hozircha yo'riqnomalar mavjud emas.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in duration-500">
          {filteredVideos.length > 0 ? filteredVideos.map((v) => (
            <div key={v.id} className="bg-white rounded-[3rem] overflow-hidden border border-slate-50 shadow-sm group hover:shadow-2xl transition-all">
               <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                  <img src={`https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={v.title} />
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/30 hover:scale-110 transition-transform cursor-pointer">
                        <svg className="w-8 h-8 translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                     </div>
                  </div>
                  <div className="absolute bottom-5 left-8 z-20">
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{v.category}</span>
                  </div>
               </div>
               <div className="p-8">
                  <h4 className="font-black text-slate-800 text-lg mb-2 leading-tight min-h-[3rem]">{v.title}</h4>
                  <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{v.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Video Darslik</span>
                    <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:translate-x-1 transition-transform">Ko'rish →</button>
                  </div>
               </div>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
               <p className="text-slate-300 font-bold italic">Video darsliklar kutilmoqda.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'booking' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <h3 className="text-3xl font-black text-slate-800 mb-10 tracking-tight">Konsultatsiya Bron Qilish</h3>
            <form onSubmit={handleBooking} className="space-y-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">F.I.SH. / Ilmiy Unvon</label>
                <input required type="text" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" placeholder="Masalan: Dr. Ali Valiyev" value={bookingForm.teacherName} onChange={e => setBookingForm({...bookingForm, teacherName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Mavzu yoki Maqola yo'nalishi</label>
                <input required type="text" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" placeholder="Maqola tahriri, Jurnal tanlash..." value={bookingForm.topic} onChange={e => setBookingForm({...bookingForm, topic: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sana</label>
                  <input required type="date" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold" value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Vaqt</label>
                  <select className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-600 appearance-none" value={bookingForm.time} onChange={e => setBookingForm({...bookingForm, time: e.target.value})}>
                    <option value="">Tanlang</option>
                    <option value="10:00">10:00</option>
                    <option value="11:30">11:30</option>
                    <option value="15:00">15:00</option>
                  </select>
                </div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-indigo-100 hover:bg-black transition-all uppercase text-[11px] tracking-[0.2em]">
                {isSubmitting ? 'Yuborilmoqda...' : 'Uchrashuvni Bron Qilish'}
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                  <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9" /></svg>
               </div>
               <h4 className="text-2xl font-black mb-6 tracking-tight">Xizmat Maqsadi</h4>
               <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                 Xalqaro ilmiy bazalar bilan ishlash bo'limi sizga nufuzli jurnallarda maqola chop etish, iqtiboslikni oshirish va ilmiy profillarni (ORCID, ResearcherID) sozlashda professional ko'mak beradi.
               </p>
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                     <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg></div>
                     <span className="text-xs font-bold uppercase tracking-wider">Xalqaro maqolalar ko'payadi</span>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                     <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div>
                     <span className="text-xs font-bold uppercase tracking-wider">Universitet reytingi ko'tariladi</span>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm">
               <h4 className="font-black text-slate-800 text-lg mb-8 uppercase tracking-tighter">Faol Bronlar Ro'yxati</h4>
               <div className="space-y-4">
                  {consultations.length > 0 ? consultations.slice(0, 3).map(c => (
                    <div key={c.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-indigo-100 transition-all">
                       <div>
                          <p className="font-black text-slate-800 text-sm leading-tight">{c.topic}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1.5">{c.date} • {c.time} • {c.teacherName}</p>
                       </div>
                       <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${c.status === 'Tasdiqlangan' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                         {c.status}
                       </span>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-30 italic text-sm">Hozircha bronlar yo'q.</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScientificRoadmap;
