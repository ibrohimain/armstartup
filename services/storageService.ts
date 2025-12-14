import { Book, NewsItem, LibraryStat, Comment, FacultyStat } from '../types';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIGURATION ---
// 1. https://supabase.com saytiga kiring va "New Project" oching (Bepul).
// 2. Settings -> API bo'limidan URL va ANON KEY ni oling.
// 3. Quyidagi ikkita o'zgaruvchiga qo'ying.
const SUPABASE_URL = 'https://zgwbypxwxiedfcxsaqzt.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnd2J5cHh3eGllZGZjeHNhcXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MjE3MjgsImV4cCI6MjA4MTI5NzcyOH0.1VgtV1nocrPoD4JqE6WrWNmDe-fJABMy0JHB7_xJ9H4';

// --- INITIAL DATA (Fallback) ---
const INITIAL_BOOKS: Book[] = [
  { id: 1, title: "Muhandislik matematikasi", author: "Abdullayev A.", category: "Aniq fanlar", year: 2022, available: true, coverUrl: "https://picsum.photos/200/300?random=1", description: "Oliy matematika bo'yicha darslik.", likes: 12, views: 150 },
  { id: 2, title: "Python dasturlash tili", author: "Tursunov B.", category: "Axborot texnologiyalari", year: 2023, available: true, coverUrl: "https://picsum.photos/200/300?random=2", description: "Dasturlash asoslari.", likes: 45, views: 320 },
];

const INITIAL_NEWS: NewsItem[] = [
  { id: 1, title: "Yangi kitoblar ko'rgazmasi", date: "2023-10-15", summary: "Kutubxonamizga 500 dan ortiq yangi ilmiy adabiyotlar keltirildi.", type: 'news', imageUrl: "https://picsum.photos/800/400?random=10", likes: 24, views: 110 }
];

const INITIAL_FACULTIES: FacultyStat[] = [
  { id: 'f1', name: "Energetika va Radioelektronika", points: 1250, activeStudents: 450, reads: 3200 },
  { id: 'f2', name: "Sanoat texnologiyalari", points: 980, activeStudents: 320, reads: 2100 },
  { id: 'f3', name: "Arxitektura va Qurilish", points: 1450, activeStudents: 510, reads: 4500 },
  { id: 'f4', name: "Transport", points: 890, activeStudents: 280, reads: 1800 },
  { id: 'f5', name: "Kiberxavfsizlik va IT", points: 1600, activeStudents: 580, reads: 5200 },
];

// Initialize Supabase Client
let supabase: any = null;
let isConnected = false;

if (SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
    console.warn("SUPABASE NOT CONFIGURED: Using LocalStorage. Realtime features disabled.");
} else {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        isConnected = true;
    } catch (e) {
        console.error("Supabase init error", e);
    }
}

// Local Cache (Immediate UI updates)
let cache = {
    books: INITIAL_BOOKS,
    news: INITIAL_NEWS,
    comments: [] as Comment[],
    stats: { totalBooks: 125400, activeUsers: 4500, dailyVisits: 320, ebookDownloads: 1500, totalStaff: 30 },
    facultyStats: INITIAL_FACULTIES
};

// --- REALTIME SYNC LOGIC ---
const syncData = async () => {
    if (!isConnected) return;

    // Fetch initial data
    const { data: books } = await supabase.from('books').select('*');
    if (books && books.length > 0) cache.books = books;

    const { data: news } = await supabase.from('news').select('*');
    if (news && news.length > 0) cache.news = news;

    const { data: comments } = await supabase.from('comments').select('*');
    if (comments) cache.comments = comments;
    
    const { data: faculties } = await supabase.from('faculty_stats').select('*');
    if (faculties && faculties.length > 0) cache.facultyStats = faculties;

    // Notify UI
    window.dispatchEvent(new Event('storage_updated'));

    // Subscribe to changes (REAL-TIME MAGIC)
    const channels = supabase.channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, (payload: any) => {
        handleRealtimeUpdate('books', payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, (payload: any) => {
        handleRealtimeUpdate('news', payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload: any) => {
        handleRealtimeUpdate('comments', payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'faculty_stats' }, (payload: any) => {
        handleRealtimeUpdate('facultyStats', payload);
    })
    .subscribe();
};

const handleRealtimeUpdate = (table: string, payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // @ts-ignore
    let currentList = cache[table] as any[];
    
    if (eventType === 'INSERT') {
        // @ts-ignore
        cache[table] = [...currentList, newRecord];
    } else if (eventType === 'UPDATE') {
        // @ts-ignore
        cache[table] = currentList.map(item => item.id === newRecord.id ? newRecord : item);
    } else if (eventType === 'DELETE') {
        // @ts-ignore
        cache[table] = currentList.filter(item => item.id !== oldRecord.id);
    }
    window.dispatchEvent(new Event('storage_updated'));
};

// Start Sync
if (isConnected) {
    syncData();
} else {
    // Load from LocalStorage if no Supabase
    try {
        const b = localStorage.getItem('jizpi_books'); if(b) cache.books = JSON.parse(b);
        const n = localStorage.getItem('jizpi_news'); if(n) cache.news = JSON.parse(n);
        const c = localStorage.getItem('jizpi_comments'); if(c) cache.comments = JSON.parse(c);
        const f = localStorage.getItem('jizpi_faculties'); if(f) cache.facultyStats = JSON.parse(f);
    } catch(e) {}
}

const notifyUpdates = () => {
    window.dispatchEvent(new Event('storage_updated'));
};

export const storageService = {
  // Books
  getBooks: (): Book[] => cache.books,
  saveBooks: async (books: Book[]) => {
    cache.books = books;
    notifyUpdates();
    if (isConnected) {
        // Full replace strategy is hard in SQL, so we just upsert the new ones for this demo
        // In production, you'd handle deletes separately
        for (const book of books) {
             await supabase.from('books').upsert(book);
        }
    } else {
        localStorage.setItem('jizpi_books', JSON.stringify(books));
    }
  },

  // News
  getNews: (): NewsItem[] => cache.news,
  saveNews: async (news: NewsItem[]) => {
    cache.news = news;
    notifyUpdates();
    if (isConnected) {
         for (const item of news) {
             await supabase.from('news').upsert(item);
        }
    } else {
        localStorage.setItem('jizpi_news', JSON.stringify(news));
    }
  },

  // Comments
  getComments: (targetId: number, targetType: 'news' | 'book'): Comment[] => {
    return cache.comments.filter(c => c.targetId === targetId && c.targetType === targetType);
  },
  getAllComments: (): Comment[] => cache.comments,
  addComment: async (comment: Comment) => {
    cache.comments.push(comment);
    notifyUpdates();
    if (isConnected) {
        await supabase.from('comments').insert(comment);
    } else {
        localStorage.setItem('jizpi_comments', JSON.stringify(cache.comments));
    }
  },
  deleteComment: async (id: number) => {
     cache.comments = cache.comments.filter(c => c.id !== id);
     notifyUpdates();
     if(isConnected) {
         await supabase.from('comments').delete().eq('id', id);
     } else {
         localStorage.setItem('jizpi_comments', JSON.stringify(cache.comments));
     }
  },

  // Interactions
  toggleLike: async (id: number, type: 'news' | 'book') => {
    if (type === 'book') {
        const book = cache.books.find(b => b.id === id);
        if (book) {
            const newLikes = (book.likes || 0) + 1;
            book.likes = newLikes;
            notifyUpdates();
            if(isConnected) await supabase.from('books').update({ likes: newLikes }).eq('id', id);
        }
    } else {
        const item = cache.news.find(n => n.id === id);
        if (item) {
            const newLikes = (item.likes || 0) + 1;
            item.likes = newLikes;
            notifyUpdates();
            if(isConnected) await supabase.from('news').update({ likes: newLikes }).eq('id', id);
        }
    }
  },

  // Stats
  trackVisit: () => {
    cache.stats.dailyVisits += 1;
    // Stats sync is optional/complex for free tier realtime, let's keep it local for speed or simple update
  },
  getStats: (): LibraryStat => cache.stats,
  
  getFacultyStats: (): FacultyStat[] => cache.facultyStats,
  saveFacultyStats: async (stats: FacultyStat[]) => {
      cache.facultyStats = stats;
      notifyUpdates();
      if(isConnected) {
          for (const stat of stats) {
              await supabase.from('faculty_stats').upsert(stat);
          }
      } else {
          localStorage.setItem('jizpi_faculties', JSON.stringify(stats));
      }
  }
};
