
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { Book } from '../types';

const DEFAULT_BOOK_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop";

const Catalog: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [activeQR, setActiveQR] = useState<Book | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ bookTitle: '', author: '', reason: '', phone: '' });

  // Body scroll lock - Modal ochilganda fonni to'xtatish
  // sd
  useEffect(() => {
    if (showRequestModal || activeQR) {
      document.body.style.overflow = 'hidden';
      document.body.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.pointerEvents = 'auto';
    };
  }, [showRequestModal, activeQR]);

  useEffect(() => {
    const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleReserve = async (book: Book) => {
    if (!book.id) return;
    setReservingId(book.id);
    try {
      // Firebase'ga band qilish so'rovini yuborish
      await addDoc(collection(db, "bookings"), {
        bookId: book.id,
        bookTitle: book.title,
        studentName: "Talaba Namuna", 
        status: 'Kutilmoqda',
        createdAt: Date.now()
      });
      alert(`"${book.title}" uchun band qilish so'rovi adminga yuborildi. Tez orada tasdiqlanadi.`);
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setReservingId(null);
    }
  };

  const handleBookRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "book_requests"), {
        bookTitle: requestForm.bookTitle,
        author: requestForm.author,
        reason: requestForm.reason,
        studentPhone: requestForm.phone,
        studentName: "Talaba Namuna",
        status: 'Kutilmoqda',
        createdAt: Date.now()
      });
      alert("Fondni boyitish so'rovingiz qabul qilindi.");
      setShowRequestModal(false);
      setRequestForm({ bookTitle: '', author: '', reason: '', phone: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.inventoryNumber?.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen no-scrollbar">
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            Smart ARM Catalog
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tighter">Elektron Fond</h1>
          <p className="text-slate-500 font-medium italic text-lg opacity-80">Barcha resurslar va bibliografik ma'lumotlar markazi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-5 w-full lg:w-auto">
          <div className="relative flex-grow lg:min-w-[500px]">
            <input 
              type="text" 
              placeholder="Kitob, muallif yoki inventar №..."
              className="w-full pl-16 pr-8 py-6 bg-white border border-slate-100 rounded-[3rem] focus:ring-[12px] focus:ring-indigo-500/5 outline-none transition-all shadow-2xl shadow-slate-200/30 font-bold text-slate-800 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="group px-10 py-6 bg-slate-900 text-white font-black rounded-[3rem] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 text-[11px] uppercase tracking-widest active:scale-95"
          >
            <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white group-hover:text-indigo-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
            </div>
            Yangi kitob so'rash
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48">
          <div className="w-20 h-20 border-[8px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-10 text-slate-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Fond ma'lumotlari yuklanmoqda...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
          {filtered.map(book => (
            <div key={book.id} className="group flex flex-col h-full perspective-1000">
              {/* Premium Book Card */}
              <div className="bg-white rounded-[3.5rem] p-6 border border-slate-100 shadow-sm transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] flex flex-col h-full transform-gpu group-hover:-translate-y-3 relative overflow-hidden">
                
                {/* Image Section */}
                <div className="aspect-[3/4] rounded-[2.5rem] mb-6 overflow-hidden relative shadow-inner bg-slate-50 border border-slate-50">
                  <img 
                    src={book.coverUrl || DEFAULT_BOOK_COVER} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    alt={book.title} 
                  />
                  
                  {/* Status Badge Over Image */}
                  <div className="absolute top-4 left-4">
                     <span className={`px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-2xl backdrop-blur-md border border-white/20 ${book.isAvailable ? 'bg-emerald-500/80 text-white' : 'bg-rose-500/80 text-white'}`}>
                      {book.isAvailable ? 'Mavjud' : 'Band qilingan'}
                    </span>
                  </div>

                  {/* QR Action Overlay */}
                  <div className="absolute inset-0 bg-indigo-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button 
                      onClick={() => setActiveQR(book)}
                      style={{ pointerEvents: 'auto' }}
                      className="p-5 bg-white text-indigo-600 rounded-[2rem] shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 active:scale-90"
                    >
                       <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3" /></svg>
                    </button>
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-grow space-y-3 px-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-slate-800 text-xl leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{book.title}</h3>
                  </div>
                  <p className="text-xs font-bold text-slate-400 italic truncate opacity-80">Muallif: {book.author}</p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-200/50">{book.category}</span>
                    <span className="text-[9px] font-black text-indigo-400 opacity-60">#{book.inventoryNumber?.slice(-4)}</span>
                  </div>
                </div>

                {/* Reservation Action */}
                <div className="mt-8 pt-6 border-t border-slate-50">
                  <button 
                    disabled={!book.isAvailable || reservingId === book.id}
                    onClick={() => handleReserve(book)}
                    style={{ pointerEvents: 'auto' }}
                    className={`w-full py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg ${
                      book.isAvailable 
                        ? 'bg-indigo-600 text-white hover:bg-black shadow-indigo-100' 
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {reservingId === book.id ? 'YUBORILMOQDA...' : (book.isAvailable ? 'Band qilish' : 'Xozir band')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-48 bg-white rounded-[5rem] border-4 border-dashed border-slate-50">
           <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-200">
             <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           <p className="text-slate-300 font-black italic tracking-tighter uppercase text-3xl">Resurs topilmadi</p>
           <button onClick={() => setSearchTerm('')} className="mt-8 text-indigo-600 font-black text-sm uppercase tracking-widest hover:underline decoration-2">Barcha kitoblarni ko'rish</button>
        </div>
      )}

      {/* Book Request Modal - Centered & Backdrop Locked */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-2xl animate-in fade-in duration-300" style={{ pointerEvents: 'auto' }}>
           <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in-95 duration-500 border border-white/20">
              <div className="p-10 sm:p-14">
                 <div className="flex justify-between items-start mb-14">
                    <div>
                       <div className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">Butlash bo'limi</div>
                       <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-tight">Yangi resurs <br/>so'rovi</h2>
                    </div>
                    <button onClick={() => setShowRequestModal(false)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
                 
                 <form onSubmit={handleBookRequest} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Kitob nomi</label>
                       <input required type="text" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-800 text-lg" value={requestForm.bookTitle} onChange={e => setRequestForm({...requestForm, bookTitle: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Muallif</label>
                          <input type="text" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-800" value={requestForm.author} onChange={e => setRequestForm({...requestForm, author: e.target.value})} />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Sizning telefoningiz</label>
                          <input required type="tel" className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] outline-none font-bold text-slate-800" value={requestForm.phone} onChange={e => setRequestForm({...requestForm, phone: e.target.value})} />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Sabab / Eslatma</label>
                       <textarea required rows={3} className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] outline-none font-medium text-slate-700 italic" value={requestForm.reason} onChange={e => setRequestForm({...requestForm, reason: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl hover:bg-black transition-all uppercase text-[11px] tracking-widest shadow-indigo-100">SO'ROVNI YUBORISH</button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* QR & Detail Modal */}
      {activeQR && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-3xl animate-in fade-in duration-300" style={{ pointerEvents: 'auto' }}>
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 border border-white/20 flex flex-col sm:flex-row overflow-hidden max-h-[90vh]">
            
            {/* QR Side */}
            <div className="sm:w-[45%] bg-indigo-600 p-12 flex flex-col items-center justify-center text-white text-center">
               <div className="bg-white p-6 rounded-[3rem] shadow-2xl mb-10 transform hover:scale-105 transition-transform duration-500">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ARM_BOOK_${activeQR.id}`} className="w-44 h-44 mix-blend-multiply" alt="QR" />
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-3">INV NUMBER</p>
               <h4 className="text-2xl font-black tracking-tighter">{activeQR.inventoryNumber || 'ARM-0000'}</h4>
            </div>

            {/* Info Side */}
            <div className="sm:w-[55%] p-10 sm:p-14 flex flex-col overflow-y-auto no-scrollbar">
               <div className="flex-grow">
                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full mb-6 inline-block">Ma'lumotlar</span>
                  <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter uppercase mb-2">{activeQR.title}</h3>
                  <p className="text-lg font-bold text-slate-400 italic mb-8">{activeQR.author}</p>
                  
                  <div className="h-1 w-12 bg-slate-100 mb-8 rounded-full"></div>

                  <div className="space-y-6">
                     <p className="text-slate-600 text-base leading-relaxed font-medium italic border-l-4 border-indigo-100 pl-6">
                        {activeQR.description || "Ushbu resurs haqida annotatsiya hali kiritilmagan. Bibliografik tahlil jarayonida."}
                     </p>
                     
                     <div className="flex flex-wrap gap-2 pt-6">
                        <span className="text-[9px] font-black bg-slate-50 text-slate-400 px-4 py-2 rounded-xl uppercase border border-slate-100">{activeQR.category}</span>
                        <span className={`text-[9px] font-black px-4 py-2 rounded-xl uppercase border ${activeQR.isAvailable ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {activeQR.isAvailable ? 'Fondda mavjud' : 'Hozirda band'}
                        </span>
                     </div>
                  </div>
               </div>

               <button 
                onClick={() => setActiveQR(null)} 
                className="mt-12 w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] hover:bg-indigo-600 transition-all uppercase text-[10px] tracking-widest active:scale-95 shadow-xl"
               >
                 Yopish
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
