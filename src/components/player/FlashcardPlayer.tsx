import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCw,
  Check,
  RefreshCw,
  ArrowLeft,
  Trophy,
  Layers,
  Star,
  Shuffle,
  Grid,
  Volume2,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { Quiz, Flashcard } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { MexoButton } from '../common/MexoButton';

interface FlashcardPlayerProps {
  quiz: Quiz;
}

export const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ quiz }) => {
  useDocumentTitle(`Flashcards: ${quiz.settings?.title || 'Study Deck'}`);
  const navigate = useNavigate();

  // Extract flashcards from quiz or fallback to question titles/options
  const initialCards: Flashcard[] = (quiz.flashcards && quiz.flashcards.length > 0
    ? quiz.flashcards
    : quiz.questions.map((q, idx) => ({
        id: q.id || `fc-${idx}`,
        frontText: q.title || `Concept ${idx + 1}`,
        backText:
          q.options?.find(o => o.isCorrect)?.text ||
          q.acceptedBlanks?.join(', ') ||
          'Answer key definition',
        hint: q.explanation || `Question type: ${q.type.replace('_', ' ')}`,
      }))) || [
    { id: 'c1', frontText: 'Concept Term', backText: 'Detailed Explanation & Definition', hint: 'Think about key principles' },
  ];

  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [starredCards, setStarredCards] = useState<Record<string, boolean>>({});

  // Study Deck Stats
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [practiceIds, setPracticeIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);
  const [showGridModal, setShowGridModal] = useState(false);

  const card = cards[currentIndex] || cards[0];

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || showGridModal) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleAction(true);
      } else if (e.code === 'ArrowLeft') {
        handleAction(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isCompleted, showGridModal, cards]);

  const handleAction = (isKnown: boolean) => {
    if (!card) return;

    if (isKnown) {
      setKnownIds(prev => new Set(prev).add(card.id));
    } else {
      setPracticeIds(prev => new Set(prev).add(card.id));
    }

    setIsFlipped(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleRestart = (onlyPractice = false) => {
    if (onlyPractice) {
      const practiceCards = cards.filter(c => practiceIds.has(c.id));
      if (practiceCards.length > 0) {
        setCards(practiceCards);
      }
    } else {
      setCards(initialCards);
    }
    setKnownIds(new Set());
    setPracticeIds(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  const toggleStar = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Text to Speech for Card Reading
  const handleReadAloud = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const totalCards = cards.length;
  const progressPct = Math.round(((currentIndex + (isCompleted ? 1 : 0)) / totalCards) * 100);

  return (
    <div className="fixed inset-0 bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none z-50 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-4xl mx-auto w-full shrink-0">
        <button
          onClick={() => navigate(`/library/${quiz.id}`)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Deck</span>
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-extrabold text-purple-400 font-mono">
            {currentIndex + 1} / {totalCards} Cards
          </span>

          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowGridModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Grid Overview"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-4xl mx-auto bg-slate-900 rounded-full h-2 overflow-hidden my-2 border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* 2. Main Deck Player Body */}
      {!isCompleted && card ? (
        <div className="max-w-2xl mx-auto w-full my-auto space-y-6 flex flex-col items-center">
          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 sm:h-96 rounded-3xl bg-slate-900 border-2 border-slate-800 hover:border-[#7C3AED] shadow-2xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 relative group overflow-hidden"
            style={{ perspective: '1000px' }}
          >
            {/* Top Bar of Card */}
            <div className="flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-slate-800/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-purple-300 border border-purple-500/30">
                {isFlipped ? 'Answer / Definition' : 'Term / Concept'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={e => handleReadAloud(isFlipped ? card.backText : card.frontText, e)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Read Aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={e => toggleStar(card.id, e)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    starredCards[card.id] ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500 hover:text-amber-400'
                  }`}
                  title="Star Card"
                >
                  <Star className={`w-4 h-4 ${starredCards[card.id] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            </div>

            {/* Card Content Center */}
            <div className="my-auto text-center space-y-4 px-4 z-10">
              <h2 className="text-xl sm:text-3xl font-black text-white leading-snug break-words">
                {isFlipped ? card.backText : card.frontText}
              </h2>

              {card.hint && !isFlipped && (
                <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hint: {card.hint}</span>
                </div>
              )}
            </div>

            {/* Bottom Flip Callout */}
            <div className="flex items-center justify-center space-x-2 text-xs font-extrabold text-slate-500 z-10 pt-2 border-t border-slate-800/80">
              <RotateCw className="w-4 h-4 text-[#7C3AED] group-hover:rotate-180 transition-transform duration-500" />
              <span>Click card or press SPACEBAR to flip</span>
            </div>
          </div>

          {/* Action Buttons: Need Practice vs I Know This */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => handleAction(false)}
              className="py-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Need Practice (←)</span>
            </button>

            <button
              onClick={() => handleAction(true)}
              className="py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-lg active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>I Know This (→)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion Summary Screen */
        <div className="max-w-md mx-auto w-full my-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Deck Complete! 🎉</h2>
            <p className="text-xs text-slate-400">Great job reviewing this study deck!</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold uppercase text-emerald-400">Mastered</p>
              <p className="text-2xl font-black text-white">{knownIds.size}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-extrabold uppercase text-amber-400">Need Practice</p>
              <p className="text-2xl font-black text-white">{practiceIds.size}</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {practiceIds.size > 0 && (
              <button
                onClick={() => handleRestart(true)}
                className="w-full py-3 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                Review {practiceIds.size} Starred / Practice Cards
              </button>
            )}

            <button
              onClick={() => handleRestart(false)}
              className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs transition-all cursor-pointer"
            >
              Restart Entire Deck
            </button>

            <button
              onClick={() => navigate(`/library/${quiz.id}`)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs transition-all cursor-pointer"
            >
              Back to Resource Details
            </button>
          </div>
        </div>
      )}

      {/* Grid Overview Modal */}
      {showGridModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Deck Cards Overview</h3>
              <button
                onClick={() => setShowGridModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cards.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsFlipped(false);
                    setShowGridModal(false);
                  }}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                    currentIndex === idx
                      ? 'bg-purple-900/40 border-purple-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 block">Card #{idx + 1}</span>
                  <p className="font-bold truncate mt-1">{c.frontText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
