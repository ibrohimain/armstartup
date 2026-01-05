
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { Book, BookStatus, BookRequest } from '../types';

const SmartCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'lost'>('inventory');
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAktModal, setShowAktModal] = useState(false);

  useEffect(() => {
    // Books Listener
    const unsubBooks = onSnapshot(query(collection(db, "books"), orderBy("createdAt", "desc")), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      setLoading(false);
    });

    // Requests Listener
    const unsubRequests = onSnapshot(query(collection(db, "book_requests"), orderBy("createdAt", "desc")), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookRequest)));
    });

    return () => { unsubBooks(); unsubRequests(); };
  }, []);

  // Moliyaviy va Toifaviy hisoblar
  const totalValue = books.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  const lostBooksList = books.filter(b => b.status === 'Yo\'qolgan');
  const totalLossValue = lostBooksList.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  const currentBalance = totalValue - totalLossValue;

  const categoryStats = books.reduce((acc: Record<string, number>, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});

  const updateBookStatus = async (bookId: string, status: BookStatus) => {
    try {
      await updateDoc(doc(db, "books", bookId), { 
        status,
        lastInventoried: Date.now(),
        isAvailable: status !== 'Yo\'qolgan' && status !== 'Hisobdan chiqilgan'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleReturnToFond = async (bookId: string) => {
    if (confirm("Ushbu kitob fondga qaytarildimi?")) {
      await updateBookStatus(bookId, 'Normal');
    }
  };

  const deleteRequest = async (id: string) => {
    if (confirm("Ushbu so'rovni o'chirmoqchimisiz?")) {
      await deleteDoc(doc(db, "book_requests", id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden animate-fade-in">
      {/* Top Header Section */}
      <div className="px-6 py-6 sm:px-10 shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Butlash va Kataloglash</h1>
            <p className="text-slate-500 font-medium italic opacity-80 text-sm">Fond monitoringi va moliyaviy hisobotlar bo'limi</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm">
             <button 
              onClick={() => setShowAktModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Akt Yaratish
             </button>
             
             <button onClick={() => setActiveTab('inventory')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>Smart Inventar</button>
             <button onClick={() => setActiveTab('lost')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lost' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>Yo'qolganlar ({lostBooksList.length})</button>
             <button onClick={() => setActiveTab('requests')} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>So'rovlar ({requests.length})</button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-grow overflow-y-auto px-6 sm:px-10 pb-20 no-scrollbar space-y-8">
        
        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px]">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fond Qiymati</span>
            <span className="text-2xl font-black text-indigo-600">{totalValue.toLocaleString()} UZS</span>
          </div>
          
          <div className="bg-rose-50/50 p-6 sm:p-8 rounded-[2rem] border border-rose-100 shadow-sm flex flex-col justify-between min-h-[140px]">
            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Zarar</span>
            <span className="text-2xl font-black text-rose-600">{totalLossValue.toLocaleString()} UZS</span>
          </div>

          <div className="bg-amber-50/50 p-6 sm:p-8 rounded-[2rem] border border-amber-100 shadow-sm flex flex-col justify-between min-h-[140px]">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Jarimalar (X3)</span>
            <span className="text-2xl font-black text-amber-600">{(totalLossValue * 3).toLocaleString()} UZS</span>
          </div>

          <div className="bg-[#1a2332] p-6 sm:p-8 rounded-[2rem] shadow-2xl flex flex-col justify-between min-h-[140px]">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fond Hajmi</span>
            <span className="text-2xl font-black text-white">{books.length} dona</span>
          </div>
        </div>

        {/* Tab-based View Sections */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Katalog Monitoringi</h3>
                 <div className="relative w-full max-w-sm">
                   <input 
                    type="text" 
                    placeholder="Inventar № yoki kitob nomi..." 
                    className="w-full pl-10 pr-5 py-3.5 bg-white border border-slate-200 rounded-full outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resurs / Inventar №</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tan Narxi</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.inventoryNumber?.includes(searchTerm)).map(book => (
                      <tr key={book.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-[9px]">{book.inventoryNumber?.slice(-4) || '3556'}</div>
                             <div>
                                <p className="font-black text-slate-800 text-sm">{book.title}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{book.inventoryNumber} • {book.author}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-emerald-600 text-sm">{(Number(book.price) || 0).toLocaleString()} UZS</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <select 
                            value={book.status || 'Normal'}
                            onChange={(e) => book.id && updateBookStatus(book.id, e.target.value as BookStatus)}
                            className={`text-[8px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest outline-none border-none cursor-pointer ${
                              book.status === 'Yo\'qolgan' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                            }`}
                          >
                            <option value="Normal">Mavjud</option>
                            <option value="Yo'qolgan">Yo'qolgan</option>
                            <option value="Ta'mirda">Ta'mirda</option>
                            <option value="Hisobdan chiqilgan">Hisobdan chiqish</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => setSelectedBook(book)} className="p-2.5 text-slate-300 hover:text-indigo-600 transition-colors">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {activeTab === 'lost' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5">
              <div className="p-8 border-b border-rose-50 bg-rose-50/10 flex justify-between items-center">
                 <h3 className="font-black text-xl text-rose-800 uppercase tracking-tighter">Yo'qolgan kitoblar kartotekasi</h3>
                 <span className="px-5 py-1.5 bg-rose-100 text-rose-600 rounded-full font-black text-[9px] uppercase tracking-widest">{lostBooksList.length} dona</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kitob / Inventar</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tan Narxi</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Jarima (X3)</th>
                      <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Harakat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {lostBooksList.map(book => (
                      <tr key={book.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-8 py-6">
                           <p className="font-black text-slate-800 text-sm">{book.title}</p>
                           <p className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">{book.inventoryNumber}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-slate-700 text-sm">{(Number(book.price) || 0).toLocaleString()} UZS</p>
                        </td>
                        <td className="px-8 py-6">
                           <div className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full font-black text-[9px]">{(Number(book.price) * 3).toLocaleString()} UZS</div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button onClick={() => book.id && handleReturnToFond(book.id)} className="text-[8px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Fondga qaytarish</button>
                        </td>
                      </tr>
                    ))}
                    {lostBooksList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-slate-300 italic text-sm">Yo'qolgan resurslar aniqlanmadi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-5">
              <div className="p-8 border-b border-indigo-50 bg-indigo-50/10 flex justify-between items-center">
                 <h3 className="font-black text-xl text-indigo-800 uppercase tracking-tighter">Kitob so'rovlari monitoringi</h3>
                 <span className="px-5 py-1.5 bg-indigo-100 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-widest">{requests.length} so'rov</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6 sm:p-8">
                {requests.map(req => (
                  <div key={req.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg></div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</span>
                     </div>
                     <h4 className="font-black text-slate-800 text-base mb-1.5 leading-tight group-hover:text-indigo-600 transition-colors">{req.bookTitle}</h4>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">{req.author}</p>
                     <div className="bg-white p-4 rounded-xl mb-6 border border-slate-100">
                        <p className="text-[11px] text-slate-600 font-medium italic">"{req.reason}"</p>
                     </div>
                     <div className="flex justify-between items-center">
                        <div>
                           <p className="text-[9px] font-black text-slate-300 uppercase">Talaba:</p>
                           <p className="text-[11px] font-bold text-slate-700">{req.studentName}</p>
                           <p className="text-[9px] font-black text-indigo-500 mt-0.5">{req.studentPhone}</p>
                        </div>
                        <button onClick={() => req.id && deleteRequest(req.id)} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
                     </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-300 italic text-sm">Yangi so'rovlar mavjud emas.</div>
                )}
              </div>
          </div>
        )}
      </div>

      {/* Fond Hisoboti (AKT) Modal - COMPACT & REFINED */}
      {showAktModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300 print:p-0 print:bg-white print:static">
           <div className="bg-white w-full max-w-4xl h-fit max-h-[90vh] overflow-y-auto no-scrollbar rounded-[3rem] shadow-2xl relative animate-in zoom-in-95 print:shadow-none print:w-full print:h-auto print:rounded-none">
              
              {/* Modal Header Actions (Not Printed) */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-6 sm:px-10 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden shrink-0">
                 <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Fond Hisoboti (AKT)</h2>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-0.5 text-center sm:text-left">Tayyor Akt Ko'rinishi</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100 active:scale-95"
                    >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                       Chop etish
                    </button>
                    <button onClick={() => setShowAktModal(false)} className="px-6 py-3 bg-slate-50 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all active:scale-95">
                       Yopish
                    </button>
                 </div>
              </div>

              {/* Document Paper Content - More proportional padding */}
              <div className="p-6 sm:p-10 print:p-0">
                 <div id="akt-document" className="bg-white p-8 sm:p-14 border border-slate-100 rounded-[2rem] print:border-none print:p-8 relative flex flex-col scale-[0.98] sm:scale-100 origin-top">
                    
                    {/* Official Letterhead */}
                    <div className="text-center mb-10 space-y-1">
                       <h3 className="text-xl font-black text-slate-900 tracking-widest uppercase">Axborot-Resurs Markazi (ARM HUB)</h3>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Butlash va kataloglashtirish bo'limi</p>
                       <div className="w-16 h-0.5 bg-slate-900 mx-auto mt-3"></div>
                    </div>

                    {/* Title & Date */}
                    <div className="flex justify-between items-end mb-10">
                       <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase border-b-2 border-slate-900 pb-1">Fond Inventarizatsiya Akti</h1>
                       <div className="text-right">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hujjat sanasi:</p>
                          <p className="text-sm font-black text-slate-900">{new Date().toISOString().split('T')[0]}</p>
                       </div>
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 font-medium italic text-xs leading-relaxed mb-10 max-w-sm">
                       "Ushbu AKT ARM fondidagi barcha mavjud va yo'qolgan resurslar bo'yicha moliyaviy hisobotni shakllantirish maqsadida tuzildi."
                    </p>

                    {/* Summary Section - More compact layout */}
                    <div className="flex flex-col md:flex-row gap-6 mb-10">
                       {/* Categories Stats */}
                       <div className="flex-grow bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Toifalar bo'yicha fond tarkibi:</h4>
                          <div className="space-y-2">
                             {Object.entries(categoryStats).map(([cat, count]) => (
                               <div key={cat} className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                                  <span className="text-xs font-bold text-slate-600">{cat}:</span>
                                  <span className="text-xs font-black text-slate-900">{count} dona</span>
                               </div>
                             ))}
                          </div>
                       </div>

                       {/* Financial Indicators Card - More compact */}
                       <div className="w-full md:w-[320px] bg-[#1a2332] p-8 rounded-[2rem] shadow-xl text-white">
                          <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-6">Moliyaviy Ko'rsatkichlar:</h4>
                          <div className="space-y-6">
                             <div className="flex justify-between items-end">
                                <span className="text-[11px] font-bold opacity-60">Jami fond qiymati:</span>
                                <span className="text-base font-black">{totalValue.toLocaleString()} UZS</span>
                             </div>
                             <div className="flex justify-between items-end">
                                <span className="text-[11px] font-bold opacity-60 text-rose-300">Zarar:</span>
                                <span className="text-base font-black text-rose-400">-{totalLossValue.toLocaleString()} UZS</span>
                             </div>
                             <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                <span className="text-[11px] font-bold opacity-60">Mavjud balans:</span>
                                <span className="text-2xl font-black text-emerald-400">{currentBalance.toLocaleString()} UZS</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Lost Items Table - Scaled down */}
                    <div className="flex-grow">
                       <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">
                          <div className="w-1 h-5 bg-slate-900"></div>
                          Aniqlangan yo'qolgan resurslar
                       </h4>
                       <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <table className="w-full text-left text-[10px]">
                             <thead className="bg-slate-50 font-black text-slate-400 uppercase">
                                <tr>
                                   <th className="px-6 py-4 border-b border-slate-100">№</th>
                                   <th className="px-6 py-4 border-b border-slate-100">Kitob Nomi</th>
                                   <th className="px-6 py-4 border-b border-slate-100">Narxi</th>
                                   <th className="px-6 py-4 border-b border-slate-100 text-right">Jarima</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {lostBooksList.map(b => (
                                  <tr key={b.id}>
                                     <td className="px-6 py-3 font-black text-slate-900">{b.inventoryNumber}</td>
                                     <td className="px-6 py-3 font-bold text-slate-600">{b.title}</td>
                                     <td className="px-6 py-3 font-black text-slate-900">{(Number(b.price) || 0).toLocaleString()}</td>
                                     <td className="px-6 py-3 font-black text-rose-600 text-right">{((Number(b.price) || 0) * 3).toLocaleString()}</td>
                                  </tr>
                                ))}
                                {lostBooksList.length === 0 && (
                                  <tr>
                                     <td colSpan={4} className="px-6 py-8 text-center text-slate-300 italic font-medium">Zarar aniqlanmadi.</td>
                                  </tr>
                                )}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {/* Signatures - More space-efficient */}
                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-start">
                       <div className="text-center">
                          <div className="w-32 border-b border-slate-400 mb-1.5"></div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bo'lim mudiri</p>
                       </div>
                       <div className="text-center">
                          <div className="w-32 border-b border-slate-400 mb-1.5"></div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mas'ul shaxs</p>
                       </div>
                       <div className="text-center opacity-30">
                          <div className="w-10 h-10 border-2 border-slate-200 rounded-full flex items-center justify-center text-[8px] font-black text-slate-200 uppercase rotate-[-20deg]">M.O'</div>
                          <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">Muhr</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Book QR Modal */}
      {selectedBook && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl print:hidden">
            <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 border border-white">
              <button onClick={() => setSelectedBook(null)} className="absolute top-8 right-8 p-3 bg-slate-100 rounded-2xl text-slate-400">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-2xl font-black text-slate-800 mb-8">{selectedBook.title}</h3>
              <div className="bg-slate-50 p-10 rounded-[3rem] mb-10">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ARM_BOOK_${selectedBook.id}`} alt="QR" className="w-48 h-48 mx-auto mix-blend-multiply" />
              </div>
              <button onClick={() => setSelectedBook(null)} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] uppercase text-[10px] tracking-widest">Yopish</button>
            </div>
         </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #akt-document, #akt-document * { visibility: visible; }
          #akt-document { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            border: none !important;
            padding: 0 !important;
            transform: scale(1) !important;
            min-height: 1123px;
          }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default SmartCatalog;
