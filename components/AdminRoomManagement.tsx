
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { SeatMetadata, RoomNews, ReadingRoomBooking } from '../types';

const AdminRoomManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'seats' | 'news' | 'bookings'>('bookings');
  const [seatMeta, setSeatMeta] = useState<Record<string, SeatMetadata>>({});
  const [news, setNews] = useState<RoomNews[]>([]);
  const [activeBookings, setActiveBookings] = useState<ReadingRoomBooking[]>([]);
  const [loading, setLoading] = useState(false);

  // Seat selection states
  const [roomType, setRoomType] = useState<'reading' | 'electronic'>('reading');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState<string>('1');
  const [seatDesc, setSeatDesc] = useState('');
  const [seatFeatures, setSeatFeatures] = useState('');

  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');

  useEffect(() => {
    // 1. Joylar haqida metadata (stollar qulayliklari)
    const unsubMeta = onSnapshot(collection(db, "seat_metadata"), (snapshot) => {
      const metaMap: Record<string, SeatMetadata> = {};
      snapshot.docs.forEach(doc => {
        metaMap[doc.id] = { id: doc.id, ...doc.data() } as SeatMetadata;
      });
      setSeatMeta(metaMap);
    });

    // 2. Xona yangiliklari
    const unsubNews = onSnapshot(query(collection(db, "room_news"), orderBy("createdAt", "desc")), (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomNews)));
    });

    // 3. Faol bronlar ro'yxati (REAL-TIME LISTENING)
    const unsubBookings = onSnapshot(query(collection(db, "room_bookings"), orderBy("createdAt", "desc")), (snapshot) => {
      // Bu yerda har bir o'zgarish (qo'shilish yoki O'CHIRILISH) avtomatik ravishda ushlanadi
      setActiveBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingRoomBooking)));
    });

    return () => { unsubMeta(); unsubNews(); unsubBookings(); };
  }, []);

  // MUHIM: Joyni bo'shatish funksiyasi
  const handleClearBooking = async (bookingId: string, studentName: string) => {
    // Admin tasdiqlashi
    if (confirm(`Haqiqatdan ham ${studentName}ning bronini o'chirib, joyni BO'SH holatga o'tkazmoqchimisiz?`)) {
      try {
        // Firebasedan hujjatni o'chirish
        // Bu o'chirilishi bilan ServiceDesk.tsx dagi "isSeatOccupied" avtomatik FALSE bo'ladi
        const bookingRef = doc(db, "room_bookings", bookingId);
        await deleteDoc(bookingRef);
        
        // Muvaffaqiyatli xabar
        console.log(`Bron o'chirildi: ${bookingId}`);
      } catch (err) {
        console.error("Firebase o'chirishda xatolik:", err);
        alert("Joyni bo'shatishda texnik xatolik yuz berdi.");
      }
    }
  };

  const handleSeatUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const metaId = `${roomType}_${selectedSeatNumber}`;
    try {
      await setDoc(doc(db, "seat_metadata", metaId), {
        description: seatDesc,
        features: seatFeatures.split(',').map(f => f.trim()).filter(f => f !== '')
      });
      alert(`№${selectedSeatNumber}-joy ma'lumotlari yangilandi!`);
      setSeatDesc('');
      setSeatFeatures('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "room_news"), {
        title: newsTitle,
        content: newsContent,
        createdAt: Date.now()
      });
      setNewsTitle('');
      setNewsContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (confirm("Ushbu e'lon o'chirilsinmi?")) {
      await deleteDoc(doc(db, "room_news", id));
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Xona Boshqaruvi</h2>
          <p className="text-slate-500 font-medium italic mt-1">Joylar holatini nazorat qilish va bronlarni boshqarish</p>
        </div>
        <div className="flex bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
           {[
             { id: 'bookings', label: 'Faol Bronlar' },
             { id: 'seats', label: 'Joylar Sozlamasi' },
             { id: 'news', label: 'E\'lonlar' }
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)} 
               className={`px-8 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-[0.15em] whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
           <div className="p-10 border-b border-slate-50 bg-slate-50/40 flex justify-between items-center">
              <div>
                <h3 className="font-black text-2xl text-slate-800 tracking-tighter">Hozirda band qilingan joylar</h3>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest italic">Joyni bo'shatish uchun tegishli tugmani bosing</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                <span className="text-2xl font-black">{activeBookings.length}</span>
                <span className="text-[10px] font-black uppercase">Bron</span>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joy / Xona</th>
                       <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Talaba Ma'lumotlari</th>
                       <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vaqt & Muddat</th>
                       <th className="px-12 py-7 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Statusni o'zgartirish</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {activeBookings.length > 0 ? activeBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/40 transition-colors group">
                         <td className="px-12 py-8">
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-white border-2 border-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm">
                                  {b.seatId}
                               </div>
                               <div>
                                  <p className="text-base font-black text-slate-800 uppercase tracking-tighter">Joy №{b.seatId}</p>
                                  <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block mt-1 ${b.roomType === 'reading' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {b.roomType === 'reading' ? "O'quv zali" : "Elektron bo'lim"}
                                  </p>
                               </div>
                            </div>
                         </td>
                         <td className="px-12 py-8">
                            <p className="text-base font-black text-slate-800">{b.studentName}</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">ID/Guruh: {b.studentGroup}</p>
                            <p className="text-xs font-black text-indigo-500 mt-0.5">{b.studentPhone}</p>
                         </td>
                         <td className="px-12 py-8 text-center">
                            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{b.duration}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase bg-slate-100 py-1 rounded-lg italic">Boshlandi: {b.startTime}</p>
                         </td>
                         <td className="px-12 py-8 text-right">
                            <button 
                              onClick={() => b.id && handleClearBooking(b.id, b.studentName)}
                              className="bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white px-7 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-sm hover:shadow-xl hover:shadow-rose-100 border border-rose-100"
                            >
                               Joyni bo'shatish
                            </button>
                         </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center text-slate-300 italic font-medium">
                          <div className="flex flex-col items-center">
                             <svg className="w-20 h-20 mb-6 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                             <p className="text-lg">Hozirda barcha o'quv zallari bo'sh.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'seats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500">
          <form onSubmit={handleSeatUpdate} className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8">
            <h3 className="font-black text-2xl text-slate-800 mb-4 uppercase tracking-tighter">Stol Ma'lumotlarini Sozlash</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Bo'lim</label>
                <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-700" value={roomType} onChange={e => setRoomType(e.target.value as any)}>
                   <option value="reading">O'quv Zali</option>
                   <option value="electronic">Elektron Bo'lim</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Joy №</label>
                <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-700" value={selectedSeatNumber} onChange={e => setSelectedSeatNumber(e.target.value)}>
                  {Array.from({length: roomType === 'reading' ? 30 : 18}, (_, i) => i + 1).map(n => <option key={n} value={n.toString()}>{n}-joy</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Annotatsiya</label>
              <textarea rows={4} className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium leading-relaxed" placeholder="Stol haqida qisqacha..." value={seatDesc} onChange={e => setSeatDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Xususiyatlar</label>
              <input type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none" placeholder="Lampa, Rozetka, Internet..." value={seatFeatures} onChange={e => setSeatFeatures(e.target.value)} />
            </div>
            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all uppercase text-[11px] tracking-widest">Ma'lumotni Saqlash</button>
          </form>

          <div className="space-y-8 overflow-hidden">
             <h3 className="font-black text-2xl text-slate-800 mb-4 uppercase tracking-tighter">Barcha Sozlamalar</h3>
             <div className="space-y-4 max-h-[700px] overflow-y-auto pr-6 no-scrollbar">
                {Object.keys(seatMeta).length > 0 ? Object.keys(seatMeta).sort().map(sid => (
                  <div key={sid} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm flex items-start gap-6 hover:border-indigo-100 transition-all group">
                     <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0 text-xs shadow-inner">
                        {sid.includes('reading') ? 'R' : 'E'}{sid.split('_')[1]}
                     </div>
                     <div className="flex-grow">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{sid.includes('reading') ? "O'quv zali" : "Elektron bo'lim"}</span>
                           <button onClick={() => deleteDoc(doc(db, "seat_metadata", sid))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                        <p className="text-sm text-slate-600 font-bold italic leading-relaxed">"{seatMeta[sid].description}"</p>
                        <div className="flex flex-wrap gap-1.5 mt-4">
                           {seatMeta[sid].features.map((f, i) => <span key={i} className="text-[9px] bg-slate-50 text-slate-400 px-3 py-1 rounded-full border border-slate-100 font-black uppercase">{f}</span>)}
                        </div>
                     </div>
                  </div>
                )) : (
                  <div className="text-center py-20 opacity-30 italic text-slate-400">Metadata kiritilmagan.</div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 animate-in fade-in duration-500">
           <form onSubmit={handleAddNews} className="md:col-span-1 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-sm space-y-8 h-fit">
              <h3 className="font-black text-2xl text-slate-800 mb-2 uppercase tracking-tighter">Zal Yangiligi</h3>
              <p className="text-xs text-slate-400 mb-8 font-medium italic">Monitorlarda ko'rinadigan xabarlar</p>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Sarlavha</label>
                 <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" placeholder="Mavzu..." value={newsTitle} onChange={e => setNewsTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Xabar matni</label>
                 <textarea required rows={4} className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium" placeholder="Xabar mazmuni..." value={newsContent} onChange={e => setNewsContent(e.target.value)} />
              </div>
              <button disabled={loading} type="submit" className="w-full bg-slate-800 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all uppercase text-[11px] tracking-widest">E'lon qilish</button>
           </form>

           <div className="md:col-span-2 space-y-8">
              <h3 className="font-black text-2xl text-slate-800 mb-4 uppercase tracking-tighter">Mavjud Xabarlar</h3>
              <div className="space-y-6">
                 {news.length > 0 ? news.map(item => (
                   <div key={item.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm flex justify-between items-start group hover:border-indigo-100 transition-all hover:shadow-xl hover:shadow-indigo-50">
                      <div>
                         <h4 className="font-black text-xl text-slate-800 mb-3">{item.title}</h4>
                         <p className="text-base text-slate-500 leading-relaxed italic opacity-80">"{item.content}"</p>
                         <div className="flex items-center gap-3 mt-6">
                            <span className="text-[10px] text-slate-300 font-black uppercase bg-slate-50 px-3 py-1 rounded-full">{new Date(item.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                      <button onClick={() => item.id && deleteNews(item.id)} className="p-4 bg-slate-50 text-slate-300 hover:text-rose-500 rounded-[1.5rem] transition-all">
                         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                 )) : (
                   <div className="text-center py-32 opacity-20 italic">Yangiliklar mavjud emas.</div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomManagement;
