import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { classService } from '../../services/classService';
import { MexoButton } from '../../components/common/MexoButton';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { FileText, Clock, Calendar, CheckCircle2 } from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
  useDocumentTitle('Homework & Assignments — MEXO Quiz');
  const navigate = useNavigate();
  const [assignments] = useState(() => classService.getAssignments());

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Homework Assignments</h1>
        <p className="text-xs text-slate-500 mt-0.5">Quizzes assigned by your teachers across enrolled classrooms.</p>
      </div>

      <div className="space-y-4">
        {assignments.map(asg => (
          <div key={asg.id} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-mexo-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-extrabold uppercase">
                {asg.class_name}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">{asg.quiz_title}</h3>
              <p className="text-xs text-slate-500 flex items-center space-x-3">
                <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /><span>Due: {new Date(asg.due_date).toLocaleDateString()}</span></span>
                <span>·</span>
                <span>Attempts: {asg.attempts_allowed} allowed</span>
              </p>
            </div>
            <MexoButton variant="purple" size="sm" onClick={() => navigate(`/quiz/${asg.quiz_id}`)}>
              Start Assignment
            </MexoButton>
          </div>
        ))}
      </div>
    </div>
  );
};
