
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
  const [showReport, setShowReport] = useState(false);

  const FINE_MULTIPLIER = 3; // Jarima koeffitsienti

  useEffect(() => {
    const unsubBooks = onSnapshot(query(collection(db, "books"), orderBy("createdAt", "desc")), (snapshot) => {
      setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book)));
      setLoading(false);
    });

    const unsubRequests = onSnapshot(query(collection(db, "book_requests"), orderBy("createdAt", "desc")), (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookRequest)));
    });

    return () => { unsubBooks(); unsubRequests(); };
  }, []);

  const updateBookStatus = async (bookId: string, status: BookStatus) => {
    try {
      const updateData: any = { 
        status,
        lastInventoried: Date.now() 
      };
      if (status === 'Yo\'qolgan') {
        updateData.lostDate = Date.now();
        updateData.isAvailable = false;
      }
      await updateDoc(doc(db, "books", bookId), updateData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInventoryCheck = async (bookId: string) => {
    try {
      await updateDoc(doc(db, "books", bookId), { 
        lastInventoried: Date.now() 
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRequest = async (id: string) => {
    if (confirm("Ushbu so'rovni o'chirmoqchimisiz?")) {
      await deleteDoc(doc(db, "book_requests", id));
    }
  };

  const stats = {
    total: books.length,
    lostCount: books.filter(b => b.status === 'Yo\'qolgan').length,
    totalValue: books.reduce((sum, b) => sum + (b.price || 0), 0),
    totalLoss: books.filter(b => b.status === 'Yo\'qolgan').reduce((sum, b) => sum + (b.price || 0), 0),
    categoryStats: books.reduce((acc: any, b) => {
      acc[b.category] = (acc[b.category] || 0) + 1;
      return acc;
    }, {})
  };

  const getQRUrl = (id: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ARM_BOOK_${id}`;

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.inventoryNumber && b.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lostBooks = books.filter(b => b.status === 'Yo\'qolgan');

  // PRINT & DOWNLOAD FUNKSIYASI
  const handlePrintReport = () => {
    // PDF fayl nomini chiroyli qilish uchun hujjat sarlavhasini vaqtincha o'zgartiramiz
    const originalTitle = document.title;
    const dateStr = new Date().toLocaleDateString('uz-UZ').replace(/\//g, '-');
    document.title = `ARM_Fond_Hisoboti_AKT_${dateStr}`;
    
    // Chop etish oynasini chaqiramiz (bu orqali PDF sifatida ham saqlash mumkin)
    window.print();
    
    // Bir ozdan so'ng sarlavhani qaytaramiz
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="p-8">
      {/* PROFESSIONAL PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm 15mm;
          }
          
          body * {
            visibility: hidden !important;
          }
          
          #report-document, #report-document * {
            visibility: visible !important;
          }
          
          #report-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background-color: white !important;
          }

          .no-print {
            display: none !important;
          }

          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-top: 20px;
          }
          
          th, td {
            border: 1pt solid #000 !important;
            padding: 8pt !important;
            font-size: 10pt !important;
          }
          
          .bg-slate-900 {
            background-color: #0f172a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Matnlarni pechatda qora rangda chiqarish */
          .text-slate-800, .text-slate-900 {
            color: black !important;
          }
          
          .text-rose-600 {
            color: #be123c !important;
          }

          .signatures-grid {
            margin-top: 50pt !important;
            display: grid !important;
            grid-template-cols: 1fr 1fr !important;
            gap: 40pt !important;
          }
        }
      `}</style>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Butlash va Kataloglash</h1>
          <p className="text-slate-500 font-medium italic">Fond monitoringi va moliyaviy hisobotlar bo'limi</p>
        </div>
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={() => setShowReport(true)}
             className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100 flex items-center gap-2"
           >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6-12V5a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6" /></svg>
              AKT yaratish
           </button>
           <div className="flex p-1.5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Smart Inventar</button>
              <button onClick={() => setActiveTab('lost')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'lost' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>Yo'qolganlar ({lostBooks.length})</button>
              <button onClick={() => setActiveTab('requests')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400'}`}>So'rovlar</button>
           </div>
        </div>
      </div>

      {/* Analytics Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fond qiymati</p>
           <p className="text-2xl font-black text-indigo-600">{stats.totalValue.toLocaleString()} UZS</p>
        </div>
        <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100 shadow-sm">
           <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Zarar</p>
           <p className="text-2xl font-black text-rose-600">{stats.totalLoss.toLocaleString()} UZS</p>
        </div>
        <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 shadow-sm">
           <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Jarimalar (x3)</p>
           <p className="text-2xl font-black text-amber-600">{(stats.totalLoss * FINE_MULTIPLIER).toLocaleString()} UZS</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-sm">
           <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Fond hajmi</p>
           <p className="text-2xl font-black">{stats.total} dona</p>
        </div>
      </div>

      {activeTab === 'inventory' && (
        <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/30">
               <h3 className="font-black text-xl text-slate-800 uppercase tracking-tight">Katalog Monitoringi</h3>
               <div className="relative w-full md:w-96">
                 <input 
                  type="text" 
                  placeholder="Inventar № yoki kitob nomi..." 
                  className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                 />
                 <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resurs / Inventar №</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tan narxi</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBooks.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-[10px] border border-indigo-100 shrink-0">
                             {book.inventoryNumber?.slice(-4) || 'N/A'}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{book.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{book.inventoryNumber} • {book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center font-black text-emerald-600 text-sm">
                        {book.price?.toLocaleString()} UZS
                      </td>
                      <td className="px-10 py-6 text-center">
                        <select 
                          value={book.status || 'Normal'}
                          onChange={(e) => book.id && updateBookStatus(book.id, e.target.value as BookStatus)}
                          className={`text-[9px] px-4 py-2 rounded-full font-black outline-none border-none cursor-pointer uppercase tracking-widest shadow-sm ${
                            book.status === 'Yo\'qolgan' ? 'bg-rose-100 text-rose-600' :
                            book.status === 'Ta\'mirda' ? 'bg-amber-100 text-amber-600' :
                            'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          <option value="Normal">Mavjud</option>
                          <option value="Ta'mirda">Ta'mirda</option>
                          <option value="Yo'qolgan">Yo'qolgan</option>
                        </select>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => setSelectedBook(book)}
                          className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3" /></svg>
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
        <div className="bg-white rounded-[3.5rem] border border-rose-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
           <div className="p-10 border-b border-rose-50 bg-rose-50/30 flex justify-between items-center">
              <h3 className="font-black text-2xl text-rose-800 uppercase tracking-tighter">Yo'qolgan kitoblar kartotekasi</h3>
              <div className="bg-rose-100 text-rose-600 px-6 py-3 rounded-2xl font-black">{lostBooks.length} dona</div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-rose-50/20">
                   <tr>
                      <th className="px-12 py-7 text-[10px] font-black text-rose-300 uppercase tracking-widest">Kitob / Inventar</th>
                      <th className="px-12 py-7 text-[10px] font-black text-rose-300 uppercase tracking-widest text-center">Tan narxi</th>
                      <th className="px-12 py-7 text-[10px] font-black text-rose-300 uppercase tracking-widest text-center">Jarima (x3)</th>
                      <th className="px-12 py-7 text-[10px] font-black text-rose-300 uppercase tracking-widest text-right">Harakat</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-rose-50">
                   {lostBooks.map(book => (
                     <tr key={book.id}>
                        <td className="px-12 py-8">
                           <p className="font-black text-slate-800">{book.title}</p>
                           <p className="text-xs text-rose-400">{book.inventoryNumber}</p>
                        </td>
                        <td className="px-12 py-8 text-center text-sm font-bold">{book.price?.toLocaleString()} UZS</td>
                        <td className="px-12 py-8 text-center">
                           <span className="bg-rose-100 text-rose-600 px-4 py-1.5 rounded-xl font-black">{(book.price * FINE_MULTIPLIER).toLocaleString()} UZS</span>
                        </td>
                        <td className="px-12 py-8 text-right">
                           <button onClick={() => book.id && updateBookStatus(book.id, 'Normal')} className="text-[10px] font-black text-indigo-600 hover:underline uppercase">Fondga qaytarish</button>
                        </td>
                     </tr>
                   ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Report Modal - Hozirgi chop etish va elektron yuklab olish oynasi */}
      {showReport && (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-xl flex items-center justify-center p-4">
           {/* Modal Container */}
           <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col">
              
              {/* Modal Header (No-print) */}
              <div className="no-print p-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                 <div>
                    <h2 className="text-xl font-black text-slate-800">Fond Hisoboti (AKT)</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Tayyor AKT ko'rinishi</p>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={handlePrintReport} 
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                       Elektron Yuklab olish / Chop etish
                    </button>
                    <button 
                      onClick={() => setShowReport(false)} 
                      className="bg-slate-100 text-slate-500 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all"
                    >
                       Yopish
                    </button>
                 </div>
              </div>

              {/* Document Body - Faqat shu blok pechatga chiqadi */}
              <div id="report-document" className="flex-grow overflow-y-auto p-12 md:p-16 bg-white">
                 <div className="max-w-3xl mx-auto border border-slate-100 p-8 md:p-12">
                    
                    {/* Official Document Header */}
                    <div className="text-center mb-12">
                       <h3 className="text-base font-bold uppercase tracking-[0.2em] text-slate-900 mb-1">Axborot-Resurs Markazi (ARM Hub)</h3>
                       <p className="text-xs font-bold uppercase text-slate-500">Butlash va kataloglashtirish bo'limi</p>
                       <div className="w-24 h-0.5 bg-slate-900 mx-auto mt-6"></div>
                    </div>

                    <div className="mb-10">
                       <div className="flex justify-between items-end mb-8 border-b-2 border-slate-900 pb-3">
                          <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Fond Inventarizatsiya AKTI</h2>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-slate-400 uppercase">Hujjat sanasi:</p>
                             <p className="text-xs font-black">{new Date().toLocaleDateString('uz-UZ')}</p>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-8 mb-10">
                          <div className="space-y-4">
                             <p className="text-xs leading-relaxed text-slate-700 italic">
                                "Ushbu AKT ARM fondidagi barcha mavjud va yo'qolgan resurslar bo'yicha moliyaviy hisobotni shakllantirish maqsadida tuzildi."
                             </p>
                             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Toifalar bo'yicha fond tarkibi:</p>
                                <div className="space-y-1.5">
                                   {Object.entries(stats.categoryStats).map(([cat, count]) => (
                                      <div key={cat} className="flex justify-between text-[10px] font-bold">
                                         <span className="text-slate-500">{cat}:</span>
                                         <span className="text-slate-900">{count as number} dona</span>
                                      </div>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg">
                             <h4 className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-5">Moliyaviy ko'rsatkichlar:</h4>
                             <div className="space-y-5">
                                <div className="flex justify-between border-b border-white/10 pb-3">
                                   <span className="text-[10px] opacity-70">Jami fond qiymati:</span>
                                   <span className="text-sm font-black">{stats.totalValue.toLocaleString()} UZS</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-3 text-rose-400">
                                   <span className="text-[10px] opacity-70">Zarar (Yo'qolgan):</span>
                                   <span className="text-sm font-black">-{stats.totalLoss.toLocaleString()} UZS</span>
                                </div>
                                <div className="flex justify-between pt-1">
                                   <span className="text-[10px] opacity-70">Mavjud fond balansi:</span>
                                   <span className="text-xl font-black text-emerald-400">{(stats.totalValue - stats.totalLoss).toLocaleString()} UZS</span>
                                </div>
                             </div>
                          </div>
                       </div>

                       <h4 className="text-xs font-black uppercase mb-5 border-l-4 border-slate-900 pl-4">Aniqlangan yo'qolgan resurslar va jarimalar</h4>
                       <table className="w-full text-left border-collapse border border-slate-200 mb-12">
                          <thead className="bg-slate-50">
                             <tr>
                                <th className="border border-slate-200 px-4 py-3 text-[9px] font-black uppercase">Inventar №</th>
                                <th className="border border-slate-200 px-4 py-3 text-[9px] font-black uppercase">Kitob nomi</th>
                                <th className="border border-slate-200 px-4 py-3 text-[9px] font-black uppercase text-center">Narxi</th>
                                <th className="border border-slate-200 px-4 py-3 text-[9px] font-black uppercase text-right">Jarima (x3)</th>
                             </tr>
                          </thead>
                          <tbody>
                             {lostBooks.length > 0 ? lostBooks.map(b => (
                               <tr key={b.id} className="text-[10px]">
                                  <td className="border border-slate-200 px-4 py-3 font-bold">{b.inventoryNumber}</td>
                                  <td className="border border-slate-200 px-4 py-3">{b.title}</td>
                                  <td className="border border-slate-200 px-4 py-3 text-center">{b.price?.toLocaleString()}</td>
                                  <td className="border border-slate-200 px-4 py-3 text-right font-black text-rose-600">{(b.price * FINE_MULTIPLIER).toLocaleString()}</td>
                               </tr>
                             )) : (
                               <tr><td colSpan={4} className="border border-slate-200 px-4 py-6 text-center text-[10px] italic text-slate-400">Zarar aniqlanmadi.</td></tr>
                             )}
                          </tbody>
                       </table>

                       {/* Signatures */}
                       <div className="signatures-grid grid grid-cols-2 gap-16 pt-12">
                          <div className="space-y-10">
                             <div className="border-b border-slate-900 pb-2 flex justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-800">Bo'lim mudiri:</span>
                                <span className="text-[10px] italic text-slate-300">__________</span>
                             </div>
                             <p className="text-[11px] font-black text-slate-900 tracking-tight">Jamshid Karimov</p>
                          </div>
                          <div className="space-y-10">
                             <div className="border-b border-slate-900 pb-2 flex justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-800">ARM Rahbari:</span>
                                <span className="text-[10px] italic text-slate-300">__________</span>
                             </div>
                             <p className="text-[11px] font-black text-slate-900 tracking-tight">Abduvohid Xidirov</p>
                          </div>
                       </div>
                    </div>

                    <div className="text-center text-[7px] text-slate-300 uppercase tracking-widest mt-16 border-t border-slate-50 pt-4">
                       Ushbu AKT ARM HUB raqamli tizimi orqali avtomatik ravishda shakllantirildi.
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* QR Modal (avvalgidek) */}
      {selectedBook && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xl">
            <div className="bg-white rounded-[4rem] p-12 max-w-md w-full text-center shadow-2xl relative">
              <button onClick={() => setSelectedBook(null)} className="absolute top-10 right-10 p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-rose-600 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h3 className="text-2xl font-black text-slate-800 mb-10 leading-tight">{selectedBook.title}</h3>
              <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 mb-10 inline-block shadow-inner">
                <img src={getQRUrl(selectedBook.id || '0')} alt="QR Code" className="w-48 h-48 mx-auto mix-blend-multiply" />
              </div>
              <button onClick={() => window.print()} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] uppercase text-xs tracking-widest hover:bg-black transition-all">
                 Yorliqni chop etish
              </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default SmartCatalog;
