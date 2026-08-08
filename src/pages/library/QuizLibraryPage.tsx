import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { Quiz, ResourceType } from '../../types/quiz';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Search,
  Filter,
  Star,
  Play,
  BookOpen,
  Layers,
  Edit,
  Copy,
  Share2,
  Trash2,
  Radio,
  FileText,
  PlusCircle,
  Video,
} from 'lucide-react';

export const QuizLibraryPage: React.FC = () => {
  useDocumentTitle('My Library & Learning Resources — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [activeTab, setActiveTab] = useState<ResourceType | 'all' | 'drafts' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => quizService.getAllQuizzes());

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'MEXO User';

  const filteredQuizzes = useMemo(() => {
    let list = quizzes;

    if (activeTab === 'drafts') {
      list = list.filter(q => q.settings.status === 'draft');
    } else if (activeTab === 'favorites') {
      list = list.filter(q => q.rating_avg >= 4.9);
    } else if (activeTab !== 'all') {
      list = list.filter(q => q.resource_type === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item =>
        item.settings.title.toLowerCase().includes(q) ||
        item.settings.description.toLowerCase().includes(q) ||
        (item.settings.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [quizzes, activeTab, searchQuery]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this learning resource?')) {
      quizService.deleteQuiz(id);
      setQuizzes(quizService.getAllQuizzes());
    }
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy = quizService.duplicateQuiz(id, currentUserName, currentUserId);
    if (copy) {
      setQuizzes(quizService.getAllQuizzes());
      navigate(`/builder/${copy.id}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>My Personal Library</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">My Library & Activities</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Access all your created quizzes, formal assessments, slide lessons, flashcards decks, and saved public activities in one unified place.
          </p>
        </div>

        <button
          onClick={() => navigate('/builder/new')}
          className="px-5 py-2.5 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#7C3AED]" />
          <span>+ Create New</span>
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        {/* Search */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search your library items by title or subject..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-[#7C3AED] outline-hidden"
          />
        </div>

        {/* Library Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'assessment', label: 'Assessments' },
            { id: 'lesson', label: 'Lessons' },
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'interactive_video', label: 'Videos' },
            { id: 'passage', label: 'Passages' },
            { id: 'drafts', label: 'Drafts' },
            { id: 'favorites', label: 'Favorites' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quizzes & Resource Grid */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No items found in this library category</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Create a new activity or explore public resources in Discover to add items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredQuizzes.map(q => (
              <div
                key={q.id}
                onClick={() => navigate(`/quiz/${q.id}`)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                    <img
                      src={q.settings.coverImageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'}
                      alt={q.settings.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                      {q.resource_type || 'quiz'}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{q.rating_avg}</span>
                      <span className="text-slate-400 font-normal">({q.rating_count}) • {q.plays_count} plays</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-2">
                      {q.settings.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {q.settings.description}
                    </p>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/builder/${q.id}`);
                      }}
                      title="Edit Resource"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-purple-600 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => handleDuplicate(q.id, e)}
                      title="Duplicate Resource"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/host/${q.id}`);
                      }}
                      title="Start Live Session"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-rose-600 cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => handleDelete(q.id, e)}
                      title="Delete Resource"
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[#7C3AED] flex items-center space-x-1">
                    <span>Open</span>
                    <Play className="w-3.5 h-3.5 fill-[#7C3AED]" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

