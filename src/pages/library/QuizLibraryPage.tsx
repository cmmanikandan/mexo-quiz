import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { Quiz } from '../../types/quiz';
import { MexoAvatar } from '../../components/common/MexoAvatar';
import { MexoButton } from '../../components/common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Search, Filter, Star, Play, BookOpen, Layers } from 'lucide-react';

export const QuizLibraryPage: React.FC = () => {
  useDocumentTitle('Quiz Library — MEXO Quiz');
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'rating'>('newest');

  const filteredQuizzes = quizService.searchQuizzes({
    query,
    subject,
    difficulty,
    sortBy,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quiz Library & Explore</h1>
        <p className="text-xs text-slate-500 mt-0.5">Discover interactive quizzes created by teachers and experts.</p>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-mexo-card space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search quizzes by title, tag, subject or teacher name..."
            className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-1 text-slate-500 font-bold">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>

          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
          >
            <option value="all">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Geography">Geography</option>
            <option value="Mathematics">Mathematics</option>
          </select>

          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="popular">Sort: Most Popular</option>
            <option value="rating">Sort: Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredQuizzes.map(q => (
          <div
            key={q.id}
            onClick={() => navigate(`/quiz/${q.id}`)}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-mexo-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                <img
                  src={q.settings.coverImageUrl || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600'}
                  alt={q.settings.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase">
                  {q.settings.subject}
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-center space-x-1.5 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{q.rating_avg}</span>
                  <span className="text-slate-400 font-normal">({q.rating_count}) · {q.plays_count} plays</span>
                </div>

                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors line-clamp-2">
                  {q.settings.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {q.settings.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 mt-4">
              <div className="flex items-center space-x-2">
                <MexoAvatar name={q.creator_name} src={q.creator_avatar} size="xs" />
                <span className="text-xs text-slate-600 font-semibold truncate max-w-[120px]">{q.creator_name}</span>
              </div>
              <span className="text-xs font-bold text-[#7C3AED] flex items-center space-x-1">
                <span>Start</span>
                <Play className="w-3.5 h-3.5 fill-[#7C3AED]" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
