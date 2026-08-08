import React, { useState } from 'react';
import { classService } from '../../services/classService';
import { ClassRoom } from '../../types/quiz';
import { MexoButton } from '../../components/common/MexoButton';
import { MexoModal } from '../../components/common/MexoModal';
import { MexoInput } from '../../components/common/MexoInput';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Users, Plus, QrCode, Copy } from 'lucide-react';

export const TeacherClassesPage: React.FC = () => {
  useDocumentTitle('Classrooms — Teacher Dashboard');
  const [classes, setClasses] = useState(() => classService.getClasses());
  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    classService.addClass({
      name: className,
      subject: subject || 'General',
      teacher_id: 'mexo-teacher',
      teacher_name: 'Teacher',
    });

    setClasses(classService.getClasses());
    setClassName('');
    setSubject('');
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Classrooms</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage student rosters, join codes, and class homework progress.</p>
        </div>
        <MexoButton variant="purple" size="md" onClick={() => setShowModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create Class
        </MexoButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map(c => (
          <div key={c.id} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-mexo-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] text-[10px] font-extrabold uppercase">
                  {c.subject}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{c.name}</h3>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-bold text-xs">
                  {c.code}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Class Join Code</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="flex items-center space-x-1.5 font-semibold">
                <Users className="w-4 h-4 text-slate-400" />
                <span>{c.students_count} Enrolled Students</span>
              </span>
              <button
                onClick={() => alert(`Invite link copied for class ${c.code}!`)}
                className="text-[#7C3AED] font-bold hover:underline flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Invite Link</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <MexoModal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Classroom" maxWidth="sm">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <MexoInput
            label="Classroom Name"
            value={className}
            onChange={e => setClassName(e.target.value)}
            placeholder="e.g. Physics 101 Honors"
            required
          />
          <MexoInput
            label="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Science"
          />

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <MexoButton variant="outline" size="sm" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </MexoButton>
            <MexoButton variant="purple" size="sm" type="submit">
              Create Classroom
            </MexoButton>
          </div>
        </form>
      </MexoModal>
    </div>
  );
};
