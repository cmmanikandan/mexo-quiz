import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Quiz, LessonSlide } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface LessonPlayerProps {
  quiz: Quiz;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ quiz }) => {
  useDocumentTitle(`Lesson: ${quiz.settings.title}`);
  const navigate = useNavigate();

  const slides: LessonSlide[] = quiz.slides || [
    {
      id: 'sl-1',
      title: quiz.settings.title,
      content: quiz.settings.description || 'Interactive slide lesson.',
      slideType: 'content',
    },
  ];

  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const slide = slides[currentSlideIdx] || slides[0];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Lesson</span>
        </button>

        <span className="text-xs font-bold text-purple-400 font-mono">
          Slide {currentSlideIdx + 1} of {slides.length}
        </span>
      </div>

      {/* Main Slide Card */}
      <div className="max-w-4xl mx-auto w-full bg-slate-800/80 rounded-3xl p-8 border border-slate-700 space-y-6 my-auto shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-black text-white">{slide.title}</h1>

        {slide.mediaUrl && (
          <div className="rounded-2xl overflow-hidden max-h-72 bg-slate-950 flex items-center justify-center">
            <img src={slide.mediaUrl} alt={slide.title} className="max-h-72 object-contain" />
          </div>
        )}

        <div className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
          {slide.content}
        </div>

        {slide.embeddedQuestion && (
          <div className="p-5 rounded-2xl bg-purple-950/60 border border-purple-500/40 space-y-3">
            <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Embedded Knowledge Check</h4>
            <p className="text-sm font-bold text-white">{slide.embeddedQuestion.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {slide.embeddedQuestion.options.map(opt => (
                <button
                  key={opt.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 text-xs font-bold text-left cursor-pointer transition-all"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full pt-4 border-t border-slate-800">
        <button
          onClick={() => setCurrentSlideIdx(prev => Math.max(0, prev - 1))}
          disabled={currentSlideIdx === 0}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        <button
          onClick={() => {
            if (currentSlideIdx < slides.length - 1) {
              setCurrentSlideIdx(prev => prev + 1);
            } else {
              navigate('/');
            }
          }}
          className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold cursor-pointer flex items-center space-x-1"
        >
          <span>{currentSlideIdx < slides.length - 1 ? 'Next Slide' : 'Complete Lesson'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
