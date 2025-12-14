import React from 'react';
import { BookOpen, Users, Database, Monitor, Globe, UserCheck, Briefcase, Mail, Phone } from 'lucide-react';
import { Department } from '../types';

const departments: Department[] = [
  {
    id: 'dept1',
    title: "Ilmiy-uslubiy va axborot-ma’lumot (davriy nashrlar) bо‘limi",
    description: "Kutubxona faoliyatini tahlil qilish, metodik qo'llanmalar ishlab chiqish va davriy nashrlar fondini shakllantirish.",
    iconName: 'database',
    head: "Umirova Zulfiya Umarovna",
    staff: [
      { name: "Ishanqulova Shaxnoza Baxtiyorovna", role: "Uslubchi 1-toifa" },
      { name: "G‘ulomova Zarifa Shodikulovna", role: "Bibliograf 1-toifa" },
      { name: "Rasulova Ziyoda Norboevna", role: "Kutubxona 1-toifa" },
      { name: "Sattorova Mayram G‘iyosovna", role: "Kutubxona 1-toifa" },
      { name: "Xolikova Shaxnoza Sharipovna", role: "Kutubxona 1-toifa" },
      { name: "Xoliqulova Rita Xolmirzaevna", role: "Kutubxona 1-toifa" }
    ]
  },
  {
    id: 'dept2',
    title: "Axborot-kutubxona resurslarini butlash, kataloglashtirish va tizimlashtirish bо‘limi",
    description: "Yangi adabiyotlarni qabul qilish, ilmiy ishlov berish va elektron hamda an'anaviy kataloglarni yuritish.",
    iconName: 'archive',
    head: "Ortiqova Maloxat Tirkashevna",
    staff: [
      { name: "Tursunova Maloxat Jamolovna", role: "Axborot-kutubxona t..." },
      { name: "Kengasheva Mexri Sa’dullaevna", role: "Bibliograf 1-toifa" },
      { name: "Muqimova Sevara Erkinovna", role: "Kutubxona 1-toifa" },
      { name: "Urdusheva Sevara Pozilovna", role: "Kutubxona 1-toifa" },
      { name: "Mamadazizova Shaxnoza Baxrom qizi", role: "Kutubxona 1-toifa" }
    ]
  },
  {
    id: 'dept3',
    title: "Axborot-kutubxona resurslari bilan xizmat kо‘rsatish bо‘limi",
    description: "Abonementlar va o'quv zallarida professor-o'qituvchilar va talabalarga yuqori darajada xizmat ko'rsatish.",
    iconName: 'users',
    head: "Tursunova Fotima Xojimuratovna",
    staff: [
      { name: "Muhammadova Lobar Sobir qizi", role: "Bosh kutubxonachi" },
      { name: "Qosimova Zulfiya Ergashevna", role: "Bibliograf 1-toifa" },
      { name: "Urdusheva Xurshida Ravshan qizi", role: "Bibliograf 1-toifa" },
      { name: "Xakimova Gulchexra Yokubjonovna", role: "Bibliograf 1-toifa" },
      { name: "Mustafoeva Ruxsora Islomovna", role: "Kutubxona 1-toifa" },
      { name: "Usmanova Nigora Bazarovna", role: "Kutubxona 1-toifa" },
      { name: "Usmonova Musharraf Arzievna", role: "Kutubxona 1-toifa" },
      { name: "Toshpo‘latova Nodira Baxtiyorovna", role: "Kutubxona 1-toifa" },
      { name: "To‘raeva Gulchexra Ummatkulovna", role: "Kutubxona 1-toifa" }
    ]
  },
  {
    id: 'dept4',
    title: "Elektron axborot resurslar bo'limi",
    description: "Kutubxona fondini raqamlashtirish, elektron bazani boyitish va masofaviy xizmatlarni rivojlantirish.",
    iconName: 'monitor',
    head: "Abdillayev Ibroxim Nurulla o'g'li",
    staff: [
      { name: "Xazratkulova Visola Sag'dulla qizi", role: "Axborot-kutubxona t..." },
      { name: "Bobalieva Feruza Farxod qizi", role: "Elektron kutubxona..." }
    ]
  },
  {
    id: 'dept5',
    title: "Xorijiy axborot-kutubxona resurslari bilan ishlash bо‘limi",
    description: "Xorijiy ilmiy bazalar (Scopus, WoS) bilan ishlash va chet el adabiyotlarini targ'ib qilish.",
    iconName: 'globe',
    head: "Muzaffarova Malika Burxonovna",
    staff: [
      { name: "Tursunova Shaxnoza Turg‘unovna", role: "Bibliograf 1-toifa" },
      { name: "Ilhomova Dildora Ijod qizi", role: "Kutubxona 1-toifa" },
      { name: "Mordvinkin Vladislav Sergeevich", role: "Kutubxona 1-toifa" }
    ]
  }
];

const Departments: React.FC = () => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'database': return <Database className="h-6 w-6 text-white" />;
      case 'archive': return <Briefcase className="h-6 w-6 text-white" />;
      case 'users': return <Users className="h-6 w-6 text-white" />;
      case 'monitor': return <Monitor className="h-6 w-6 text-white" />;
      case 'globe': return <Globe className="h-6 w-6 text-white" />;
      default: return <BookOpen className="h-6 w-6 text-white" />;
    }
  };

  return (
    <div id="departments" className="py-20 bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeIn">
          <span className="text-blue-600 font-bold tracking-widest uppercase text-sm bg-blue-50 px-3 py-1 rounded-full">Tuzilma 2025</span>
          <h2 className="mt-3 text-4xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            ARM Tashkiliy Tuzilmasi
          </h2>
          <div className="mt-8 relative inline-block group">
             <div className="absolute inset-0 bg-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
             <div className="relative p-6 bg-white rounded-2xl border border-blue-100 shadow-xl max-w-2xl mx-auto">
                 <h3 className="text-xs uppercase font-bold text-gray-400 mb-2">Boshqaruv</h3>
                 <div className="flex items-center justify-center space-x-4">
                     <div className="h-16 w-16 rounded-full bg-gray-200 border-2 border-blue-500 overflow-hidden">
                         <img src="https://ui-avatars.com/api/?name=Ropieva+Muborak&background=2563eb&color=fff" alt="Director" />
                     </div>
                     <div className="text-left">
                         <h3 className="text-xl font-bold text-gray-900">Ropieva Muborak Abdug‘anievna</h3>
                         <p className="text-blue-600 font-medium">ARM Direktori</p>
                     </div>
                 </div>
             </div>
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept.id} className="flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-1 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-5">
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/30">
                    {getIcon(dept.iconName)}
                  </div>
                  <h3 className="ml-4 text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                    {dept.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  {dept.description}
                </p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-wider">Bo'lim Mudiri</p>
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                        {dept.head.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{dept.head}</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                   <div className="flex justify-between items-center mb-3">
                       <p className="text-[10px] text-gray-400 font-bold uppercase">Jamoa ({dept.staff.length})</p>
                   </div>
                   <div className="max-h-40 overflow-y-auto pr-2 scrollbar-thin">
                       <ul className="space-y-3">
                         {dept.staff.map((staff, idx) => (
                           <li key={idx} className="flex justify-between items-center text-sm group/item">
                             <div className="flex items-center">
                                 <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2 group-hover/item:bg-blue-500 transition-colors"></div>
                                 <span className="font-medium text-gray-600 group-hover/item:text-gray-900 transition-colors">{staff.name}</span>
                             </div>
                             <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap ml-2">{staff.role.split(' ')[0]}</span>
                           </li>
                         ))}
                       </ul>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Departments;
