import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Departments from './components/Departments';
import BookSearch from './components/BookSearch';
import LibraryAssistant from './components/LibraryAssistant';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import NewsFeed from './components/NewsFeed';
import Competition from './components/Competition';
import { BookOpen, Coffee, Clock, Zap } from 'lucide-react';
import { User } from './types';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    storageService.trackVisit();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(loggedInUser.role === 'admin' ? 'admin' : 'home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <Hero 
                onSearchClick={() => setCurrentView('search')} 
                onDepartmentsClick={() => setCurrentView('departments')} 
            />
            
            {/* Modern Stats Section */}
            <div className="bg-white py-16 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.04] mask-image-b"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                 <div className="lg:text-center mb-16">
                    <h2 className="text-base text-blue-600 font-bold tracking-wide uppercase bg-blue-50 inline-block px-3 py-1 rounded-full">Statistika 2025</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      Raqamlar so'zlaganda
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                        Bizning kutubxona shunchaki kitoblar ombori emas, balki jonli bilimlar markazidir.
                    </p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                    <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                       <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                       </div>
                       <div className="text-5xl font-extrabold text-gray-900 mb-2">125K+</div>
                       <div className="text-gray-500 font-medium">Umumiy kitob fondi</div>
                    </div>
                    <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                       <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-3 hover:-rotate-6 transition-transform">
                            <Coffee className="h-8 w-8 text-green-600" />
                       </div>
                       <div className="text-5xl font-extrabold text-gray-900 mb-2">450</div>
                       <div className="text-gray-500 font-medium">O'quv zallari sig'imi</div>
                    </div>
                    <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-300">
                       <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-6 transition-transform">
                            <Zap className="h-8 w-8 text-purple-600" />
                       </div>
                       <div className="text-5xl font-extrabold text-gray-900 mb-2">24/7</div>
                       <div className="text-gray-500 font-medium">Elektron resurslar</div>
                    </div>
                 </div>
              </div>
            </div>
            
            <NewsFeed user={user}/>
          </>
        );
      case 'search':
        return <BookSearch user={user} />;
      case 'departments':
        return <Departments />;
      case 'competition':
        return <Competition />;
      case 'news':
        return <NewsFeed user={user} />;
      case 'services':
        return (
          <div className="max-w-7xl mx-auto px-4 py-16 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Bizning Xizmatlar</h1>
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-8 shadow-lg rounded-2xl border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
                 <h2 className="text-2xl font-bold mb-4 flex items-center"><BookOpen className="mr-3 text-blue-600"/> Kitob berish (Abonement)</h2>
                 <p className="text-gray-600 leading-relaxed">Talabalar va o'qituvchilar uchun uyga kitob berish xizmati. O'quv yili davomida darsliklar bilan ta'minlash. Shaxsiy kartochka orqali boshqaruv.</p>
               </div>
               <div className="bg-white p-8 shadow-lg rounded-2xl border-t-4 border-green-600 hover:shadow-xl transition-shadow">
                 <h2 className="text-2xl font-bold mb-4 flex items-center"><Coffee className="mr-3 text-green-600"/> O'quv zallari</h2>
                 <p className="text-gray-600 leading-relaxed">Sokin va qulay muhitda dars qilish imkoniyati. Wi-Fi va kompyuterlar bilan jihozlangan maxsus xonalar. Konditsionerlash tizimi.</p>
               </div>
               <div className="bg-white p-8 shadow-lg rounded-2xl border-t-4 border-yellow-600 hover:shadow-xl transition-shadow">
                 <h2 className="text-2xl font-bold mb-4 flex items-center"><Clock className="mr-3 text-yellow-600"/> Elektron kutubxona</h2>
                 <p className="text-gray-600 leading-relaxed">Masofadan turib QR-kod va maxsus platforma orqali elektron darsliklarni yuklab olish. Telegram bot orqali kitob buyurtma qilish.</p>
               </div>
               <div className="bg-white p-8 shadow-lg rounded-2xl border-t-4 border-purple-600 hover:shadow-xl transition-shadow">
                 <h2 className="text-2xl font-bold mb-4 flex items-center"><Zap className="mr-3 text-purple-600"/> Ma'lumotnoma xizmati</h2>
                 <p className="text-gray-600 leading-relaxed">Mavzuli so'rovlar bo'yicha adabiyotlar ro'yxatini shakllantirish va maslahatlar berish. UDK/BBK kodlarini aniqlashda yordam.</p>
               </div>
            </div>
          </div>
        );
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'admin':
        return user?.role === 'admin' ? <AdminDashboard /> : <Login onLogin={handleLogin} />;
      default:
        return (
            <Hero 
                onSearchClick={() => setCurrentView('search')} 
                onDepartmentsClick={() => setCurrentView('departments')} 
            />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar 
        onNavigate={setCurrentView} 
        currentView={currentView} 
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-grow animate-fadeIn">
        {renderContent()}
      </main>
      <LibraryAssistant />
      <Footer />
    </div>
  );
};

export default App;
