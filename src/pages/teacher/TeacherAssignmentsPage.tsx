import React, { useState } from 'react';
import { classService } from '../../services/classService';
import { quizService } from '../../services/quizService';
import { HomeworkAssignment } from '../../types/quiz';
import { MexoButton } from '../../components/common/MexoButton';
import { MexoModal } from '../../components/common/MexoModal';
import { MexoInput } from '../../components/common/MexoInput';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { FileText, Plus, Calendar, Users } from 'lucide-react';

export const TeacherAssignmentsPage: React.FC = () => {
  useDocumentTitle('Homework Assignments — Teacher Dashboard');
  const [assignments, setAssignments] = useState(() => classService.getAssignments());
  const [classes] = useState(() => classService.getClasses());
  const [quizzes] = useState(() => quizService.getAllQuizzes());
  const [showModal, setShowModal] = useState(false);

  const [selectedQuiz, setSelectedQuiz] = useState(quizzes[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '');
  const [dueDate, setDueDate] = useState('2026-08-15');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const qObj = quizzes.find(q => q.id === selectedQuiz);
    const cObj = classes.find(c => c.id === selectedClass);
    if (!qObj || !cObj) return;

    classService.addAssignment({
      quiz_id: qObj.id,
      quiz_title: qObj.settings.title,
      class_id: cObj.id,
      class_name: cObj.name,
      teacher_id: 'mexo-teacher',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      attempts_allowed: 1,
      allow_late_submission: false,
      auto_remind: true,
    });

    setAssignments(classService.getAssignments());
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Homework Assignments</h1>
          <p className="text-xs text-slate-500 mt-0.5">Assign quizzes to classrooms with due dates and submission policies.</p>
        </div>
        <MexoButton variant="purple" size="md" onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Assign Quiz to Class
        </MexoButton>
      </div>

      <div className="space-y-4">
        {assignments.map(asg => (
          <div key={asg.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-mexo-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-extrabold uppercase">
                {asg.class_name}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">{asg.quiz_title}</h3>
              <p className="text-xs text-slate-500">
                Due Date: {new Date(asg.due_date).toLocaleDateString()} · Attempts Allowed: {asg.attempts_allowed}
              </p>
            </div>
            <MexoButton variant="outline" size="xs" onClick={() => alert('Viewing student submission roster...')}>
              View Submissions
            </MexoButton>
          </div>
        ))}
      </div>

      <MexoModal isOpen={showModal} onClose={() => setShowModal(false)} title="Assign Quiz to Class" maxWidth="sm">
        <form onSubmit={handleCreateAssignment} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Quiz</label>
            <select
              value={selectedQuiz}
              onChange={e => setSelectedQuiz(e.target.value)}
              className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200"
            >
              {quizzes.map(q => (
                <option key={q.id} value={q.id}>
                  {q.settings.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Classroom</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full p-2.5 text-xs font-bold rounded-xl border border-slate-200"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <MexoInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            required
          />

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <MexoButton variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </MexoButton>
            <MexoButton variant="purple" size="sm" type="submit">
              Assign Homework
            </MexoButton>
          </div>
        </form>
      </MexoModal>
    </div>
  );
};
