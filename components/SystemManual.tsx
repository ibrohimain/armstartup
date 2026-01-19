
import React from 'react';

const SystemManual: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 max-w-[1400px] mx-auto min-h-screen animate-fade-in">
      <div className="mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100 mb-6">
          <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
          Knowledge Base
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tighter uppercase mb-4">Tizim Yo'riqnomasi</h1>
        <p className="text-slate-500 font-medium italic text-lg opacity-80 max-w-3xl">ARM Hub platformasidan samarali foydalanish bo'yicha talabalar va xodimlar uchun qadam-baqadam qo'llanma.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Talabalar uchun yo'riqnoma */}
        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">TALABALAR UCHUN</div>
              <h2 className="text-3xl font-black text-slate-800 mb-8 uppercase tracking-tighter">Foydalanuvchi Imkoniyatlari</h2>
              
              <div className="space-y-8">
                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-black text-xl">01</div>
                    <div>
                       <h4 className="font-black text-slate-800 uppercase text-sm mb-2">Elektron Katalog</h4>
                       <p className="text-slate-500 text-sm leading-relaxed italic">Kitoblarni nomi, muallifi yoki inventar raqami bo'yicha qidiring. "Band qilish" tugmasi orqali kitobni o'zingiz uchun band qilib qo'yishingiz mumkin.</p>
                    </div>
                 </div>

                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-black text-xl">02</div>
                    <div>
                       <h4 className="font-black text-slate-800 uppercase text-sm mb-2">Navbatsiz ARM (Xizmatlar)</h4>
                       <p className="text-slate-500 text-sm leading-relaxed italic">O'quv zallaridagi bo'sh joylarni interaktiv xarita orqali ko'ring va stolingizni oldindan bron qiling. Bron muddati yakunlanganda joyingizni bo'shatishni unutmang.</p>
                    </div>
                 </div>

                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-black text-xl">03</div>
                    <div>
                       <h4 className="font-black text-slate-800 uppercase text-sm mb-2">Raqamli Kutubxona</h4>
                       <p className="text-slate-500 text-sm leading-relaxed italic">Diplom ishlari, maqolalar va elektron darsliklarni PDF formatida mutolaa qiling. Ko'p resurslar mualliflik huquqi bilan himoyalangan va faqat portal ichida o'qish mumkin.</p>
                    </div>
                 </div>

                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 font-black text-xl">04</div>
                    <div>
                       <h4 className="font-black text-slate-800 uppercase text-sm mb-2">Shaxsiy Kabinet</h4>
                       <p className="text-slate-500 text-sm leading-relaxed italic">Siz band qilgan kitoblar va joylar statusini "Mening Kabinetim" orqali kuzatib boring. Shuningdek, kutubxonadagi faolligingiz uchun ballaringiz yig'ilib boradi.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Admin/Xodimlar uchun yo'riqnoma */}
        <div className="space-y-8">
           <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group text-white">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white px-6 py-2 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">ADMINLAR UCHUN</div>
              <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">Boshqaruv Tizimi</h2>
              
              <div className="space-y-8">
                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-xl">A1</div>
                    <div>
                       <h4 className="font-black text-indigo-400 uppercase text-sm mb-2">Smart Fond Nazorati</h4>
                       <p className="text-slate-400 text-sm leading-relaxed italic">"Smart Katalog" bo'limida kitoblarni inventarizatsiya qiling. Yo'qolgan kitoblarni belgilang — tizim avtomatik ravishda 3 barobar jarima qiymatini hisoblaydi.</p>
                    </div>
                 </div>

                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-xl">A2</div>
                    <div>
                       <h4 className="font-black text-indigo-400 uppercase text-sm mb-2">Interaktiv Xona Boshqaruvi</h4>
                       <p className="text-slate-400 text-sm leading-relaxed italic">Admin panelda xonalar sxemasini tahrirlang. Joylar bandlik statusini boshqarish va asossiz bronlarni bekor qilish imkoniyati mavjud.</p>
                    </div>
                 </div>

                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-xl">A3</div>
                    <div>
                       <h4 className="font-black text-indigo-400 uppercase text-sm mb-2">Metodik Monitoring</h4>
                       <p className="text-slate-400 text-sm leading-relaxed italic">Hujjatlar bo'limida yangi nizomlar va ish rejalarini tasdiqlang. Har bir qo'shilgan hujjat avtomatik ravishda foydalanuvchi qismidagi "Metodika" bo'limida aks etadi.</p>
                    </div>
                 </div>

                 <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center shrink-0 font-black text-xl">A4</div>
                    <div>
                       <h4 className="font-black text-indigo-400 uppercase text-sm mb-2">KPI va Akt Yaratish</h4>
                       <p className="text-slate-400 text-sm leading-relaxed italic">Dashboard orqali jonli statistikani kuzating. Moliyaviy va fond hisobotlari (AKT) bir tugma orqali PDF shaklida chop etishga tayyorlanadi.</p>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100 flex items-center gap-6">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-xl shadow-indigo-100">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                 <h4 className="font-black text-indigo-900 uppercase text-sm">Savollar bormi?</h4>
                 <p className="text-indigo-700 text-xs font-medium italic mt-1">Yo'riqnomada javob topmasangiz, "Murojaat Yo'llash" bo'limi orqali admin bilan bog'laning.</p>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-20 py-10 border-t border-slate-100 text-center opacity-30">
        <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 italic">ARM Hub Knowledge System • 2024</p>
      </div>
    </div>
  );
};

export default SystemManual;
