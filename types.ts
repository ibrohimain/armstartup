export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  year: number;
  available: boolean;
  coverUrl: string;
  description: string;
  pdfUrl?: string;
  likes: number;
  views: number;
}

export interface Staff {
  name: string;
  role: string;
}

export interface Department {
  id: string;
  title: string;
  description: string;
  iconName: 'book' | 'users' | 'database' | 'monitor' | 'globe' | 'archive';
  head: string;
  staff: Staff[];
}

export interface Comment {
  id: number;
  targetId: number; // News ID or Book ID
  targetType: 'news' | 'book';
  username: string;
  text: string;
  date: string;
}

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  type: 'news' | 'video';
  likes: number;
  views: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
  name: string;
  faculty?: string; // For competition tracking
}

export interface LibraryStat {
  totalBooks: number;
  activeUsers: number;
  dailyVisits: number;
  ebookDownloads: number;
  totalStaff: number;
}

export interface FacultyStat {
  id: string;
  name: string;
  points: number; // Based on activity
  activeStudents: number;
  reads: number;
}
