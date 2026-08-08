import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Radio, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { classService } from '../../services/classService';
import { liveSessionService } from '../../services/liveSessionService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const CalendarPage: React.FC = () => {
  useDocumentTitle('MEXO Calendar — Deadlines & Live Sessions');
  const navigate = useNavigate();

  const [assignments] = useState(() => classService.getAssignments());
  const [sessions] = useState(() => liveSessionService.getLocalSessions());
  const [currentMonth] = useState('August 2026');

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <CalendarIcon className="w-4 h-4" />
            <span>MEXO Schedule</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Calendar & Event Schedule</h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl">
            Never miss an assignment deadline or live teacher session with interactive calendar events.
          </p>
        </div>
      </div>

      {/* Calendar Grid View */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900">{currentMonth}</h2>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-400 uppercase">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 text-xs font-semibold">
          {Array.from({ length: 31 }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayAssignments = assignments.filter(a => {
              const d = new Date(a.due_date);
              return d.getDate() === dayNum;
            });

            const daySessions = sessions.filter(s => {
              const d = new Date(s.created_at);
              return d.getDate() === dayNum;
            });

            return (
              <div
                key={dayNum}
                className="min-h-[85px] p-2 rounded-2xl border bg-slate-50/50 border-slate-100 transition-all flex flex-col justify-between"
              >
                <span className="font-extrabold text-slate-900">{dayNum}</span>

                <div className="space-y-1">
                  {dayAssignments.map(asg => (
                    <div
                      key={asg.id}
                      onClick={() => navigate('/assignments')}
                      className="p-1 rounded-lg bg-blue-500 text-white text-[9px] font-extrabold truncate cursor-pointer"
                      title={asg.quiz_title}
                    >
                      {asg.quiz_title}
                    </div>
                  ))}
                  {daySessions.map(s => (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/host/${s.id}`)}
                      className="p-1 rounded-lg bg-rose-500 text-white text-[9px] font-extrabold truncate cursor-pointer"
                      title={s.title}
                    >
                      Live Session
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
