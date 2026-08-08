import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  FileCheck,
  BookOpen,
  Layers,
  Video,
  FileText,
  BarChart2,
  ListOrdered,
  Sparkles,
  Upload,
  X,
  PlusCircle,
  BrainCircuit,
  FileSpreadsheet,
  Download,
  FolderOpen,
} from 'lucide-react';
import { AIGeneratorModal } from './AIGeneratorModal';
import { BulkImportModal } from '../builder/BulkImportModal';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [showAiModal, setShowAiModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  if (!isOpen) return null;

  // Download Sample CSV Template
  const handleDownloadSampleCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csvContent =
      'Question Text,Question Type,Option A,Option B,Option C,Option D,Correct Option (A/B/C/D),Points,Explanation\n' +
      '"What is the chemical symbol for Water?",multiple_choice,"H2O","CO2","NaCl","O2","A",10,"Water consists of two hydrogen atoms and one oxygen atom."\n' +
      '"The Earth orbits around the Sun.",true_false,"True","False","","","A",10,"The Earth completes one full orbit around the Sun every 365.25 days."\n' +
      '"What is the capital city of France?",multiple_choice,"Paris","London","Berlin","Rome","A",10,"Paris has been the capital of France since 987 AD."\n' +
      '"Which planet is known as the Red Planet?",multiple_choice,"Venus","Mars","Jupiter","Saturn","B",10,"Mars appears red due to iron oxide on its surface."';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'MEXO_Quiz_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const creationOptions = [
    {
      id: 'quiz',
      title: 'Interactive Quiz',
      description: 'Engaging, gamified quiz with instant feedback, time limits & points',
      icon: HelpCircle,
      color: 'bg-purple-500 text-white',
      badge: 'Popular',
      type: 'quiz',
    },
    {
      id: 'assessment',
      title: 'Formal Assessment',
      description: 'Timed exam with strict full-screen mode, randomized questions & accommodations',
      icon: FileCheck,
      color: 'bg-blue-600 text-white',
      badge: 'Formal',
      type: 'assessment',
    },
    {
      id: 'lesson',
      title: 'Interactive Lesson',
      description: 'Slide presentation combining text, media, interactive questions & polls',
      icon: BookOpen,
      color: 'bg-emerald-500 text-white',
      badge: 'Slides',
      type: 'lesson',
    },
    {
      id: 'flashcards',
      title: 'Flashcard Deck',
      description: 'Interactive study deck with term/definition cards & mastery tracking',
      icon: Layers,
      color: 'bg-amber-500 text-white',
      type: 'flashcards',
    },
    {
      id: 'interactive_video',
      title: 'Interactive Video',
      description: 'Upload or embed video with timestamped question triggers & checkpoints',
      icon: Video,
      color: 'bg-rose-500 text-white',
      type: 'interactive_video',
    },
    {
      id: 'passage',
      title: 'Reading Passage',
      description: 'Comprehension passage paired with targeted multi-question sets',
      icon: FileText,
      color: 'bg-indigo-500 text-white',
      type: 'passage',
    },
    {
      id: 'poll',
      title: 'Live Poll',
      description: 'Single or multi-question opinion poll with real-time bar chart results',
      icon: BarChart2,
      color: 'bg-cyan-500 text-white',
      type: 'poll',
    },
    {
      id: 'survey',
      title: 'Survey / Questionnaire',
      description: 'Gather student feedback, ratings, and open-ended reflections',
      icon: ListOrdered,
      color: 'bg-teal-500 text-white',
      type: 'survey',
    },
  ];

  const handleSelectType = (type: string) => {
    onClose();
    navigate(`/builder/new?type=${type}`);
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Create Learning Resource</h2>
                <p className="text-xs text-slate-500 font-medium">Select a format, use MEXO AI, or import CSV files</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. MEXO AI Generator Highlight Banner */}
            <div
              onClick={() => setShowAiModal(true)}
              className="p-5 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden flex items-center justify-between"
            >
              <div className="space-y-1 z-10">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>MEXO AI Intelligence</span>
                </div>
                <h3 className="text-lg font-black group-hover:translate-x-1 transition-transform">Create with MEXO AI</h3>
                <p className="text-xs text-purple-100 max-w-md">
                  Generate quizzes, assessments, or slides from any topic, document, spreadsheet, or pasted text instantly.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-8 h-8 text-yellow-300" />
              </div>
            </div>

            {/* 2. BULK IMPORT & DOWNLOAD CSV TEMPLATE CARD (Right after MEXO AI Card) */}
            <div className="p-5 rounded-3xl bg-purple-50 border border-purple-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-black text-slate-900">Bulk Import & CSV Template</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 text-[#7C3AED] text-[10px] font-extrabold uppercase">
                        Instant Import
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Upload your question files directly or download our ready-to-use CSV template.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Download Template vs Import File */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadSampleCSV}
                  className="p-3.5 rounded-2xl bg-white border border-purple-300 hover:border-[#7C3AED] text-[#7C3AED] font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-xs group"
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download Sample CSV Template</span>
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="p-3.5 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import CSV / File Now</span>
                </button>
              </div>
            </div>

            {/* 3. Standard Creation Options Grid */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Resource Templates</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {creationOptions.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectType(opt.type)}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-mexo-md transition-all text-left flex items-start space-x-3.5 bg-white hover:bg-purple-50/30 cursor-pointer group"
                    >
                      <div className={`p-3 rounded-2xl ${opt.color} group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors">{opt.title}</h4>
                          {opt.badge && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED]">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 leading-snug mt-1">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAiModal && (
        <AIGeneratorModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onGenerated={(generatedQuestions, metadata) => {
            setShowAiModal(false);
            onClose();
            navigate(`/builder/new?type=${metadata.resourceType}`, {
              state: { aiQuestions: generatedQuestions, aiMetadata: metadata },
            });
          }}
        />
      )}

      {showImportModal && (
        <BulkImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={importedQuestions => {
            setShowImportModal(false);
            onClose();
            navigate('/builder/new?type=quiz', {
              state: { aiQuestions: importedQuestions },
            });
          }}
        />
      )}
    </>
  );
};
