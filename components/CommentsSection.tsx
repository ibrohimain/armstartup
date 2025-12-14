import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send, Trash2, User } from 'lucide-react';
import { Comment, User as UserType } from '../types';
import { storageService } from '../services/storageService';

interface CommentsProps {
  targetId: number;
  targetType: 'news' | 'book';
  currentUser: UserType | null;
  initialLikes?: number;
}

const CommentsSection: React.FC<CommentsProps> = ({ targetId, targetType, currentUser, initialLikes = 0 }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const loadComments = () => {
      setComments(storageService.getComments(targetId, targetType));
  };

  useEffect(() => {
    loadComments();
    window.addEventListener('storage_updated', loadComments);
    return () => window.removeEventListener('storage_updated', loadComments);
  }, [targetId, targetType]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      targetId,
      targetType,
      username: currentUser ? currentUser.name : 'Mehmon',
      text: newComment,
      date: new Date().toLocaleString('uz-UZ')
    };

    storageService.addComment(comment);
    setNewComment('');
  };

  const handleLike = () => {
      if (!liked) {
          storageService.toggleLike(targetId, targetType);
          setLikes(prev => prev + 1);
          setLiked(true);
      }
  };

  const handleDelete = (id: number) => {
      if (window.confirm("Izohni o'chirasizmi?")) {
          storageService.deleteComment(id);
      }
  };

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
              <button 
                onClick={handleLike}
                className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors`}
              >
                  <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                  <span className="font-bold">{likes}</span>
              </button>
              <div className="flex items-center space-x-1 text-gray-500">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-bold">{comments.length}</span>
              </div>
          </div>
          <span className="text-xs text-gray-400">Jamoatchilik fikri</span>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-4 max-h-60 overflow-y-auto scrollbar-thin pr-2">
          {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 p-3 rounded-xl relative group">
                  <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-2">
                              <User className="w-3 h-3" />
                          </div>
                          <span className="font-bold text-sm text-gray-800">{comment.username}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{comment.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 pl-8">{comment.text}</p>
                  
                  {currentUser?.role === 'admin' && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600"
                        title="O'chirish"
                      >
                          <Trash2 className="w-3 h-3" />
                      </button>
                  )}
              </div>
          ))}
          {comments.length === 0 && <p className="text-center text-gray-400 text-sm py-2">Hozircha izohlar yo'q. Birinchi bo'ling!</p>}
      </div>

      {/* Input */}
      <form onSubmit={handlePostComment} className="relative">
          <input 
            type="text" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Fikringizni qoldiring..."
            className="w-full bg-gray-100 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={!newComment.trim()}
            className="absolute right-1 top-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
              <Send className="w-4 h-4" />
          </button>
      </form>
    </div>
  );
};

export default CommentsSection;
