
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { Book, BookStatus, BookRequest } from '../types';

const SmartCatalog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'requests' | 'lost'>('inventory');
  const [books, setBooks] = useState<Book[]>([]);
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAktModal, setShowAktModal] = useState(false);

  useEffect(() => {
    // Barcha kitoblarni kuzatish
    const unsubBooks = onSnapshot(query(collection(db, "books"), orderBy("createdAt", "desc")), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      setLoading(false);
    });

    // Talabalar so'rovlarini kuzatish (book_requests)
    const unsubRequests = onSnapshot(query(collection(db, "book_requests"), orderBy("createdAt", "desc")), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookRequest)));
    });

    return () => { unsubBooks(); unsubRequests(); };
  }, []);

  // Hisob-kitoblar
  const totalValue = books.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  const lostBooksList = books.filter(b => b.status === 'Yo\'qolgan');
  const totalLossValue = lostBooksList.reduce((acc, b) => acc + (Number(b.price) || 0), 0);
  
  const categoryStats = books.reduce((acc: Record<string, number>, b) => {
    acc[b.category] = (acc[b.category] || 0) + 1;
    return acc;
  }, {});

  // Kitob statusini yangilash
  const updateBookStatus = async (bookId: string, status: BookStatus) => {
    try {
      await updateDoc(doc(db, "books", bookId), { 
        status,
        lastInventoried: Date.now(),
        // Agar yo'qolgan yoki hisobdan chiqilgan bo'lsa mavjudlikni o'chiramiz
        isAvailable: status === 'Normal' || status === 'Yangi'
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Mavjudlikni qo'lda almashtirish (Mavjud / Band)
  const toggleAvailability = async (book: Book) => {
    if (!book.id) return;
    const newAvailable = !book.isAvailable;
    await updateDoc(doc(db, "books", book.id), { 
      isAvailable: newAvailable,
      // Agar band qilinsa statusni ham o'zgartiramiz
      status: newAvailable ? 'Normal' : 'Normal' 
    });
  };

  const deleteRequest = async (id: string) => {
    if (confirm("Ushbu so'rovni ro'yxatdan o'chirmoqchimisiz?")) {
      await deleteDoc(doc(db, "book_requests", id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.inventoryNumber?.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden animate-fade-in no-scrollbar">
      {/* Header Section */}
      <div className="px-6 py-8 sm:px-10 shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Smart Katalog Boshqaruvi</h1>
            <p className="text-slate-500 font-medium italic opacity-80 text-sm">Fond statusi va talabalar so'rovlari monitoringi</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <button 
              onClick={() => setShowAktModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               Akt Yaratish
             </button>
             
             <button onClick={() => setActiveTab('inventory')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>Inventar</button>
             <button onClick={() => setActiveTab('lost')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lost' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>Yo'qolganlar ({lostBooksList.length})</button>
             <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-indigo-600'}`}>So'rovlar ({requests.length})</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto px-6 sm:px-10 pb-20 no-scrollbar space-y-8">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fond Qiymati</span>
            <span className="text-2xl font-black text-indigo-600 mt-2">{totalValue.toLocaleString()} UZS</span>
          </div>
          
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Band Resurslar</span>
            <span className="text-2xl font-black text-amber-600 mt-2">{books.filter(b => !b.isAvailable).length} dona</span>
          </div>

          <div className="bg-rose-50/50 p-8 rounded-[3rem] border border-rose-100 shadow-sm flex flex-col justify-between">
            <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Yo'qolgan (Zarar)</span>
            <span className="text-2xl font-black text-rose-600 mt-2">{totalLossValue.toLocaleString()} UZS</span>
          </div>

          <div className="bg-[#1a2332] p-8 rounded-[3rem] shadow-2xl flex flex-col justify-between text-white">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jami Fond</span>
            <span className="text-2xl font-black mt-2">{books.length} ta kitob</span>
          </div>
        </div>

        {/* Tab Content Views */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Inventar Monitoringi</h3>
                 <div className="relative w-full max-w-sm">
                   <input 
                    type="text" 
                    placeholder="Izlash (Nomi yoki Inv №)..." 
                    className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-full outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Resurs / Inventar №</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tan Narxi</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Mavjudlik</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Holat (Status)</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredBooks.map(book => (
                      <tr key={book.id} className={`hover:bg-slate-50/50 transition-colors ${!book.isAvailable ? 'bg-amber-50/20' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-[10px]">{book.inventoryNumber?.slice(-4)}</div>
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
                           <button 
                            onClick={() => toggleAvailability(book)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                              book.isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                            }`}
                           >
                             {book.isAvailable ? 'MAVJUD' : 'BAND'}
                           </button>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <select 
                            value={book.status || 'Normal'}
                            onChange={(e) => book.id && updateBookStatus(book.id, e.target.value as BookStatus)}
                            className={`text-[8px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest outline-none border-none cursor-pointer ${
                              book.status === 'Yo\'qolgan' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <option value="Normal">Normal</option>
                            <option value="Yo'qolgan">Yo'qolgan</option>
                            <option value="Ta'mirda">Ta'mirda</option>
                            <option value="Hisobdan chiqilgan">Hisobdan chiqish</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button className="p-3 bg-slate-50 text-slate-300 hover:text-indigo-600 rounded-xl transition-all">
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
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-8 border-b border-rose-50 bg-rose-50/10 flex justify-between items-center">
                 <h3 className="font-black text-xl text-rose-800 uppercase tracking-tighter">Yo'qolgan Kitoblar Kartotekasi</h3>
                 <span className="px-5 py-2 bg-rose-100 text-rose-600 rounded-full font-black text-[9px] uppercase tracking-widest">{lostBooksList.length} dona</span>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Kitob / Inventar</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Narxi</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Jarima (X3)</th>
                      <th className="px-8 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amal</th>
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
                           <button onClick={() => book.id && updateBookStatus(book.id, 'Normal')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Fondga Qaytarish</button>
                        </td>
                      </tr>
                    ))}
                    {lostBooksList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-slate-300 italic text-sm">Yo'qolgan resurslar aniqlanmadi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in">
              <div className="p-8 border-b border-indigo-50 bg-indigo-50/10 flex justify-between items-center">
                 <h3 className="font-black text-xl text-indigo-800 uppercase tracking-tighter">Kitob So'rovlari (Fondni Boyitish)</h3>
                 <span className="px-5 py-2 bg-indigo-100 text-indigo-600 rounded-full font-black text-[9px] uppercase tracking-widest">{requests.length} yangi</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                {requests.map(req => (
                  <div key={req.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg></div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="font-black text-slate-800 text-lg mb-1 leading-tight">{req.bookTitle}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{req.author}</p>
                        <div className="bg-white p-5 rounded-2xl mb-8 border border-slate-100 shadow-inner">
                           <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"{req.reason}"</p>
                        </div>
                     </div>
                     <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                        <div>
                           <p className="text-[10px] font-black text-slate-300 uppercase">Talaba:</p>
                           <p className="text-sm font-bold text-slate-700">{req.studentName}</p>
                           <p className="text-xs font-black text-indigo-500 mt-1">{req.studentPhone}</p>
                        </div>
                        <button onClick={() => req.id && deleteRequest(req.id)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                     </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="col-span-full py-20 text-center text-slate-300 italic text-sm">Yangi kitob so'rovlari mavjud emas.</div>
                )}
              </div>
          </div>
        )}
      </div>

      {/* Akt Modal (Print View) */}
      {showAktModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl print:p-0 print:bg-white print:static">
           <div className="bg-white w-full max-w-4xl h-fit max-h-[90vh] overflow-y-auto no-scrollbar rounded-[3.5rem] shadow-2xl relative print:shadow-none print:w-full print:h-auto print:max-h-none print:rounded-none">
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md p-8 border-b border-slate-50 flex justify-between items-center print:hidden">
                 <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Fond Hisoboti (Akt)</h2>
                 <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                       Chop etish
                    </button>
                    <button onClick={() => setShowAktModal(false)} className="px-8 py-3 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                       Yopish
                    </button>
                 </div>
              </div>

              <div className="p-10 sm:p-14 print:p-4">
                 <div id="akt-document" className="bg-white p-10 border border-slate-100 rounded-[2.5rem] print:border-none print:p-0">
                    <div className="text-center mb-12">
                       <h3 className="text-xl font-black text-slate-900 tracking-[0.2em] uppercase">Axborot-Resurs Markazi (ARM HUB)</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Fond nazorati va butlash bo'limi</p>
                    </div>

                    <div className="flex justify-between items-end mb-12 border-b-4 border-slate-900 pb-4">
                       <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Inventarizatsiya Akti</h1>
                       <p className="text-sm font-black text-slate-900">{new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-12">
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Moliyaviy ko'rsatkich:</p>
                          <div className="space-y-2">
                             <div className="flex justify-between font-bold text-xs"><span>Jami qiymat:</span> <span>{totalValue.toLocaleString()} UZS</span></div>
                             <div className="flex justify-between font-bold text-xs text-rose-600"><span>Zarar (Yo'qolgan):</span> <span>-{totalLossValue.toLocaleString()} UZS</span></div>
                             <div className="border-t border-slate-200 mt-2 pt-2 flex justify-between font-black text-sm"><span>Balans:</span> <span>{(totalValue - totalLossValue).toLocaleString()} UZS</span></div>
                          </div>
                       </div>
                       <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-4">Fond tarkibi:</p>
                          <div className="space-y-2">
                             {Object.entries(categoryStats).map(([cat, count]) => (
                               <div key={cat} className="flex justify-between text-[10px] font-bold"><span>{cat}:</span> <span>{count} dona</span></div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 uppercase mb-4">Yo'qolgan resurslar ro'yxati:</h4>
                    <table className="w-full text-left text-[10px] mb-16">
                       <thead className="border-b-2 border-slate-900">
                          <tr>
                             <th className="py-2">Inventar №</th>
                             <th className="py-2">Kitob Nomi</th>
                             <th className="py-2">Tan Narxi</th>
                             <th className="py-2 text-right">Jarima (X3)</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {lostBooksList.map(b => (
                            <tr key={b.id}>
                               <td className="py-3 font-bold">{b.inventoryNumber}</td>
                               <td className="py-3">{b.title}</td>
                               <td className="py-3">{b.price.toLocaleString()}</td>
                               <td className="py-3 text-right font-black">{(b.price * 3).toLocaleString()} UZS</td>
                            </tr>
                          ))}
                       </tbody>
                    </table>

                    <div className="flex justify-between pt-12 border-t border-slate-100">
                       <div className="text-center">
                          <div className="w-32 border-b border-slate-400 mb-2"></div>
                          <p className="text-[8px] font-black uppercase text-slate-400">Direktor</p>
                       </div>
                       <div className="text-center">
                          <div className="w-32 border-b border-slate-400 mb-2"></div>
                          <p className="text-[8px] font-black uppercase text-slate-400">Mas'ul Shaxs</p>
                       </div>
                       <div className="text-center">
                          <div className="w-12 h-12 border-2 border-slate-200 rounded-full flex items-center justify-center text-[8px] text-slate-300 font-black mb-2 rotate-[-15deg]">M.O'</div>
                          <p className="text-[8px] font-black uppercase text-slate-400">Muhr</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SmartCatalog;
