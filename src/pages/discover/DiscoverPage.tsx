import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Search,
  Filter,
  Star,
  Play,
  Copy,
  Radio,
  FileText,
  BookOpen,
  Layers,
  Video,
  Sparkles,
  Share2,
} from 'lucide-react';
import { quizService } from '../../services/quizService';
import { ResourceType, Quiz } from '../../types/quiz';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const DiscoverPage: React.FC = () => {
  useDocumentTitle('MEXO Discover — Explore Public Learning Resources');
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');

  const allQuizzes = useMemo(() => quizService.getAllQuizzes(), []);

  // Filter public resources only! Private resources MUST NEVER appear publicly.
  const publicResources = useMemo(() => {
    return allQuizzes.filter(q => q.is_public && q.settings.visibility !== 'private');
  }, [allQuizzes]);

  const filteredResources = useMemo(() => {
    return quizService.searchQuizzes({
      query: searchQuery,
      type: selectedType,
      subject: selectedSubject,
      difficulty: selectedDifficulty,
      grade: selectedGrade,
      sortBy,
    }).filter(q => q.is_public && q.settings.visibility !== 'private');
  }, [searchQuery, selectedType, selectedSubject, selectedDifficulty, selectedGrade, sortBy]);

  const handleDuplicate = (e: React.MouseEvent, q: Quiz) => {
    e.stopPropagation();
    const currentUserId = profile?.id || user?.id || 'guest';
    const currentName = profile?.username || user?.email || 'MEXO User';
    const copy = quizService.duplicateQuiz(q.id, currentName, currentUserId);
    if (copy) {
      navigate(`/builder/${copy.id}`);
    }
  };

  const handleStartLive = (e: React.MouseEvent, q: Quiz) => {
    e.stopPropagation();
    navigate(`/host/${q.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>MEXO Discover Network</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Explore Public Learning Resources</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Search thousands of public quizzes, assessments, flashcards, slide lessons, and interactive activities shared by educators worldwide.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, title, tag, or creator..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#7C3AED] focus:ring-4 focus:ring-purple-100 text-sm font-medium text-slate-900 outline-hidden"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Resource Type</label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden focus:border-[#7C3AED]"
            >
              <option value="all">All Types</option>
              <option value="quiz">Interactive Quiz</option>
              <option value="assessment">Formal Assessment</option>
              <option value="lesson">Slide Lesson</option>
              <option value="flashcards">Flashcard Deck</option>
              <option value="interactive_video">Interactive Video</option>
              <option value="passage">Reading Passage</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden focus:border-[#7C3AED]"
            >
              <option value="all">All Subjects</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Physics">Physics</option>
              <option value="Geography">Geography</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Biology">Biology</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Grade Level</label>
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden focus:border-[#7C3AED]"
            >
              <option value="all">All Grades</option>
              <option value="K-12">K-12</option>
              <option value="High School">High School</option>
              <option value="College">College</option>
              <option value="Professional">Professional</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden focus:border-[#7C3AED]"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-600 uppercase mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-hidden focus:border-[#7C3AED]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discover Activity Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            Showing {filteredResources.length} public resources
          </p>
        </div>

        {filteredResources.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No public resources match your filters</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Try broadening your search criteria or clear your subject filters.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedSubject('all');
                setSelectedDifficulty('all');
                setSelectedGrade('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(q => (
              <div
                key={q.id}
                onClick={() => navigate(`/quiz/${q.id}`)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    <img
                      src={q.settings.coverImageUrl || 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600'}
                      alt={q.settings.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                      {q.resource_type || 'quiz'}
                    </div>
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold">
                      {q.settings.subject}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{q.rating_avg}</span>
                        <span className="text-slate-400 font-normal">({q.rating_count})</span>
                      </div>
                      <span className="text-slate-500 font-medium">{q.plays_count} plays</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                      {q.settings.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {q.settings.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="flex items-center space-x-2">
                      <MexoAvatar name={q.creator_name} src={q.creator_avatar} size="xs" />
                      <span className="text-xs text-slate-600 font-semibold truncate max-w-[120px]">{q.creator_name}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/quiz/${q.id}`);
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold transition-all flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play</span>
                    </button>

                    <button
                      onClick={e => handleStartLive(e, q)}
                      title="Start Live Session"
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5 text-rose-400" />
                      <span>Live</span>
                    </button>

                    <button
                      onClick={e => handleDuplicate(e, q)}
                      title="Duplicate to My Library"
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
