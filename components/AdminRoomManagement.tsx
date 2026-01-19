
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, setDoc, addDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { SeatMetadata, RoomNews, ReadingRoomBooking, RoomType } from '../types';

const AdminRoomManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hall' | 'news' | 'bookings'>('hall');
  const [roomType, setRoomType] = useState<RoomType>('reading');
  const [seatMeta, setSeatMeta] = useState<Record<string, SeatMetadata>>({});
  const [news, setNews] = useState<RoomNews[]>([]);
  const [activeBookings, setActiveBookings] = useState<ReadingRoomBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSeatForEdit, setSelectedSeatForEdit] = useState<number | null>(null);

  const [seatForm, setSeatForm] = useState({ description: '', features: '' });
  const [newsForm, setNewsForm] = useState({ title: '', content: '' });

  const seatCounts: Record<RoomType, number> = {
    reading: 30,
    electronic: 18
  };

  useEffect(() => {
    // Body scroll lock
    if (selectedSeatForEdit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedSeatForEdit]);

  useEffect(() => {
    const unsubMeta = onSnapshot(collection(db, "seat_metadata"), (snapshot) => {
      const metaMap: Record<string, SeatMetadata> = {};
      snapshot.docs.forEach(doc => {
        metaMap[doc.id] = { id: doc.id, ...doc.data() } as SeatMetadata;
      });
      setSeatMeta(metaMap);
    });

    const unsubNews = onSnapshot(query(collection(db, "room_news"), orderBy("createdAt", "desc")), (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomNews)));
    });

    const unsubBookings = onSnapshot(query(collection(db, "room_bookings"), orderBy("createdAt", "desc")), (snapshot) => {
      setActiveBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingRoomBooking)));
    });

    return () => { unsubMeta(); unsubNews(); unsubBookings(); };
  }, []);

  const getSeatBooking = (id: number) => activeBookings.find(b => b.seatId === id && b.roomType === roomType);
  const getMetaId = (id: number) => `${roomType}_${id}`;

  const handleClearBooking = async (bookingId: string, studentName: string) => {
    if (confirm(`${studentName}ning bronini bekor qilib, joyni bo'shatmoqchimisiz?`)) {
      try {
        await deleteDoc(doc(db, "room_bookings", bookingId));
      } catch (err) { console.error(err); }
    }
  };

  const handleSeatUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeatForEdit) return;
    setLoading(true);
    const metaId = getMetaId(selectedSeatForEdit);
    try {
      await setDoc(doc(db, "seat_metadata", metaId), {
        description: seatForm.description,
        features: seatForm.features.split(',').map(f => f.trim()).filter(f => f !== '')
      });
      setSelectedSeatForEdit(null);
      setSeatForm({ description: '', features: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "room_news"), {
        ...newsForm,
        createdAt: Date.now()
      });
      setNewsForm({ title: '', content: '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const currentRoomBookings = activeBookings.filter(b => b.roomType === roomType);
  const occupancyRate = Math.round((currentRoomBookings.length / seatCounts[roomType]) * 100);

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen animate-fade-in no-scrollbar">
      {/* Dynamic Header & Stats */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Room Management System
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Xonalar Monitoringi</h1>
          <p className="text-slate-500 font-medium italic">Joylar holatini boshqarish va talabalar oqimini nazorat qilish.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm">
           {[
             { id: 'hall', label: 'Xona Sxemasi', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
             { id: 'bookings', label: 'Barcha Bronlar', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
             { id: 'news', label: 'Zal E\'lonlari', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' }
           ].map(tab => (
             <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'
              }`}
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'hall' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          {/* Room Selection & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             <button 
              onClick={() => setRoomType('reading')}
              className={`lg:col-span-1 p-8 rounded-[3rem] border-4 transition-all flex flex-col justify-between h-44 ${roomType === 'reading' ? 'bg-white border-indigo-600 shadow-2xl' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'}`}
             >
                <div className="flex justify-between w-full">
                   <span className="text-[10px] font-black uppercase tracking-widest">O'quv Zali</span>
                   {roomType === 'reading' && <div className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>}
                </div>
                <div className="text-left">
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Section A</h3>
                   <p className="text-[10px] font-bold mt-1">30 Jami / {activeBookings.filter(b=>b.roomType==='reading').length} Band</p>
                </div>
             </button>

             <button 
              onClick={() => setRoomType('electronic')}
              className={`lg:col-span-1 p-8 rounded-[3rem] border-4 transition-all flex flex-col justify-between h-44 ${roomType === 'electronic' ? 'bg-white border-indigo-600 shadow-2xl' : 'bg-slate-50 border-transparent text-slate-400 opacity-60'}`}
             >
                <div className="flex justify-between w-full">
                   <span className="text-[10px] font-black uppercase tracking-widest">Elektron bo'lim</span>
                   {roomType === 'electronic' && <div className="w-3 h-3 bg-indigo-600 rounded-full animate-ping"></div>}
                </div>
                <div className="text-left">
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Section B</h3>
                   <p className="text-[10px] font-bold mt-1">18 Jami / {activeBookings.filter(b=>b.roomType==='electronic').length} Band</p>
                </div>
             </button>

             <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-8 text-white flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hozirgi yuklama</p>
                   <h2 className="text-5xl font-black tracking-tighter">{occupancyRate}% <span className="text-xl text-indigo-400 font-medium">Band</span></h2>
                </div>
                <div className="w-24 h-24 border-8 border-indigo-500/20 rounded-full flex items-center justify-center relative z-10">
                   <div className="text-xs font-black uppercase">KPI</div>
                   <div 
                    className="absolute inset-0 border-8 border-indigo-500 rounded-full" 
                    style={{ clipPath: `inset(${100-occupancyRate}% 0 0 0)` }}
                   ></div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
             </div>
          </div>

          {/* Interactive Grid Map */}
          <div className="bg-white p-10 sm:p-14 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Zalning interaktiv xaritasi</h3>
                <div className="flex gap-6">
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <div className="w-3 h-3 bg-slate-100 rounded-lg border border-slate-200"></div> Bo'sh
                   </div>
                   <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-500">
                      <div className="w-3 h-3 bg-rose-500 rounded-lg animate-pulse"></div> Band
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-5">
                {Array.from({ length: seatCounts[roomType] }, (_, i) => i + 1).map(seatId => {
                  const booking = getSeatBooking(seatId);
                  const meta = seatMeta[getMetaId(seatId)];
                  
                  return (
                    <div key={seatId} className="relative group">
                      <button
                        onClick={() => setSelectedSeatForEdit(seatId)}
                        className={`w-full aspect-square rounded-[2rem] flex flex-col items-center justify-center transition-all duration-500 border-2 relative ${
                          booking 
                            ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-lg' 
                            : 'bg-slate-50 border-slate-50 text-slate-400 hover:bg-white hover:border-indigo-600 hover:scale-105 hover:shadow-2xl'
                        }`}
                      >
                        <span className="text-xs font-black">{seatId}</span>
                        {meta && !booking && <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>}
                        {booking && <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full border-2 border-white animate-pulse"></div>}
                      </button>
                      
                      {/* Hover Info Tooltip */}
                      {booking && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-slate-900 text-white p-5 rounded-[1.5rem] shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                           <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Hozir band</p>
                           <p className="font-bold text-sm truncate">{booking.studentName}</p>
                           <p className="text-[10px] text-slate-400 mt-1">{booking.startTime} dan beri</p>
                           <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase">{booking.duration}</span>
                              <span className="text-rose-400 text-[8px] font-black uppercase">Clear Seat</span>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>

             <div className="mt-16 py-8 border-4 border-dashed border-slate-50 rounded-[3rem] text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Section Display Area / Windows</p>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
           <div className="p-10 border-b border-slate-50 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter">Barcha Faol Bronlar</h3>
              <div className="flex gap-2">
                 <span className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Jami: {activeBookings.length}</span>
              </div>
           </div>
           <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[900px]">
                 <thead className="bg-slate-50/50">
                    <tr>
                       <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resurs / Stol №</th>
                       <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase tracking-widest">Talaba / Guruh</th>
                       <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase tracking-widest">Vaqt Oralig'i</th>
                       <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                       <th className="px-10 py-7 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amal</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {activeBookings.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${b.roomType === 'reading' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                 {b.seatId}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-800">Joy №{b.seatId}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{b.roomType === 'reading' ? "O'quv Zali" : "Elektron"}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <p className="text-sm font-black text-slate-800">{b.studentName}</p>
                           <p className="text-[10px] font-bold text-indigo-500 mt-1">{b.studentGroup} • {b.studentPhone}</p>
                        </td>
                        <td className="px-10 py-8">
                           <p className="text-xs font-black text-slate-700">Boshlandi: {b.startTime}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Davomiyligi: {b.duration}</p>
                        </td>
                        <td className="px-10 py-8 text-center">
                           <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Faol</span>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <button 
                            onClick={() => b.id && handleClearBooking(b.id, b.studentName)}
                            className="px-6 py-2.5 bg-rose-50 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm"
                           >
                             Bo'shatish
                           </button>
                        </td>
                      </tr>
                    ))}
                    {activeBookings.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-32 text-center text-slate-300 font-black italic uppercase tracking-widest">Faol bronlar mavjud emas</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {activeTab === 'news' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 animate-in fade-in duration-500">
           {/* Add News Form */}
           <div className="xl:col-span-1">
              <form onSubmit={handleAddNews} className="bg-white p-10 sm:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl sticky top-8 space-y-8">
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-4">Zal E'lonini Yaratish</h3>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">E'lon Mavzusi</label>
                    <input required type="text" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-800" placeholder="Muhim xabar..." value={newsForm.title} onChange={e => setNewsForm({...newsForm, title: e.target.value})} />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Xabar Matni</label>
                    <textarea required rows={5} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] outline-none font-medium italic leading-relaxed" placeholder="Xona ish tartibidagi o'zgarishlar..." value={newsForm.content} onChange={e => setNewsForm({...newsForm, content: e.target.value})} />
                 </div>
                 <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase text-[11px] tracking-widest hover:bg-black transition-all">
                    {loading ? 'Yuborilmoqda...' : 'Portalga Joylash'}
                 </button>
              </form>
           </div>

           {/* News List */}
           <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
              {news.map(item => (
                <div key={item.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                   <div>
                      <div className="flex justify-between items-start mb-6">
                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                         </div>
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-800 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium italic leading-relaxed line-clamp-4">"{item.content}"</p>
                   </div>
                   <div className="mt-8 pt-6 border-t border-slate-50 flex justify-end">
                      <button onClick={() => item.id && deleteDoc(doc(db, "room_news", item.id))} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 border border-rose-100 shadow-sm">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                </div>
              ))}
              {news.length === 0 && (
                <div className="col-span-full py-40 bg-white rounded-[4rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center">
                   <p className="text-slate-300 font-black italic uppercase tracking-widest">Faol e'lonlar mavjud emas</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Seat Config Modal - Centered & Backdrop Locked */}
      {selectedSeatForEdit && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300 pointer-events-auto">
          <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-500 border border-white/20">
             <div className="p-10 sm:p-14">
                <div className="flex justify-between items-start mb-14">
                   <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Joy №{selectedSeatForEdit}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{roomType === 'reading' ? "Section A" : "Section B"}</span>
                      </div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Stol Sozlamalari</h2>
                   </div>
                   <button onClick={() => setSelectedSeatForEdit(null)} className="p-4 bg-slate-50 text-slate-300 rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 shadow-sm active:scale-90 group">
                      <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>

                {/* Seat Information if occupied */}
                {getSeatBooking(selectedSeatForEdit) && (
                   <div className="mb-10 p-8 bg-rose-50 rounded-[2.5rem] border border-rose-100 animate-in slide-in-from-top-4">
                      <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4">Hozirgi bandlik ma'lumoti:</p>
                      <div className="flex justify-between items-center">
                         <div>
                            <p className="text-xl font-black text-slate-800">{getSeatBooking(selectedSeatForEdit)?.studentName}</p>
                            <p className="text-sm font-bold text-rose-600 mt-1">{getSeatBooking(selectedSeatForEdit)?.studentPhone}</p>
                         </div>
                         <button 
                          onClick={() => handleClearBooking(getSeatBooking(selectedSeatForEdit)!.id!, getSeatBooking(selectedSeatForEdit)!.studentName)}
                          className="px-6 py-3 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                         >
                            Bo'shatish
                         </button>
                      </div>
                   </div>
                )}

                <form onSubmit={handleSeatUpdate} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Texnik Tavsif</label>
                      <textarea 
                        rows={3} 
                        className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] outline-none font-medium italic text-slate-700 leading-relaxed" 
                        placeholder="Deraza yonidagi stol, quyosh tushadigan zona..." 
                        value={seatForm.description} 
                        onChange={e => setSeatForm({...seatForm, description: e.target.value})} 
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Qulayliklar (Vergul bilan ajrating)</label>
                      <input 
                        type="text" 
                        className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-800" 
                        placeholder="Rozetka, Lampa, Yumshoq kreslo..." 
                        value={seatForm.features} 
                        onChange={e => setSeatForm({...seatForm, features: e.target.value})} 
                      />
                   </div>
                   <div className="pt-6">
                      <button disabled={loading} type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-indigo-600 transition-all uppercase text-[11px] tracking-widest shadow-slate-200">
                         {loading ? 'SAQLANMOQDA...' : "METAMA'LUMOTNI YANGILASH"}
                      </button>
                   </div>
                </form>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRoomManagement;
