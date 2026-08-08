import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw, Check, RefreshCw, ArrowLeft, Trophy, Layers } from 'lucide-react';
import { Quiz, Flashcard } from '../../types/quiz';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface FlashcardPlayerProps {
  quiz: Quiz;
}

export const FlashcardPlayer: React.FC<FlashcardPlayerProps> = ({ quiz }) => {
  useDocumentTitle(`Flashcards: ${quiz.settings.title}`);
  const navigate = useNavigate();

  const cards: Flashcard[] = quiz.flashcards || [
    { id: 'c1', frontText: 'Sample Front', backText: 'Sample Back', hint: 'Sample Hint' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  const card = cards[currentIndex] || cards[0];

  const handleNext = (known: boolean) => {
    if (known) setKnownCount(prev => prev + 1);
    else setPracticeCount(prev => prev + 1);

    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-3xl mx-auto w-full">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Flashcards</span>
        </button>

        <span className="text-xs font-extrabold text-amber-400 font-mono">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {!completed ? (
        /* Card Flip Container */
        <div className="max-w-xl mx-auto w-full my-auto space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 rounded-3xl bg-slate-900 border-2 border-slate-700 hover:border-purple-500 shadow-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative group overflow-hidden"
          >
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-800 text-slate-400 uppercase tracking-widest absolute top-4 left-4">
              {isFlipped ? 'Back side' : 'Front side'}
            </span>

            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">
                {isFlipped ? card.backText : card.frontText}
              </h2>
              {card.hint && !isFlipped && (
                <p className="text-xs text-amber-400 italic">Hint: {card.hint}</p>
              )}
            </div>

            <span className="text-[11px] font-bold text-slate-500 flex items-center space-x-1 absolute bottom-4">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Tap to flip card</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleNext(false)}
              className="py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs hover:bg-amber-500/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Need Practice</span>
            </button>

            <button
              onClick={() => handleNext(true)}
              className="py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>I Know This</span>
            </button>
          </div>
        </div>
      ) : (
        /* Completion View */
        <div className="max-w-md mx-auto w-full my-auto text-center space-y-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl mx-auto shadow-xl">
            🏆
          </div>
          <h2 className="text-2xl font-black text-white">Deck Mastered!</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              <p className="text-[10px] font-bold uppercase">Mastered</p>
              <p className="text-xl font-black">{knownCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-300">
              <p className="text-[10px] font-bold uppercase">Review Needed</p>
              <p className="text-xl font-black">{practiceCount}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};
