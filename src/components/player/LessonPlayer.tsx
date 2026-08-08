import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Grid,
  Maximize2,
  Minimize2,
  Volume2,
  FileText,
  Radio,
  Play,
  Pause,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { Quiz, LessonSlide } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoButton } from '../common/MexoButton';

interface LessonPlayerProps {
  quiz: Quiz;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({ quiz }) => {
  useDocumentTitle(`Lesson: ${quiz.settings?.title || 'Interactive Slides'}`);
  const navigate = useNavigate();

  const slides: LessonSlide[] = (quiz.slides && quiz.slides.length > 0
    ? quiz.slides
    : quiz.questions.map((q, idx) => ({
        id: q.id || `sl-${idx}`,
        title: q.title || `Slide ${idx + 1}`,
        content: q.explanation || 'Review key principles and study points.',
        slideType: idx === 0 ? 'title' : 'content',
        mediaUrl: quiz.settings?.coverImageUrl,
        embeddedQuestion: {
          title: q.title,
          options: q.options || [
            { id: 'o1', text: 'Option A', isCorrect: true },
            { id: 'o2', text: 'Option B', isCorrect: false },
          ],
        },
      }))) || [
    {
      id: 'sl-1',
      title: quiz.settings?.title || 'Interactive Lesson Slide',
      content: quiz.settings?.description || 'Welcome to this MEXO interactive slide deck presentation.',
      slideType: 'title',
    },
  ];

  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [showSlideDrawer, setShowSlideDrawer] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [userPollChoice, setUserPollChoice] = useState<Record<string, string>>({});

  const slide = slides[currentSlideIdx] || slides[0];
  const totalSlides = slides.length;

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlideIdx(prev => {
        if (prev < totalSlides - 1) return prev + 1;
        setIsAutoPlaying(false);
        return prev;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIdx < totalSlides - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    } else {
      navigate(`/library/${quiz.id}`);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none z-50 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-5xl mx-auto w-full shrink-0">
        <button
          onClick={() => navigate(`/library/${quiz.id}`)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Presentation</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-extrabold text-purple-400 font-mono">
            Slide {currentSlideIdx + 1} of {totalSlides}
          </span>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isAutoPlaying
                ? 'bg-purple-900/50 border-purple-500 text-purple-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isAutoPlaying ? 'Pause Auto-Play' : 'Auto-Play Slides'}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Speaker Notes"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSlideDrawer(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Slide Drawer"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-5xl mx-auto bg-slate-900 rounded-full h-1.5 overflow-hidden my-2 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${((currentSlideIdx + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* 2. Main Slide Presentation Display */}
      <main className="max-w-4xl mx-auto w-full my-auto bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6 flex flex-col justify-between overflow-y-auto max-h-[70vh]">
        {/* Slide Category Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-[10px] font-black uppercase tracking-widest">
              {slide.slideType || 'Presentation'} Slide
            </span>
            <span className="text-xs font-semibold text-slate-400">{quiz.settings?.subject}</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">MEXO Slides</span>
        </div>

        {/* Slide Title & Media */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            {slide.title}
          </h1>

          {slide.mediaUrl && (
            <div className="w-full h-48 sm:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md">
              <img src={slide.mediaUrl} alt={slide.title} className="w-full h-full object-cover" />
            </div>
          )}

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium whitespace-pre-line">
            {slide.content}
          </p>
        </div>

        {/* Embedded Knowledge Check / Poll Slide Widget */}
        {slide.embeddedQuestion && (
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-3 pt-3">
            <div className="flex items-center space-x-2 text-purple-300 text-xs font-extrabold uppercase">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Interactive Knowledge Check</span>
            </div>
            <p className="text-sm font-bold text-white">{slide.embeddedQuestion.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {slide.embeddedQuestion.options.map(opt => {
                const isSelected = userPollChoice[slide.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setUserPollChoice({ ...userPollChoice, [slide.id]: opt.id })}
                    className={`p-3.5 rounded-xl border text-xs font-extrabold text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#7C3AED] border-purple-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 hover:border-purple-400 text-slate-200'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Speaker Notes Overlay Drawer */}
      {showSpeakerNotes && slide.speakerNotes && (
        <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 mb-2">
          <p className="font-extrabold uppercase text-[10px] text-amber-400">Speaker Notes:</p>
          <p className="font-medium">{slide.speakerNotes}</p>
        </div>
      )}

      {/* 3. Footer Navigation Bar */}
      <footer className="flex items-center justify-between max-w-4xl mx-auto w-full pt-4 border-t border-slate-800 shrink-0">
        <button
          onClick={handlePrevSlide}
          disabled={currentSlideIdx === 0}
          className="px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white text-xs font-bold disabled:opacity-30 cursor-pointer flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        <button
          onClick={handleNextSlide}
          className="px-6 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-extrabold cursor-pointer flex items-center space-x-1 shadow-md"
        >
          <span>{currentSlideIdx < totalSlides - 1 ? 'Next Slide' : 'Complete Lesson'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Slide Overview Grid Drawer */}
      {showSlideDrawer && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Presentation Slide Deck ({totalSlides})</h3>
              <button
                onClick={() => setShowSlideDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setCurrentSlideIdx(idx);
                    setShowSlideDrawer(false);
                  }}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    currentSlideIdx === idx
                      ? 'bg-purple-900/40 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 block">Slide #{idx + 1}</span>
                  <p className="font-bold truncate mt-1">{s.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
