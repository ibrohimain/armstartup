
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Consultation, ScientificContent, RoadmapStep } from '../types';

const ScientificRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journey' | 'resources' | 'booking'>('journey');
  const [content, setContent] = useState<ScientificContent[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [bookingForm, setBookingForm] = useState({ teacherName: '', topic: '', date: '', time: '', type: 'Oflayn', studentName: '', studentPhone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const roadmapSteps: RoadmapStep[] = [
    { id: 1, title: "Tadqiqot rejalashtirish", description: "Mavzu dolzarbligi va manbalar tahlili.", status: 'Completed', progress: 100, icon: "M13 10V3L4 14h7v7l9-11h-7z", longText: "Tadqiqotning dastlabki bosqichida Scopus va WoS bazalaridan foydalanib, tanlangan mavzu bo'yicha so'nggi 5 yillikdagi maqolalarni o'rganish zarur." },
    { id: 2, title: "Maqola yozish (IMRAD)", description: "Xalqaro standartlar bo'yicha strukturani shakllantirish.", status: 'Active', progress: 60, icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", longText: "IMRAD standarti: Introduction (Kirish), Methods (Metodlar), Results (Natijalar) va Discussion (Muhokama). Har bir qism uchun aniq me'yorlar mavjud." },
    { id: 3, title: "Jurnal tanlash va Tekshirish", description: "Kvarti (Q1-Q4) va impakt-faktor tahlili.", status: 'Pending', progress: 0, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", longText: "Jurnalning soxta (predatory) emasligini tekshirish uchun SCImago va Master Journal List xizmatlaridan foydalanamiz." },
    { id: 4, title: "Yuborish va Peer Review", description: "Tahririyat bilan muloqot va retsenziya jarayoni.", status: 'Pending', progress: 0, icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z", longText: "Retsenzentlar fikriga asoslanib maqolani tahrirlash — muvaffaqiyatli nashrning 50% garovidir." }
  ];

  useEffect(() => {
    const unsubContent = onSnapshot(query(collection(db, "scientific_content"), orderBy("createdAt", "desc")), (s) => {
      setContent(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScientificContent)));
    });
    const unsubCons = onSnapshot(query(collection(db, "consultations"), orderBy("createdAt", "desc")), (s) => {
      setConsultations(s.docs.map(doc => ({ id: doc.id, ...doc.data() } as Consultation)));
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
      alert("So'rovingiz qabul qilindi!");
      setBookingForm({ teacherName: '', topic: '', date: '', time: '', type: 'Oflayn', studentName: '', studentPhone: '' });
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-2 sm:p-8 max-w-[1500px] mx-auto min-h-screen">
      <div className="bg-indigo-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-16 text-white shadow-2xl mb-10 relative overflow-hidden">
         <div className="relative z-10 max-w-3xl">
            <h1 className="text-3xl sm:text-6xl font-black mb-6 tracking-tight">Ilmiy Tadqiqot <br/><span className="text-indigo-400">Yo‘l Xaritasi</span></h1>
            <p className="text-indigo-100 text-base sm:text-xl font-medium leading-relaxed opacity-80 mb-10 italic">
              Scopus va Web of Science bazalari uchun interaktiv metodik yo'riqnomalar markazi.
            </p>
         </div>
      </div>

      <div className="flex justify-center mb-12">
        <div className="flex bg-white p-1.5 rounded-[1.8rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto">
           {[{ id: 'journey', label: 'Yo\'l Xaritasi' }, { id: 'resources', label: 'Video & Darslar' }, { id: 'booking', label: 'Ekspert Ko\'magi' }].map(tab => (
             <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-grow sm:flex-initial px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-indigo-600'}`}>{tab.label}</button>
           ))}
        </div>
      </div>

      {activeTab === 'journey' && (
        <div className="animate-in fade-in slide-in-from-bottom-5">
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {roadmapSteps.map((step) => (
                <button key={step.id} onClick={() => setSelectedStep(step)} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-left ${selectedStep?.id === step.id ? 'border-indigo-600 shadow-2xl scale-105' : 'border-slate-50 shadow-sm hover:border-indigo-100'}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${step.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={step.icon} /></svg></div>
                    <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight">{step.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Batafsil ma'lumot →</p>
                </button>
              ))}
           </div>
           
           {/* Step Detail Modal */}
           {selectedStep && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-10 bg-slate-900/70 backdrop-blur-xl animate-in fade-in">
                <div className="bg-white w-full max-w-2xl p-8 sm:p-12 rounded-[3.5rem] shadow-2xl relative animate-in zoom-in-95">
                   <button onClick={() => setSelectedStep(null)} className="absolute top-6 right-6 p-4 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-2xl transition-all border border-slate-100 group">
                      <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                   <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Bosqich tafsilotlari</div>
                   <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight">{selectedStep.title}</h3>
                   <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium italic">"{selectedStep.longText}"</p>
                   <button onClick={() => setSelectedStep(null)} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-widest shadow-xl">Tushunarli</button>
                </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in">
          {content.map(res => {
            const ytId = res.url ? getYoutubeId(res.url) : null;
            return (
              <div key={res.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                 {ytId ? (
                   <div className="aspect-video">
                     <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${ytId}`} title={res.title} frameBorder="0" allowFullScreen></iframe>
                   </div>
                 ) : (
                   <div className="aspect-video bg-slate-50 flex items-center justify-center text-slate-200">
                     <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                 )}
                 <div className="p-8 flex-grow">
                    <span className="text-[9px] font-black px-4 py-1.5 rounded-full uppercase bg-indigo-50 text-indigo-600 mb-4 inline-block">{res.type}</span>
                    <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight group-hover:text-indigo-600 transition-colors">{res.title}</h3>
                    <p className="text-sm text-slate-400 font-medium mb-8 line-clamp-2 italic">"{res.description}"</p>
                    <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{res.category}</span>
                       {!ytId && res.url && <button onClick={() => window.open(res.url, '_blank')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">Yuklab olish</button>}
                    </div>
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'booking' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in">
          <div className="bg-white p-8 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl">
             <h3 className="text-2xl sm:text-3xl font-black text-slate-800 mb-10 tracking-tight">Ekspert Konsultatsiyasi</h3>
             <form onSubmit={handleBooking} className="space-y-6">
                <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[1.8rem] outline-none font-bold" placeholder="F.I.SH" value={bookingForm.studentName} onChange={e => setBookingForm({...bookingForm, studentName: e.target.value})} />
                <input required type="tel" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[1.8rem] outline-none font-bold" placeholder="Telefon +998" value={bookingForm.studentPhone} onChange={e => setBookingForm({...bookingForm, studentPhone: e.target.value})} />
                <textarea required rows={4} className="w-full px-7 py-5 bg-slate-50 border-none rounded-[1.8rem] outline-none font-medium italic" placeholder="Savolingiz yoki mavzu..." value={bookingForm.topic} onChange={e => setBookingForm({...bookingForm, topic: e.target.value})} />
                <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2rem] shadow-xl uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                  {isSubmitting ? 'Yuborilmoqda...' : 'Bron Qilish'}
                </button>
             </form>
          </div>
          <div className="bg-indigo-50 p-12 rounded-[3.5rem] border border-indigo-100 flex flex-col justify-center text-center sm:text-left">
             <h4 className="text-2xl font-black text-indigo-900 mb-6">Nima uchun kerak?</h4>
             <p className="text-indigo-700 font-medium leading-relaxed mb-8 italic">
               Scopus jurnallari qoidalari tez-tez o'zgarib turadi. Bizning ekspertlar sizga tahririyat talablarini to'g'ri bajarishda yordam berishadi.
             </p>
             <div className="space-y-4">
                {['Maqolani tekshirish', 'Jurnal tanlash (Q1-Q4)', 'Ingliz tili tahriri'].map((v, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/50 p-4 rounded-2xl">
                     <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                     <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">{v}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScientificRoadmap;
