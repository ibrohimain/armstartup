
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Booking, ReadingRoomBooking } from '../types';

const MyCabinet: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomBookings, setRoomBookings] = useState<ReadingRoomBooking[]>([]);
  const studentName = "Talaba Namuna"; 
  const studentID = "ARM-2024-99881";

  useEffect(() => {
    // Kitob buyurtmalari
    const q1 = query(collection(db, "bookings"), where("studentName", "==", studentName));
    const unsub1 = onSnapshot(q1, (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
    });

    // Xona bronlari
    const q2 = query(collection(db, "room_bookings"), where("studentName", "==", studentName));
    const unsub2 = onSnapshot(q2, (snapshot) => {
      setRoomBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReadingRoomBooking)));
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  const handleCancelRoomBooking = async (id: string) => {
    if (confirm("Ushbu bronni bekor qilmoqchimisiz? Joy boshqalar uchun bo'shatiladi.")) {
      try {
        await deleteDoc(doc(db, "room_bookings", id));
      } catch (err) {
        console.error(err);
        alert("Bekor qilishda xatolik yuz berdi.");
      }
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STUDENT_${studentID}`;

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-100">
            TN
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-black text-slate-800">{studentName}</h1>
            <p className="text-slate-500 font-medium mt-1">ID: {studentID}</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500 uppercase tracking-widest">Transport Muhandisligi</span>
              <span className="text-[10px] font-bold bg-emerald-100 px-3 py-1 rounded-full text-emerald-600 uppercase tracking-widest">3-Kurs</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 text-center">
             <img src={qrUrl} alt="Student QR" className="w-24 h-24 mx-auto mb-2" />
             <p className="text-[10px] font-bold text-slate-400">PERSONAL QR-ID</p>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 flex flex-col justify-center">
           <h4 className="text-lg font-bold mb-2">ARM Ballari</h4>
           <div className="flex items-end gap-2">
              <span className="text-5xl font-black">1,240</span>
              <span className="text-sm font-bold opacity-60 mb-2">ball</span>
           </div>
           <p className="text-xs mt-4 opacity-70">Faol kitobxonlik va o'z vaqtida qaytarilgan kitoblar uchun.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Orders */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            Kitob buyurtmalarim
          </h2>
          <div className="space-y-4">
            {bookings.length > 0 ? bookings.map(b => (
              <div key={b.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all">
                <div>
                  <p className="font-bold text-slate-800">{b.bookTitle}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest ${
                  b.status === 'Tasdiqlangan' ? 'bg-green-100 text-green-600' : 
                  b.status === 'Rad etilgan' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {b.status}
                </span>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 italic text-sm">Hali kitob buyurtma qilmagansiz.</div>
            )}
          </div>
        </div>

        {/* Room Bookings */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            Band qilingan joylarim
          </h2>
          <div className="space-y-4">
            {roomBookings.length > 0 ? roomBookings.map(rb => (
              <div key={rb.id} className="flex justify-between items-center p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 animate-in fade-in duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                    {rb.seatId}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-tight">Joy №{rb.seatId}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{rb.roomType === 'reading' ? "O'quv zali" : "Elektron bo'lim"} • {rb.startTime}</p>
                  </div>
                </div>
                <button 
                  onClick={() => rb.id && handleCancelRoomBooking(rb.id)}
                  className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors uppercase tracking-widest"
                >
                  Bekor qilish
                </button>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 italic text-sm">Faol bronlar mavjud emas.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCabinet;
