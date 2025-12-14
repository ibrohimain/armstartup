import React, { useState, useEffect } from 'react';
import { Search, Book, Filter, Download, X, MessageCircle } from 'lucide-react';
import { Book as BookType, User } from '../types';
import { storageService } from '../services/storageService';
import CommentsSection from './CommentsSection';

interface BookSearchProps {
    user?: User | null;
}

const BookSearch: React.FC<BookSearchProps> = ({ user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [allBooks, setAllBooks] = useState<BookType[]>([]);
  const [displayBooks, setDisplayBooks] = useState<BookType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedBook, setExpandedBook] = useState<number | null>(null);

  useEffect(() => {
    const loadBooks = () => {
        const books = storageService.getBooks();
        setAllBooks(books);
        // Only reset display books if filters were not active, or re-apply filters
        // For simplicity, we re-apply current filters to new data
        setDisplayBooks(filterLogic(books, searchTerm, selectedCategory));
        
        const cats = ['All', ...Array.from(new Set(books.map(b => b.category)))];
        setCategories(cats);
    };
    
    loadBooks();
    window.addEventListener('storage_updated', loadBooks);
    return () => window.removeEventListener('storage_updated', loadBooks);
  }, []); // Dependencies intentional kept empty to rely on event listener

  const filterLogic = (books: BookType[], term: string, category: string) => {
    let filtered = books;
    
    if (term) {
        const lowerTerm = term.toLowerCase();
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(lowerTerm) || 
          book.author.toLowerCase().includes(lowerTerm)
        );
    }

    if (category !== 'All') {
      filtered = filtered.filter(book => book.category === category);
    }
    return filtered;
  };

  // Effect to handle filtering when inputs change
  useEffect(() => {
      setDisplayBooks(filterLogic(allBooks, searchTerm, selectedCategory));
  }, [searchTerm, selectedCategory, allBooks]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Elektron Katalog</h2>
            <p className="text-gray-500">Institut fondidagi barcha o'quv va ilmiy adabiyotlarni qidiring</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-3xl mx-auto mb-8 flex items-center">
             <Search className="w-6 h-6 text-gray-400 ml-4" />
             <input 
                type="text" 
                className="w-full p-4 text-lg outline-none text-gray-700 bg-transparent"
                placeholder="Kitob nomi, muallif yoki yil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             {searchTerm && <button onClick={() => setSearchTerm('')} className="p-2 hover:text-red-500 transition-colors"><X className="w-5 h-5"/></button>}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                >
                    {cat === 'All' ? 'Barchasi' : cat}
                </button>
            ))}
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayBooks.map((book) => (
            <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
              <div className="h-56 overflow-hidden bg-gray-100 relative">
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm text-white ${book.available ? 'bg-green-500' : 'bg-red-500'}`}>
                    {book.available ? 'Mavjud' : 'Band'}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col">
                <div className="flex-grow">
                  <div className="text-xs font-bold text-blue-600 uppercase mb-2">{book.category}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{book.author} • {book.year}</p>
                  
                  {/* Expand for comments */}
                  {expandedBook === book.id ? (
                      <div className="animate-fadeIn">
                          <p className="text-xs text-gray-600 mb-4 bg-gray-50 p-2 rounded">{book.description}</p>
                          <CommentsSection targetId={book.id} targetType="book" currentUser={user || null} initialLikes={book.likes || 0} />
                          <button onClick={() => setExpandedBook(null)} className="w-full mt-2 text-center text-sm text-gray-400 hover:text-blue-500 py-2">Yopish</button>
                      </div>
                  ) : (
                      <div className="flex justify-between items-center mt-4 border-t pt-4">
                          <button onClick={() => setExpandedBook(book.id)} className="text-blue-600 font-bold text-sm flex items-center hover:bg-blue-50 px-3 py-1 rounded-lg transition">
                              <MessageCircle className="w-4 h-4 mr-1" /> Fikr bildirish
                          </button>
                          <button className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-600 hover:text-white transition shadow-sm"><Download className="w-4 h-4" /></button>
                      </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayBooks.length === 0 && (
            <div className="text-center py-20 text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>So'rovingiz bo'yicha kitob topilmadi.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BookSearch;
