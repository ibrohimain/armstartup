import React from 'react';
import { Mail, Phone, MapPin, Globe, GraduationCap, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 border-t-4 border-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center mb-6">
                <GraduationCap className="h-10 w-10 text-blue-400 mr-3" />
                <div>
                    <h3 className="text-2xl font-bold text-white tracking-tight">JizPI ARM</h3>
                    <p className="text-xs text-blue-400 uppercase tracking-widest">Future Library</p>
                </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Jizzax politexnika instituti Axborot-resurs markazi - zamonaviy texnologiyalar va boy ilmiy fond uyg'unligi. 2030-yilga kelib mintaqaning eng ilg'or raqamli kutubxonasiga aylanishni maqsad qilganmiz.
            </p>
            <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="w-5 h-5"/></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="w-5 h-5"/></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="w-5 h-5"/></a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Youtube className="w-5 h-5"/></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Tezkor Havolalar</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Bosh sahifa</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Elektron Katalog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Yangi kelgan adabiyotlar</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Video darsliklar</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Foydalanish qoidalari</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Biz bilan bog'lanish</h3>
            <ul className="space-y-4">
              <li className="flex items-start text-slate-400 text-sm">
                <MapPin className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                <span>Jizzax sh., Islom Karimov ko'chasi, 4-uy (Bosh bino, 1-qavat)</span>
              </li>
              <li className="flex items-center text-slate-400 text-sm">
                <Phone className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                <span>+998 72 226-46-05</span>
              </li>
              <li className="flex items-center text-slate-400 text-sm">
                <Mail className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                <span>info@jizpi.uz</span>
              </li>
              <li className="flex items-center text-slate-400 text-sm">
                <Globe className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                <span>www.jizpi.uz</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Ish tartibi</h3>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <ul className="space-y-3 text-slate-300 text-sm">
                <li className="flex justify-between border-b border-slate-700 pb-2">
                    <span>Dushanba - Juma</span>
                    <span className="font-bold text-white">08:30 - 18:00</span>
                </li>
                <li className="flex justify-between border-b border-slate-700 pb-2">
                    <span>Shanba</span>
                    <span className="font-bold text-white">08:30 - 14:00</span>
                </li>
                <li className="flex justify-between pt-1">
                    <span className="text-slate-500">Yakshanba</span>
                    <span className="text-red-400">Dam olish</span>
                </li>
                </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} JizPI Axborot-Resurs Markazi. Barcha huquqlar himoyalangan.</p>
          <p className="mt-2 md:mt-0 flex items-center">
              Created with <span className="text-red-500 mx-1">❤</span> for Future Education
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
