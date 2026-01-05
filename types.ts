
export interface ChatMessage {
  id?: string;
  text: string;
  senderEmail: string;
  senderName: string;
  senderPosition: string;
  createdAt: number;
}

export interface Submission {
  id?: string;
  name: string;
  email: string;
  message: string;
  category: string;
  createdAt: number;
  aiSummary?: string;
}

export interface StaffProfile {
  name: string;
  email: string;
  position: string;
  department?: string;
  role: 'admin' | 'mudir' | 'xodim';
}

export type BookStatus = 'Normal' | 'Ta\'mirda' | 'Yo\'qolgan' | 'Yangi' | 'Hisobdan chiqilgan';

export interface Book {
  id?: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  inventoryNumber: string;
  price: number;
  description: string;
  isAvailable: boolean;
  coverUrl?: string;
  status?: BookStatus;
  location?: string;
  lastInventoried?: number;
  lostDate?: number;
  createdAt: number;
}

export interface ARMTask {
  id?: string;
  title: string;
  priority: 'Yuqori' | 'O\'rta' | 'Past';
  assignee: string;
  deadline: string;
  status: 'Kutilmoqda' | 'Bajarilmoqda' | 'Yakunlandi';
  createdAt?: number;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  CATALOG = 'CATALOG',
  DIGITAL_LIBRARY = 'DIGITAL_LIBRARY',
  EVENTS = 'EVENTS',
  FEEDBACK = 'FEEDBACK',
  MY_CABINET = 'MY_CABINET',
  ANALYTICS = 'ANALYTICS',
  SERVICE_DESK = 'SERVICE_DESK',
  SCIENTIFIC_ROADMAP = 'SCIENTIFIC_ROADMAP',
  ARM_TEAM = 'ARM_TEAM',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  ADMIN_BOOKS = 'ADMIN_BOOKS',
  ADMIN_EVENTS = 'ADMIN_EVENTS',
  ADMIN_ROADMAP = 'ADMIN_ROADMAP',
  ADMIN_BOOKINGS = 'ADMIN_BOOKINGS',
  ADMIN_MANUALS = 'ADMIN_MANUALS',
  ADMIN_CATALOGING = 'ADMIN_CATALOGING',
  ADMIN_ROOM_MANAGEMENT = 'ADMIN_ROOM_MANAGEMENT'
}

export interface ARMEvent {
  id?: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category: 'Yangilik' | 'Tadbir';
  imageUrl?: string;
  createdAt: number;
}

export interface Booking {
  id?: string;
  bookId: string;
  bookTitle: string;
  studentName: string;
  status: string;
  createdAt: number;
}

export type RoomType = 'reading' | 'electronic';

export interface ReadingRoomBooking {
  id?: string;
  seatId: number;
  roomType: RoomType;
  studentName: string;
  studentGroup: string;
  studentPhone: string;
  startTime: string;
  duration: string;
  createdAt: number;
}

export type MethodicalType = 'Darslik' | 'Qo\'llanma' | 'Ma\'ruza' | 'Avtoreferat' | 'EMB' | 'Ilmiy ish';

export interface MethodicalManual {
  id?: string;
  title: string;
  author: string;
  faculty: string;
  department: string;
  subject: string;
  year: number;
  type: MethodicalType;
  annotation: string;
  fileUrl?: string;
  fileSize?: string;
  likes?: number;
  createdAt: number;
}

export interface Periodical {
  id?: string;
  name: string;
  type: string;
  periodicity: string;
  lastIssue: string;
  status: 'Mavjud' | 'Kutilmoqda';
  staffTask?: string;
  responsibleStaff?: string;
  createdAt: number;
}

export interface BookRequest {
  id?: string;
  bookTitle: string;
  author: string;
  reason: string;
  studentName: string;
  studentPhone: string;
  status: string;
  createdAt: number;
}

export interface RoomNews {
  id?: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface DigitalResource {
  id?: string;
  title: string;
  author: string;
  type: 'Kitob' | 'Diplom' | 'Dissertatsiya' | 'Maqola';
  year: number;
  url?: string;
  pages: number;
  isProtected: boolean;
  annotation: string;
  likes?: number;
  createdAt: number;
}

export interface ScientificContent {
  id?: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'template' | 'check';
  category: 'Scopus' | 'WoS' | 'Methodology' | 'Ethics';
  url?: string;
  createdAt: number;
}

export interface RegulationDoc {
  id?: string;
  title: string;
  category: 'Nizom' | 'Yo\'riqnoma' | 'Ish rejasi' | 'Tavsiyanoma';
  status: 'Tasdiqlangan' | 'Jarayonda' | 'Yangi';
  author: string;
  createdAt: number;
}

export interface CulturalEvent {
  id?: string;
  title: string;
  type: 'Taqdimot' | 'Ko\'rgazma' | 'Davra suhbati' | 'Debat' | 'Savdo';
  date: string;
  responsible: string;
  monitoringStatus: 'Rejalashtirilgan' | 'Yakunlangan' | 'Bekor qilingan';
  createdAt: number;
}

export type ResourceType = 'Kitob' | 'Diplom' | 'Dissertatsiya' | 'Maqola';

export interface SeatMetadata {
  id: string;
  description: string;
  features: string[];
}

export interface Consultation {
  id?: string;
  teacherName: string;
  studentName?: string;
  studentPhone?: string;
  topic: string;
  date: string;
  time: string;
  type: string;
  status: 'Kutilmoqda' | 'Tasdiqlangan' | 'Rad etildi' | 'Yakunlandi';
  adminNotes?: string;
  createdAt: number;
}

export interface StaffDoc {
  id?: string;
  name: string;
  email: string;
  position: string;
  role: 'admin' | 'mudir' | 'xodim';
}

export interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'Pending';
  progress: number;
  icon: string;
  longText?: string;
}

export const ARM_STRUCTURE = {
  "Transport muhandisligi": ["Transport vositalari muhandisligi", "Avtomobilsozlik", "Logistika"],
  "Iqtisodiyot": ["Menejment", "Iqtisodiyot", "Buxgalteriya"],
  "IT": ["Dasturiy injiniring", "Sun'iy intellekt", "Kiberxavfsizlik"]
};
