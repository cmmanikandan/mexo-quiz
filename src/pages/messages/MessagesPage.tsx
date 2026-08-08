import React, { useState } from 'react';
import { MessageSquare, Send, Search, Users, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { classService } from '../../services/classService';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isTeacher?: boolean;
}

export const MessagesPage: React.FC = () => {
  useDocumentTitle('Class Messages & Announcements — MEXO Quiz');
  const { profile, user } = useAuth();
  const classes = classService.getClasses();

  const [activeClassId, setActiveClassId] = useState(classes[0]?.id || 'general');
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username : user?.email || 'You',
      text: messageInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTeacher: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessageInput('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Classroom Collaboration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Class Messages & Announcements</h1>
        </div>
      </div>

      {/* Chat Interface Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
        {/* Thread Sidebar */}
        <div className="border-r border-slate-200 p-4 space-y-3 bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Class Channels</h3>
          <div className="space-y-1">
            {classes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active class channels.</p>
            ) : (
              classes.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveClassId(c.id)}
                  className={`w-full p-3 rounded-2xl font-bold text-xs flex items-center justify-between cursor-pointer transition-all ${
                    activeClassId === c.id
                      ? 'bg-purple-100 text-[#7C3AED]'
                      : 'hover:bg-slate-100 text-slate-700 font-semibold'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {activeClassId === c.id && <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Message Feed */}
        <div className="md:col-span-2 flex flex-col justify-between p-6 bg-white space-y-4">
          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2">
            {messages.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No announcements in this class channel yet</p>
                <p className="text-[11px] text-slate-400">Post a message below to communicate with students and class members.</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {m.sender} {m.isTeacher && '👨‍🏫'}
                    </span>
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{m.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendMessage} className="relative flex items-center pt-2 border-t border-slate-100">
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Send announcement or message to class..."
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:border-[#7C3AED] outline-hidden"
            />
            <button
              type="submit"
              className="absolute right-2 p-2 rounded-xl bg-[#7C3AED] text-white hover:bg-purple-700 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
