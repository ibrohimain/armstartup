
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
      await addDoc(collection(db, "bookings"), {
        bookId: book.id,
        bookTitle: book.title,
        studentName: "Talaba Namuna", 
        status: 'Kutilmoqda',
        createdAt: Date.now()
      });
      alert(`"${book.title}" uchun buyurtmangiz qabul qilindi. Tasdiqlanishini kuting.`);
    } catch (e) {
      console.error(e);
    } finally {
      setReservingId(null);
    }
  };

  const handleBookRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.phone.trim()) {
      alert("Iltimos, telefon raqamingizni kiriting!");
      return;
    }
    try {
      await addDoc(collection(db, "book_requests"), {
        bookTitle: requestForm.bookTitle,
        author: requestForm.author,
        reason: requestForm.reason,
        studentPhone: requestForm.phone,
        studentName: "Talaba Namuna", // Haqiqiy tizimda auth.currentUser dan olinadi
        status: 'Kutilmoqda',
        createdAt: Date.now()
      });
      alert("So'rovingiz qabul qilindi. Admin ko'rib chiqqach, siz bilan bog'lanadi.");
      setShowRequestModal(false);
      setRequestForm({ bookTitle: '', author: '', reason: '', phone: '' });
    } catch (e) {
      console.error(e);
      alert("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  };

  const filtered = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.includes(searchTerm)
  );

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto">
      {/* Header & Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></span>
            Smart Katalog 2.0
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Elektron Katalog</h1>
          <p className="text-slate-500 font-medium italic">ARM fondidagi barcha ilmiy va badiiy resurslar markazi.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <div className="relative flex-grow lg:min-w-[400px]">
            <input 
              type="text" 
              placeholder="Kitob nomi, muallif yoki ISBN qidirish..."
              className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-xl shadow-slate-200/50 font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <button 
            onClick={() => setShowRequestModal(true)}
            className="px-8 py-5 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl shadow-slate-300 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 whitespace-nowrap text-xs uppercase tracking-widest"
          >
            <div className="p-1 bg-white/10 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
            </div>
            Kitob so'rash
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-8 text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse">Ma'lumotlar yuklanmoqda...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
          {filtered.map(book => (
            <div key={book.id} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-6 hover:shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] hover:-translate-y-3 transition-all duration-500 group flex flex-col h-full relative overflow-hidden">
              <div className="aspect-[3.5/5] bg-slate-50 rounded-[2.5rem] mb-6 overflow-hidden relative border border-slate-50">
                <img 
                  src={DEFAULT_BOOK_COVER} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={book.title} 
                />
                <div className="absolute top-5 left-5">
                   <span className={`text-[9px] px-4 py-2 rounded-full font-black shadow-2xl uppercase tracking-widest backdrop-blur-md border border-white/20 ${book.isAvailable ? 'bg-emerald-500/90 text-white' : 'bg-rose-500/90 text-white'}`}>
                    {book.isAvailable ? 'Mavjud' : 'Band'}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-black text-slate-800 line-clamp-2 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                <p className="text-sm font-bold text-slate-400 italic truncate pb-4">{book.author}</p>
              </div>
              <div className="mt-auto pt-6 border-t border-slate-50 flex gap-2">
                <button 
                  disabled={!book.isAvailable || reservingId === book.id}
                  onClick={() => handleReserve(book)}
                  className={`flex-grow text-[10px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest ${
                    book.isAvailable ? 'bg-indigo-600 text-white hover:bg-black shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  {reservingId === book.id ? 'Band qilinmoqda...' : 'Band qilish'}
                </button>
                <button onClick={() => setActiveQR(book)} className="p-4 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
           <p className="text-slate-300 font-bold italic tracking-tight">Kitob topilmadi</p>
        </div>
      )}

      {/* Book Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 border border-white">
              <div className="p-12">
                 <div className="flex justify-between items-start mb-10">
                    <div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight">Yangi kitob so'rovi</h2>
                       <p className="text-sm text-slate-500 mt-1 italic">ARM fondida yo'q kitobni so'rash.</p>
                    </div>
                    <button onClick={() => setShowRequestModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                 </div>
                 
                 <form onSubmit={handleBookRequest} className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kitob nomi</label>
                       <input required type="text" className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-800" placeholder="Toza kod: Professional dasturlash" value={requestForm.bookTitle} onChange={e => setRequestForm({...requestForm, bookTitle: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Muallif</label>
                       <input type="text" className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-800" placeholder="Robert Martin" value={requestForm.author} onChange={e => setRequestForm({...requestForm, author: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefon raqamingiz (Bog'lanish uchun)</label>
                       <input required type="tel" className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-800" placeholder="+998 9x xxx xx xx" value={requestForm.phone} onChange={e => setRequestForm({...requestForm, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nega bu kitob kerak?</label>
                       <textarea required rows={4} className="w-full px-7 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-700" placeholder="Kurs ishim uchun manba sifatida zarur..." value={requestForm.reason} onChange={e => setRequestForm({...requestForm, reason: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl hover:bg-black transition-all uppercase text-[10px] tracking-widest">So'rovni yuborish</button>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* QR Info Modal */}
      {activeQR && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xl">
          <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-800 mb-2">{activeQR.title}</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{activeQR.author}</p>
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-10 shadow-inner">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ARM_BOOK_${activeQR.id}`} className="w-48 h-48 mx-auto" alt="QR" />
            </div>
            <button onClick={() => setActiveQR(null)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2.5rem] hover:bg-black transition-all uppercase text-[10px] tracking-widest">Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
