import React, { useState } from 'react';
import { MexoModal } from '../common/MexoModal';
import { MexoButton } from '../common/MexoButton';
import { Question, QuestionBankItem } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { Database, Plus, Search, Check } from 'lucide-react';

interface BankSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: Question) => void;
}

export const QuestionBankSelector: React.FC<BankSelectorProps> = ({ isOpen, onClose, onSelectQuestion }) => {
  const [bankItems, setBankItems] = useState<QuestionBankItem[]>([]);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      quizService.getQuestionBank().then(items => setBankItems(items));
    }
  }, [isOpen]);

  const filtered = bankItems.filter(b => b.question?.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <MexoModal isOpen={isOpen} onClose={onClose} title="Import from Question Bank" maxWidth="lg">
      <div className="space-y-4 pt-1">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved questions..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No saved questions in your bank yet.</p>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-purple-200">
                <div>
                  <p className="text-xs font-bold text-slate-900">{item.question.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{item.question.type} · {item.question.points} pts</p>
                </div>
                <MexoButton
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    onSelectQuestion({ ...item.question, id: `q-${Date.now()}` });
                    onClose();
                  }}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add
                </MexoButton>
              </div>
            ))
          )}
        </div>
      </div>
    </MexoModal>
  );
};
