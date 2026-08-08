import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { Quiz, ResourceType } from '../../types/quiz';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  Search,
  Star,
  Play,
  BookOpen,
  Edit,
  Copy,
  Trash2,
  Radio,
  PlusCircle,
  Clock,
  HelpCircle,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Plus,
} from 'lucide-react';

export const QuizLibraryPage: React.FC = () => {
  useDocumentTitle('My Library & Learning Resources — MEXO Quiz');
  const navigate = useNavigate();
  const { profile, user } = useAuth();

  const [activeTab, setActiveTab] = useState<ResourceType | 'all' | 'drafts' | 'favorites' | 'shared_with_me'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'popular' | 'rating' | 'alphabetical'>('updated');

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => quizService.getAllQuizzes());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const currentUserId = profile?.id || user?.id || 'guest';
  const currentUserName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : user?.email || 'MEXO User';

  // Load actual user-owned resources from Supabase on mount
  const loadSupabaseLibrary = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const fetched = await quizService.fetchQuizzesFromSupabase();
      setQuizzes(fetched);
    } catch (err) {
      setFetchError('Failed to load library resources from Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSupabaseLibrary();
  }, []);

  // Filter & Sort Logic based strictly on real user resources
  const myResources = useMemo(() => {
    return quizzes.filter(q => q.creator_id === currentUserId || q.creator_name === currentUserName);
  }, [quizzes, currentUserId, currentUserName]);

  // Shared resources created by others
  const sharedResources = useMemo(() => {
    return quizzes.filter(q => q.creator_id !== currentUserId && q.creator_name !== currentUserName && q.is_public);
  }, [quizzes, currentUserId, currentUserName]);

  // Compute counts for tab badges dynamically from real data
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: myResources.length,
      quiz: 0,
      assessment: 0,
      lesson: 0,
      flashcards: 0,
      interactive_video: 0,
      passage: 0,
      drafts: 0,
      favorites: 0,
      shared_with_me: sharedResources.length,
    };

    myResources.forEach(q => {
      const type = q.resource_type || 'quiz';
      if (counts[type] !== undefined) counts[type]++;
      if (q.settings?.status === 'draft') counts.drafts++;
      if ((q.rating_avg || 0) >= 4.8) counts.favorites++;
    });

    return counts;
  }, [myResources, sharedResources]);

  const filteredQuizzes = useMemo(() => {
    let list = activeTab === 'shared_with_me' ? [...sharedResources] : [...myResources];

    // Filter by Tab
    if (activeTab === 'drafts') {
      list = list.filter(q => q.settings?.status === 'draft');
    } else if (activeTab === 'favorites') {
      list = list.filter(q => (q.rating_avg || 0) >= 4.8);
    } else if (activeTab !== 'all' && activeTab !== 'shared_with_me') {
      list = list.filter(q => (q.resource_type || 'quiz') === activeTab);
    }

    // Filter by Search Query (Title, Description, Subject, Tags)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        item =>
          item.settings?.title?.toLowerCase().includes(q) ||
          item.settings?.description?.toLowerCase().includes(q) ||
          item.settings?.subject?.toLowerCase().includes(q) ||
          (item.settings?.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort List
    list.sort((a, b) => {
      if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'popular') {
        return (b.plays_count || 0) - (a.plays_count || 0);
      }
      if (sortBy === 'rating') {
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      }
      if (sortBy === 'alphabetical') {
        return (a.settings?.title || '').localeCompare(b.settings?.title || '');
      }
      // Default: updated
      return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
    });

    return list;
  }, [myResources, activeTab, searchQuery, sortBy]);

  // Handlers for Delete & Duplicate
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this learning resource?')) {
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
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 select-none box-border overflow-hidden">
      {/* 1. MOBILE-FIRST RESPONSIVE HERO BANNER */}
      <div className="w-full rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 box-border">
        {/* Hero Content (Centered on Mobile, Left-aligned on Desktop) */}
        <div className="w-full md:w-auto space-y-3 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>My Personal Library</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight break-words max-w-full">
            My Library & Activities
          </h1>

          <p className="text-xs sm:text-sm text-purple-100 max-w-xl leading-relaxed break-words">
            Access all your created quizzes, formal assessments, slide lessons, flashcards decks, and interactive learning resources in one unified MEXO place.
          </p>

          {/* Embedded Mobile Create Button */}
          <button
            onClick={() => navigate('/builder/new')}
            className="w-full max-w-[280px] md:hidden mt-2 py-3 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-[#7C3AED]" />
            <span>+ Create Resource</span>
          </button>
        </div>

        {/* Desktop Create Button */}
        <button
          onClick={() => navigate('/builder/new')}
          className="hidden md:flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white text-[#7C3AED] hover:bg-purple-50 font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#7C3AED]" />
          <span>+ Create Resource</span>
        </button>
      </div>

      {/* 2. SEARCH & CONTROLS SECTION */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm box-border">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Responsive Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search library resources by title, description, subject or tags..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:border-[#7C3AED] focus:bg-white transition-all outline-hidden box-border"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0 justify-end">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-hidden focus:border-[#7C3AED] cursor-pointer"
            >
              <option value="updated">Sort: Recently Updated</option>
              <option value="created">Sort: Recently Created</option>
              <option value="popular">Sort: Most Played</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* 3. FILTER CATEGORIES (STRICT HORIZONTAL SCROLL CHIP ROW ONLY) */}
        <div className="w-full flex items-center space-x-2 overflow-x-auto pb-1 max-w-full scrollbar-none touch-pan-x">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'shared_with_me', label: 'Shared with Me' },
            { id: 'quiz', label: 'Quizzes' },
            { id: 'assessment', label: 'Assessments' },
            { id: 'lesson', label: 'Lessons' },
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'interactive_video', label: 'Videos' },
            { id: 'passage', label: 'Passages' },
            { id: 'drafts', label: 'Drafts' },
            { id: 'favorites', label: 'Favorites' },
          ].map(tab => {
            const count = tabCounts[tab.id] || 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer shrink-0 flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. LOADING STATE (SKELETON CARDS) */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {[1, 2, 3].map(n => (
            <div
              key={n}
              className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 animate-pulse box-border"
            >
              <div className="w-full h-44 bg-slate-200 rounded-2xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* 5. ERROR STATE */}
      {fetchError && !isLoading && (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="text-sm font-extrabold text-rose-900">{fetchError}</h3>
          <button
            onClick={loadSupabaseLibrary}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* 6. EMPTY STATE */}
      {!isLoading && !fetchError && filteredQuizzes.length === 0 && (
        <div className="p-10 sm:p-14 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-4 box-border">
          <div className="w-14 h-14 rounded-3xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto shadow-xs">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">Your Library is Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              You haven't created any learning resources in this category yet.
            </p>
          </div>
          <button
            onClick={() => navigate('/builder/new')}
            className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Resource</span>
          </button>
        </div>
      )}

      {/* 7. LIBRARY CARDS GRID (MOBILE FIRST 1-COLUMN, TABLET 2-COLUMN, DESKTOP 3-COLUMN) */}
      {!isLoading && !fetchError && filteredQuizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full box-border">
          {filteredQuizzes.map(q => (
            <div
              key={q.id}
              onClick={() => navigate(`/library/${q.id}`)}
              className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group box-border"
            >
              <div>
                {/* Image & Overlay Badges */}
                <div className="h-44 sm:h-48 bg-slate-100 relative overflow-hidden w-full">
                  <img
                    src={
                      q.settings?.coverImageUrl ||
                      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'
                    }
                    alt={q.settings?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                    {q.resource_type || 'quiz'}
                  </div>
                  {q.settings?.subject && (
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                      {q.settings.subject}
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <div className="flex items-center space-x-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{q.rating_avg || 5.0}</span>
                      <span className="text-slate-400 font-normal">({q.rating_count || 1})</span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400">
                      {q.plays_count || 0} plays
                    </span>
                  </div>

                  {/* Title wrapping naturally */}
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-2 leading-snug break-words">
                    {q.settings?.title}
                  </h3>

                  {/* Description wrapping naturally */}
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed break-words">
                    {q.settings?.description || 'Interactive learning resource'}
                  </p>

                  {/* Real Metadata Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-[#7C3AED] text-[10px] font-bold">
                      {q.questions?.length || 0} Qs
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">
                      {q.settings?.quizDurationMinutes || 10}m
                    </span>
                    {q.settings?.grade && (
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {q.settings.grade}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs font-bold gap-2">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/builder/${q.id}`);
                    }}
                    title="Edit Resource"
                    className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-purple-600 hover:border-purple-200 cursor-pointer shadow-2xs transition-all flex items-center justify-center shrink-0"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={e => handleDuplicate(q.id, e)}
                    title="Duplicate Resource"
                    className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 cursor-pointer shadow-2xs transition-all flex items-center justify-center shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/host/${q.id}`);
                    }}
                    title="Start Live Session"
                    className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 cursor-pointer shadow-2xs transition-all flex items-center justify-center shrink-0"
                  >
                    <Radio className="w-4 h-4" />
                  </button>

                  <button
                    onClick={e => handleDelete(q.id, e)}
                    title="Delete Resource"
                    className="p-2 min-w-[38px] min-h-[38px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-rose-600 hover:border-rose-200 cursor-pointer shadow-2xs transition-all flex items-center justify-center shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[#7C3AED] font-extrabold text-xs flex items-center space-x-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span>Open</span>
                  <Play className="w-3.5 h-3.5 fill-[#7C3AED]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
