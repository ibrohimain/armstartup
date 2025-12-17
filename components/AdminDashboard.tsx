import React, { useState, useEffect } from 'react';
import { Book, Plus, Trash2, BarChart2, Video, FileText, CheckCircle, Users, Upload, RefreshCw, Search, MessageCircle, XCircle, Trophy, Save, Edit3, Image as ImageIcon } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Book as BookType, NewsItem, LibraryStat, Comment, FacultyStat } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'news' | 'comments' | 'competition'>('overview');
  const [books, setBooks] = useState<BookType[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<LibraryStat>(storageService.getStats());
  const [faculties, setFaculties] = useState<FacultyStat[]>([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Form States
  const [newBook, setNewBook] = useState<Partial<BookType>>({ category: 'Aniq fanlar', available: true });
  const [newNews, setNewNews] = useState<Partial<NewsItem>>({ type: 'news' });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  const refreshData = () => {
    setBooks(storageService.getBooks());
    setNews(storageService.getNews());
    setComments(storageService.getAllComments());
    setStats(storageService.getStats());
    setFaculties(storageService.getFacultyStats());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage_updated', refreshData);
    return () => window.removeEventListener('storage_updated', refreshData);
  }, []);

  // --- SMART IMAGE COMPRESSION ---
  // Katta rasmlarni avtomatik kichraytirib, baza hajmini tejaydi
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Rasmni maksimal eni 800px bo'ladi
          const scaleSize = MAX_WIDTH / img.width;
          
          if (scaleSize < 1) {
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
          } else {
              canvas.width = img.width;
              canvas.height = img.height;
          }
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Sifatni 70% ga tushirib, hajmni 10 barobar kamaytiradi (ko'zga bilinmaydi)
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isNews: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressing(true);
      try {
          const compressedBase64 = await compressImage(file);
          if (isNews) {
            setNewNews(prev => ({ ...prev, imageUrl: compressedBase64 }));
            setImagePreview(compressedBase64);
          } else {
            setNewBook(prev => ({ ...prev, coverUrl: compressedBase64 }));
            setImagePreview(compressedBase64);
          }
      } catch (err) {
          alert("Rasmni yuklashda xatolik bo'ldi.");
      } finally {
          setIsCompressing(false);
      }
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    
    const bookToAdd: BookType = {
        id: Date.now(),
        title: newBook.title!,
        author: newBook.author!,
        category: newBook.category || "Boshqa",
        year: newBook.year || new Date().getFullYear(),
        available: true,
        coverUrl: newBook.coverUrl || `https://picsum.photos/200/300?random=${Date.now()}`,
        description: newBook.description || "Tavsif yo'q",
        likes: 0,
        views: 0
    };

    const updatedBooks = [bookToAdd, ...books];
    setBooks(updatedBooks);
    storageService.saveBooks(updatedBooks);
    setNewBook({ category: 'Aniq fanlar', available: true });
    setImagePreview('');
    alert("Kitob muvaffaqiyatli qo'shildi!");
  };

  const handleDeleteBook = (id: number) => {
    if(window.confirm("DIQQAT! Bu kitob butunlay o'chiriladi. Davom etasizmi?")) {
        const updatedBooks = books.filter(b => b.id !== id);
        setBooks(updatedBooks);
        storageService.saveBooks(updatedBooks);
    }
  };

  const handleAddNews = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newNews.title || !newNews.summary) return;

      const newsToAdd: NewsItem = {
          id: Date.now(),
          title: newNews.title!,
          date: new Date().toISOString().split('T')[0],
          summary: newNews.summary!,
          type: newNews.type || 'news',
          imageUrl: newNews.imageUrl || "https://picsum.photos/800/400?random=news",
          videoUrl: newNews.videoUrl,
          likes: 0,
          views: 0
      };

      const updatedNews = [newsToAdd, ...news];
      setNews(updatedNews);
      storageService.saveNews(updatedNews);
      setNewNews({ type: 'news' });
      setImagePreview('');
      alert("Yangilik/Darslik qo'shildi!");
  }

  const handleDeleteNews = (id: number) => {
      if(window.confirm("Bu yangilikni o'chirishni tasdiqlang.")) {
        const updatedNews = news.filter(n => n.id !== id);
        setNews(updatedNews);
        storageService.saveNews(updatedNews);
      }
  }

  const handleDeleteComment = (id: number) => {
      if(window.confirm("Izohni o'chirasizmi?")) {
          storageService.deleteComment(id);
      }
  }

  // Competition Management
  const handleFacultyChange = (id: string, field: keyof FacultyStat, value: number) => {
      const updatedFaculties = faculties.map(f => 
          f.id === id ? { ...f, [field]: value } : f
      );
      setFaculties(updatedFaculties);
  };

  const saveCompetitionStats = () => {
      storageService.saveFacultyStats(faculties);
      alert("Reyting ma'lumotlari yangilandi!");
  };

  // Filter Logic
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredNews = news.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-yellow-400 tracking-tighter">ARM ADMIN</h2>
          <p className="text-slate-400 text-xs mt-1">Boshqaruv Tizimi v3.0</p>
        </div>
        <nav className="mt-6 space-y-1 px-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
            <BarChart2 className="w-5 h-5 mr-3" /> Statistika
          </button>
          <button onClick={() => setActiveTab('books')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'books' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Book className="w-5 h-5 mr-3" /> Kitoblar
          </button>
          <button onClick={() => setActiveTab('news')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Video className="w-5 h-5 mr-3" /> Yangiliklar
          </button>
          <button onClick={() => setActiveTab('comments')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'comments' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
            <MessageCircle className="w-5 h-5 mr-3" /> Izohlar Nazorati
          </button>
          <button onClick={() => setActiveTab('competition')} className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeTab === 'competition' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Trophy className="w-5 h-5 mr-3" /> Reyting Boshqaruvi
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-bold text-gray-800">Umumiy Holat</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-3xl font-extrabold text-blue-600">{stats.totalBooks}</h3><p className="text-gray-500">Kitoblar</p></div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-3xl font-extrabold text-green-600">{stats.dailyVisits}</h3><p className="text-gray-500">Bugungi Tashrif</p></div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-3xl font-extrabold text-yellow-600">{comments.length}</h3><p className="text-gray-500">Jami Izohlar</p></div>
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><h3 className="text-3xl font-extrabold text-purple-600">{faculties.length}</h3><p className="text-gray-500">Fakultetlar</p></div>
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div className="space-y-6 animate-fadeIn">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800">Kitoblar</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                    <input type="text" placeholder="Qidirish..." className="pl-10 pr-4 py-2 border rounded-full text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <h3 className="font-bold mb-4">Yangi kitob qo'shish</h3>
                 <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input placeholder="Nomi" required className="border p-2 rounded" value={newBook.title || ''} onChange={e => setNewBook({...newBook, title: e.target.value})} />
                     <input placeholder="Muallif" required className="border p-2 rounded" value={newBook.author || ''} onChange={e => setNewBook({...newBook, author: e.target.value})} />
                     <select className="border p-2 rounded" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
                         <option>Aniq fanlar</option>
                         <option>Axborot texnologiyalari</option>
                         <option>Muhandislik</option>
                         <option>Badiiy adabiyot</option>
                         <option>Xorijiy tillar</option>
                         <option>Boshqa</option>
                     </select>
                     <div className="flex items-center">
                         <label className={`cursor-pointer flex items-center px-4 py-2 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             <ImageIcon className="w-4 h-4 mr-2" />
                             {isCompressing ? 'Rasmni kichraytirish...' : 'Rasm Yuklash'}
                             <input type="file" disabled={isCompressing} onChange={(e) => handleImageUpload(e)} className="hidden" accept="image/*" />
                         </label>
                         {imagePreview && <img src={imagePreview} className="h-10 w-10 object-cover rounded ml-2 border"/>}
                     </div>
                     <textarea placeholder="Tavsif" className="border p-2 rounded md:col-span-2" value={newBook.description || ''} onChange={e => setNewBook({...newBook, description: e.target.value})} />
                     <button type="submit" disabled={isCompressing} className="bg-blue-600 text-white rounded p-2 md:col-span-2 hover:bg-blue-700 transition-colors">Qo'shish</button>
                 </form>
             </div>

             <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                 <table className="min-w-full divide-y divide-gray-200">
                     <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Kitob</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Statistika</th><th className="px-6 py-3 text-right">Amal</th></tr></thead>
                     <tbody className="bg-white divide-y divide-gray-200">
                         {filteredBooks.map(book => (
                             <tr key={book.id}>
                                 <td className="px-6 py-4 flex items-center">
                                     <img src={book.coverUrl} className="w-10 h-14 object-cover rounded mr-3 shadow-sm" alt="cover"/>
                                     <div>
                                         <div className="font-bold">{book.title}</div>
                                         <div className="text-xs text-gray-500">{book.author}</div>
                                     </div>
                                 </td>
                                 <td className="px-6 py-4"><span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Likes: {book.likes || 0}</span></td>
                                 <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteBook(book.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button></td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
          </div>
        )}

        {activeTab === 'news' && (
             <div className="space-y-6 animate-fadeIn">
                 <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800">Yangiliklar va Darsliklar</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400"/>
                        <input type="text" placeholder="Qidirish..." className="pl-10 pr-4 py-2 border rounded-full text-sm outline-none focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                 </div>

                 {/* News Input Form */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                     <h3 className="font-bold mb-4 text-blue-600">Yangi malumot chop etish</h3>
                     <form onSubmit={handleAddNews} className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <input 
                                placeholder="Sarlavha (Mavzu)" 
                                required 
                                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
                                value={newNews.title || ''} 
                                onChange={e => setNewNews({...newNews, title: e.target.value})} 
                             />
                             <select 
                                className="border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                value={newNews.type || 'news'}
                                onChange={e => setNewNews({...newNews, type: e.target.value as 'news' | 'video'})}
                             >
                                 <option value="news">Yangilik (Rasm bilan)</option>
                                 <option value="video">Video Dars (YouTube)</option>
                             </select>
                         </div>
                         
                         <textarea 
                             placeholder="Qisqacha mazmuni..." 
                             required 
                             className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50" 
                             rows={3}
                             value={newNews.summary || ''}
                             onChange={e => setNewNews({...newNews, summary: e.target.value})}
                         />

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                             {newNews.type === 'video' ? (
                                 <input 
                                    placeholder="YouTube Embed Link (masalan: https://www.youtube.com/embed/dQw4w9WgXcQ)" 
                                    className="border p-3 rounded-xl w-full bg-gray-50"
                                    value={newNews.videoUrl || ''}
                                    onChange={e => setNewNews({...newNews, videoUrl: e.target.value})}
                                 />
                             ) : (
                                 <div className="flex items-center space-x-2">
                                     <label className={`flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${isCompressing ? 'opacity-50' : ''}`}>
                                         <Upload className="w-4 h-4 mr-2" /> 
                                         {isCompressing ? 'Kichraytirilmoqda...' : 'Rasm Yuklash'}
                                         <input type="file" disabled={isCompressing} onChange={(e) => handleImageUpload(e, true)} className="hidden" accept="image/*" />
                                     </label>
                                     {imagePreview && (
                                         <div className="relative">
                                             <img src={imagePreview} alt="Preview" className="h-10 w-10 object-cover rounded-lg border" />
                                             <CheckCircle className="w-4 h-4 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
                                         </div>
                                     )}
                                 </div>
                             )}
                             <div className="flex justify-end">
                                  <button type="submit" disabled={isCompressing} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50">
                                     <Plus className="w-5 h-5 mr-2" /> Chop etish
                                  </button>
                             </div>
                         </div>
                     </form>
                 </div>

                 {/* List */}
                 <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                     <table className="min-w-full divide-y divide-gray-200">
                         <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Sarlavha</th><th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Turi</th><th className="px-6 py-3 text-right">Amal</th></tr></thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                             {filteredNews.map(item => (
                                 <tr key={item.id}>
                                     <td className="px-6 py-4 flex items-center">
                                         {item.type === 'news' && <img src={item.imageUrl} className="w-12 h-12 object-cover rounded-lg mr-3" alt="thumb"/>}
                                         <div>
                                            <div className="font-bold">{item.title}</div>
                                            <div className="text-xs text-gray-500">{item.date}</div>
                                         </div>
                                     </td>
                                     <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded font-bold ${item.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{item.type === 'video' ? 'VIDEO' : 'YANGILIK'}</span></td>
                                     <td className="px-6 py-4 text-right"><button onClick={() => handleDeleteNews(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 className="w-4 h-4"/></button></td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        )}

        {activeTab === 'comments' && (
            <div className="space-y-6 animate-fadeIn">
                <h2 className="text-2xl font-bold text-gray-800">Izohlar Nazorati</h2>
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {comments.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Hozircha izohlar mavjud emas.</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {comments.map(comment => (
                                <div key={comment.id} className="p-4 flex justify-between items-start hover:bg-gray-50">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="font-bold text-sm text-blue-600">{comment.username}</span>
                                            <span className="text-xs text-gray-400">{comment.date}</span>
                                            <span className="text-xs bg-gray-100 px-2 rounded border">{comment.targetType === 'book' ? 'Kitob ID:' : 'Yangilik ID:'} {comment.targetId}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{comment.text}</p>
                                    </div>
                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700 p-2"><XCircle className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'competition' && (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Fakultetlar Reytingi</h2>
                    <button onClick={saveCompetitionStats} className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                        <Save className="w-5 h-5 mr-2" /> Barchasini Saqlash
                    </button>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b font-bold text-gray-500 uppercase text-xs">
                        <div className="col-span-4">Fakultet Nomi</div>
                        <div className="col-span-3 text-center">Umumiy Ball</div>
                        <div className="col-span-2 text-center">O'qilgan Kitoblar</div>
                        <div className="col-span-3 text-center">Faol Talabalar</div>
                    </div>
                    {faculties.map((faculty) => (
                        <div key={faculty.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b hover:bg-gray-50 transition-colors">
                            <div className="col-span-4 font-bold text-gray-800">{faculty.name}</div>
                            <div className="col-span-3">
                                <input 
                                    type="number" 
                                    value={faculty.points} 
                                    onChange={(e) => handleFacultyChange(faculty.id, 'points', parseInt(e.target.value))}
                                    className="w-full text-center border rounded py-1 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <input 
                                    type="number" 
                                    value={faculty.reads} 
                                    onChange={(e) => handleFacultyChange(faculty.id, 'reads', parseInt(e.target.value))}
                                    className="w-full text-center border rounded py-1 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="col-span-3">
                                <input 
                                    type="number" 
                                    value={faculty.activeStudents} 
                                    onChange={(e) => handleFacultyChange(faculty.id, 'activeStudents', parseInt(e.target.value))}
                                    className="w-full text-center border rounded py-1 px-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 italic">* Eslatma: O'zgarishlarni kiritgandan so'ng, "Barchasini Saqlash" tugmasini bosing. Ma'lumotlar barcha foydalanuvchilar uchun darhol yangilanadi.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;