
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy, where } from 'firebase/firestore';
import { ReadingRoomBooking, SeatMetadata, RoomNews, RoomType } from '../types';

const ServiceDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hall' | 'orders'>('hall');
  const [roomType, setRoomType] = useState<RoomType>('reading');
  const [bookings, setBookings] = useState<ReadingRoomBooking[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seatMeta, setSeatMeta] = useState<Record<string, SeatMetadata>>({});
  const [news, setNews] = useState<RoomNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [studentForm, setStudentForm] = useState({
    name: '',
    group: '',
    phone: '',
    duration: '2 soat'
  });

  const seatCounts: Record<RoomType, number> = {
    reading: 30,
    electronic: 18
  };

  useEffect(() => {
    // Current bookings for the selected room
    const unsubBookings = onSnapshot(query(collection(db, "room_bookings"), where("roomType", "==", roomType)), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingRoomBooking)));
    });

    // Seat Metadata
    const unsubMeta = onSnapshot(collection(db, "seat_metadata"), (snapshot) => {
      const metaMap: Record<string, SeatMetadata> = {};
      snapshot.docs.forEach(doc => {
        metaMap[doc.id] = { id: doc.id, ...doc.data() } as SeatMetadata;
      });
      setSeatMeta(metaMap);
    });

    // Room News
    const unsubNews = onSnapshot(query(collection(db, "room_news"), orderBy("createdAt", "desc")), (snapshot) => {
      setNews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RoomNews)));
    });

    return () => { unsubBookings(); unsubMeta(); unsubNews(); };
  }, [roomType]);

  const handleBookSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeat === null) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "room_bookings"), {
        seatId: selectedSeat,
        roomType: roomType,
        studentName: studentForm.name,
        studentGroup: studentForm.group,
        studentPhone: studentForm.phone,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: studentForm.duration,
        createdAt: Date.now()
      });
      alert(`Tabriklaymiz! №${selectedSeat}-joy muvaffaqiyatli band qilindi.`);
      setSelectedSeat(null);
      setShowForm(false);
      setStudentForm({ name: '', group: '', phone: '', duration: '2 soat' });
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const isSeatOccupied = (id: number) => bookings.some(b => b.seatId === id);
  const getMetaId = (id: number) => `${roomType}_${id}`;

  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Navbatsiz ARM</h1>
          <p className="text-slate-500 font-medium italic">O'quv zallari uchun interaktiv bron tizimi</p>
        </div>
        <div className="flex p-1.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm">
           <button onClick={() => setActiveTab('hall')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'hall' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Joy bron qilish</button>
           <button onClick={() => setActiveTab('orders')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Onlayn Buyurtmalar</button>
        </div>
      </div>

      {activeTab === 'hall' && (
        <div className="space-y-8">
          {/* Room Selection with Counters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
              onClick={() => setRoomType('reading')}
              className={`p-6 rounded-[2.5rem] font-black uppercase text-left transition-all border-2 flex justify-between items-center ${roomType === 'reading' ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-400'}`}
             >
                <div>
                  <p className="text-xs tracking-widest opacity-80 mb-1">Bo'lim #1</p>
                  <h3 className="text-xl">O'quv zali</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl">30</span>
                  <p className="text-[9px] font-bold">UMUMIY JOY</p>
                </div>
             </button>
             <button 
              onClick={() => setRoomType('electronic')}
              className={`p-6 rounded-[2.5rem] font-black uppercase text-left transition-all border-2 flex justify-between items-center ${roomType === 'electronic' ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-400'}`}
             >
                <div>
                  <p className="text-xs tracking-widest opacity-80 mb-1">Bo'lim #2</p>
                  <h3 className="text-xl">Elektron axborot</h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl">18</span>
                  <p className="text-[9px] font-bold">UMUMIY JOY</p>
                </div>
             </button>
          </div>

          {/* News Banner */}
          {news.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-3xl flex items-center gap-4 overflow-hidden">
               <div className="bg-indigo-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 animate-pulse">Smart E'lon</div>
               <div className="flex-grow overflow-hidden relative h-5">
                  <div className="absolute whitespace-nowrap flex gap-12 animate-[marquee_30s_linear_infinite]">
                     {news.map((item, idx) => (
                       <span key={idx} className="text-sm font-bold text-slate-600 uppercase tracking-tight">
                         <span className="text-indigo-600 mr-2">✦</span> {item.title}: {item.content}
                       </span>
                     ))}
                  </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white p-8 sm:p-12 rounded-[4rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                  <div>
                    <h3 className="font-black text-2xl text-slate-800 uppercase tracking-tighter">{roomType === 'reading' ? "O'quv Zali (Asosiy)" : "Elektron Axborot Bo'limi"}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Joyni tanlang va ma'lumotlarni to'ldiring</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase"><div className="w-3 h-3 bg-slate-100 rounded-full border border-slate-200"></div> Bo'sh</div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-rose-300 uppercase"><div className="w-3 h-3 bg-rose-100 rounded-full"></div> Band</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-4 sm:gap-6">
                  {Array.from({ length: seatCounts[roomType] }, (_, i) => i + 1).map(seatId => {
                    const occupied = isSeatOccupied(seatId);
                    const selected = selectedSeat === seatId;
                    const meta = seatMeta[getMetaId(seatId)];
                    
                    return (
                      <button
                        key={seatId}
                        disabled={occupied}
                        onClick={() => {
                          setSelectedSeat(seatId);
                          setShowForm(true);
                        }}
                        className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center transition-all duration-300 border-2 relative group ${
                          occupied ? 'bg-rose-50 border-rose-50 text-rose-200 cursor-not-allowed' :
                          selected ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-110 z-10' :
                          'bg-slate-50 border-slate-50 text-slate-400 hover:border-indigo-400 hover:bg-white hover:scale-105'
                        }`}
                      >
                        {meta && !occupied && <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></div>}
                        <span className="text-sm font-black">{seatId}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-16 py-8 bg-slate-50/50 rounded-[2.5rem] text-center border-2 border-dashed border-slate-100">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">DERAZA TOMONI / QO'YOSH ZONASI</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-8">
                  <h4 className="font-black text-slate-800 text-lg mb-8 flex items-center gap-2">
                     <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                     Joy tavsifi
                  </h4>
                  
                  {selectedSeat ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                       <div className="bg-indigo-50 p-8 rounded-[2.5rem] text-center border border-indigo-100">
                          <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block mb-2">Tanlangan raqam</span>
                          <span className="text-5xl font-black text-indigo-600">#{selectedSeat}</span>
                       </div>
                       
                       <div className="space-y-4">
                          <p className="text-sm text-slate-600 leading-relaxed italic font-medium">
                            {seatMeta[getMetaId(selectedSeat)]?.description || "Ushbu joy uchun maxsus texnik tavsif kiritilmagan."}
                          </p>

                          <div className="flex flex-wrap gap-2">
                             {(seatMeta[getMetaId(selectedSeat)]?.features || []).map((f, i) => (
                               <span key={i} className="text-[9px] font-black bg-indigo-50 text-indigo-500 px-3 py-1.5 rounded-full border border-indigo-100">{f}</span>
                             ))}
                          </div>
                       </div>
                       
                       <button 
                        onClick={() => setShowForm(true)}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase text-xs tracking-widest"
                       >
                         Bronni yakunlash
                       </button>
                    </div>
                  ) : (
                    <div className="text-center py-24 opacity-20">
                       <svg className="w-20 h-20 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                       <p className="text-sm font-black italic uppercase tracking-widest">Sxemadan joy tanlang</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Student Info Form */}
      {showForm && selectedSeat && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 border border-white/20">
              <div className="p-12">
                 <div className="flex justify-between items-start mb-10">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-full tracking-widest">Bron №{selectedSeat}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{roomType === 'reading' ? "O'quv zali" : "Elektron bo'lim"}</span>
                       </div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Talaba ma'lumotlari</h2>
                    </div>
                    <button onClick={() => setShowForm(false)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>

                 <form onSubmit={handleBookSeat} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ism va Familiyangiz</label>
                       <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 text-lg" placeholder="Ali Valiyev" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Guruh / ID raqam</label>
                          <input required type="text" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" placeholder="310-21 / ARM-001" value={studentForm.group} onChange={e => setStudentForm({...studentForm, group: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Muddat</label>
                          <select className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-600 appearance-none cursor-pointer" value={studentForm.duration} onChange={e => setStudentForm({...studentForm, duration: e.target.value})}>
                             <option>1 soat</option>
                             <option>2 soat</option>
                             <option>3 soat</option>
                             <option>Kun davomida</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Telefon raqamingiz</label>
                       <input required type="tel" className="w-full px-7 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700" placeholder="+998 9x xxx xx xx" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} />
                    </div>

                    <div className="pt-6">
                       <button 
                        disabled={loading}
                        type="submit" 
                        className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all uppercase text-[11px] tracking-[0.2em] disabled:opacity-50"
                       >
                         {loading ? 'Tasdiqlanmoqda...' : 'Hozir bron qilish'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ServiceDesk;
