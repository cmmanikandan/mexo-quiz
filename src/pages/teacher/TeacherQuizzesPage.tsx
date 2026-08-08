import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { MexoButton } from '../../components/common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Plus, Edit3, Copy, Trash2, Eye, Play, Layers } from 'lucide-react';

export const TeacherQuizzesPage: React.FC = () => {
  useDocumentTitle('My Created Quizzes — Teacher Dashboard');
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState(() => quizService.getAllQuizzes());

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      await quizService.deleteQuiz(id);
      setQuizzes(quizService.getAllQuizzes());
    }
  };

  const handleDuplicate = async (id: string) => {
    await quizService.duplicateQuiz(id, 'Teacher', 'mexo-teacher');
    setQuizzes(quizService.getAllQuizzes());
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Created Quizzes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your interactive quizzes, edit questions, and publish assessments.</p>
        </div>
        <MexoButton variant="purple" size="md" onClick={() => navigate('/builder/new')} leftIcon={<Plus className="w-4 h-4" />}>
          Create New Quiz
        </MexoButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quizzes.map(q => (
          <div key={q.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-mexo-card space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-bold uppercase">
                  {q.settings.status}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{q.questions.length} Qs</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">{q.settings.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{q.settings.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex space-x-1">
                <button
                  onClick={() => navigate(`/builder/${q.id}`)}
                  className="p-2 rounded-xl text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50"
                  title="Edit Quiz"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDuplicate(q.id)}
                  className="p-2 rounded-xl text-slate-600 hover:text-[#7C3AED] hover:bg-purple-50"
                  title="Duplicate Quiz"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <MexoButton variant="outline" size="xs" onClick={() => navigate(`/live/MEXO-${Math.floor(1000 + Math.random() * 9000)}`)}>
                Host Live
              </MexoButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
