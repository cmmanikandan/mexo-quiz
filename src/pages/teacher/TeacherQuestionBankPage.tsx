import React, { useState } from 'react';
import { quizService } from '../../services/quizService';
import { QuestionBankItem } from '../../types/quiz';
import { MexoButton } from '../../components/common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Database, Plus, Search, Layers } from 'lucide-react';

export const TeacherQuestionBankPage: React.FC = () => {
  useDocumentTitle('Question Bank — Teacher Dashboard');
  const [bankItems, setBankItems] = useState<QuestionBankItem[]>([]);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    quizService.getQuestionBank().then(items => setBankItems(items));
  }, []);

  const filtered = bankItems.filter(b => b.question?.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Question Bank</h1>
          <p className="text-xs text-slate-500 mt-0.5">Reusable repository of questions categorized by subject, folder, and tags.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search saved questions in bank..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 outline-none focus:border-[#7C3AED]"
          />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No saved questions in your bank yet.</p>
          ) : (
            filtered.map(item => (
              <div key={item.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-bold uppercase">
                    {item.question.type}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 mt-1">{item.question.title}</h3>
                </div>
                <MexoButton variant="outline" size="xs" onClick={() => alert('Question cloned to clipboard!')}>
                  Copy Question
                </MexoButton>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
