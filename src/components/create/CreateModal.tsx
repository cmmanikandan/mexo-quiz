import React, { useState } from 'react';
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
  Layout,
  Calculator,
  Atom,
  Globe2,
  Code2,
  BookMarked,
  Zap,
} from 'lucide-react';
import { AIGeneratorModal } from './AIGeneratorModal';
import { BulkImportModal } from '../builder/BulkImportModal';
import { Question } from '../../types/quiz';

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

  const blankCreationTypes = [
    {
      id: 'quiz',
      title: 'Blank Quiz',
      description: 'Gamified quiz with instant feedback, timers & leaderboards',
      icon: HelpCircle,
      color: 'bg-[#7C3AED] text-white',
      badge: 'Popular',
      type: 'quiz',
    },
    {
      id: 'assessment',
      title: 'Blank Assessment',
      description: 'Formal timed exam with anti-cheating, schedule & pass scores',
      icon: FileCheck,
      color: 'bg-blue-600 text-white',
      badge: 'Formal',
      type: 'assessment',
    },
    {
      id: 'lesson',
      title: 'Blank Slide Lesson',
      description: 'Interactive slide presentation with text, media & poll slides',
      icon: BookOpen,
      color: 'bg-emerald-600 text-white',
      type: 'lesson',
    },
    {
      id: 'flashcards',
      title: 'Blank Flashcard Deck',
      description: 'Interactive study deck with front/back term cards',
      icon: Layers,
      color: 'bg-amber-500 text-white',
      type: 'flashcards',
    },
    {
      id: 'interactive_video',
      title: 'Interactive Video',
      description: 'Embed video with interactive timestamp question checkpoints',
      icon: Video,
      color: 'bg-rose-500 text-white',
      type: 'interactive_video',
    },
    {
      id: 'passage',
      title: 'Reading Passage',
      description: 'Comprehension text paired with targeted question sets',
      icon: FileText,
      color: 'bg-indigo-600 text-white',
      type: 'passage',
    },
  ];

  // Pre-built Curated Resource Templates
  const curatedTemplates = [
    {
      id: 'math-geometry',
      title: 'Math & Geometry Fundamentals',
      subject: 'Mathematics',
      grade: 'Grade 8 - High School',
      questionCount: 4,
      icon: Calculator,
      color: 'border-blue-200 bg-blue-50/50 text-blue-700',
      questions: [
        {
          id: 'tmpl-m1',
          type: 'multiple_choice' as const,
          title: 'What is the hypotenuse length of a right triangle with legs 3 cm and 4 cm?',
          options: [
            { id: 'opt-m1', text: '5 cm', isCorrect: true, explanation: 'By Pythagorean theorem: √(3² + 4²) = √(9 + 16) = √25 = 5 cm.' },
            { id: 'opt-m2', text: '6 cm', isCorrect: false },
            { id: 'opt-m3', text: '7 cm', isCorrect: false },
            { id: 'opt-m4', text: '12 cm', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-m2',
          type: 'true_false' as const,
          title: 'True or False: The sum of interior angles in any triangle is always 180 degrees.',
          options: [
            { id: 'opt-tf1', text: 'True', isCorrect: true },
            { id: 'opt-tf2', text: 'False', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-m3',
          type: 'multiple_choice' as const,
          title: 'Solve for x: 2x + 8 = 20',
          options: [
            { id: 'opt-x1', text: 'x = 6', isCorrect: true, explanation: '2x = 20 - 8 = 12 => x = 6.' },
            { id: 'opt-x2', text: 'x = 4', isCorrect: false },
            { id: 'opt-x3', text: 'x = 8', isCorrect: false },
            { id: 'opt-x4', text: 'x = 10', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-m4',
          type: 'multiple_select' as const,
          title: 'Select all prime numbers from the list below:',
          options: [
            { id: 'opt-p1', text: '2', isCorrect: true },
            { id: 'opt-p2', text: '7', isCorrect: true },
            { id: 'opt-p3', text: '9', isCorrect: false },
            { id: 'opt-p4', text: '13', isCorrect: true },
          ],
          points: 15,
          isRequired: true,
        },
      ],
    },
    {
      id: 'science-biology',
      title: 'General Science & Biology Essentials',
      subject: 'Science',
      grade: 'Middle & High School',
      questionCount: 4,
      icon: Atom,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-700',
      questions: [
        {
          id: 'tmpl-s1',
          type: 'multiple_choice' as const,
          title: 'Which organelle is known as the powerhouse of the cell?',
          options: [
            { id: 'opt-s1', text: 'Mitochondria', isCorrect: true, explanation: 'Mitochondria generate cellular energy (ATP).' },
            { id: 'opt-s2', text: 'Nucleus', isCorrect: false },
            { id: 'opt-s3', text: 'Ribosome', isCorrect: false },
            { id: 'opt-s4', text: 'Golgi Body', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-s2',
          type: 'true_false' as const,
          title: 'True or False: Photosynthesis converts light energy into chemical energy in plants.',
          options: [
            { id: 'opt-stf1', text: 'True', isCorrect: true },
            { id: 'opt-stf2', text: 'False', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-s3',
          type: 'multiple_choice' as const,
          title: 'What chemical symbol represents Water?',
          options: [
            { id: 'opt-w1', text: 'H2O', isCorrect: true },
            { id: 'opt-w2', text: 'CO2', isCorrect: false },
            { id: 'opt-w3', text: 'NaCl', isCorrect: false },
            { id: 'opt-w4', text: 'O2', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-s4',
          type: 'multiple_choice' as const,
          title: 'Which gas do plants absorb from the atmosphere during photosynthesis?',
          options: [
            { id: 'opt-g1', text: 'Carbon Dioxide (CO2)', isCorrect: true },
            { id: 'opt-g2', text: 'Oxygen (O2)', isCorrect: false },
            { id: 'opt-g3', text: 'Nitrogen (N2)', isCorrect: false },
            { id: 'opt-g4', text: 'Helium (He)', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
      ],
    },
    {
      id: 'coding-webdev',
      title: 'Computer Science & Web Development',
      subject: 'Coding',
      grade: 'High School & College',
      questionCount: 4,
      icon: Code2,
      color: 'border-purple-200 bg-purple-50/50 text-[#7C3AED]',
      questions: [
        {
          id: 'tmpl-c1',
          type: 'multiple_choice' as const,
          title: 'Which HTML element is used to define an un-ordered list?',
          options: [
            { id: 'opt-c1', text: '<ul>', isCorrect: true },
            { id: 'opt-c2', text: '<ol>', isCorrect: false },
            { id: 'opt-c3', text: '<li>', isCorrect: false },
            { id: 'opt-c4', text: '<list>', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-c2',
          type: 'multiple_select' as const,
          title: 'Select all valid JavaScript primitive data types:',
          options: [
            { id: 'opt-js1', text: 'string', isCorrect: true },
            { id: 'opt-js2', text: 'number', isCorrect: true },
            { id: 'opt-js3', text: 'boolean', isCorrect: true },
            { id: 'opt-js4', text: 'database', isCorrect: false },
          ],
          points: 15,
          isRequired: true,
        },
        {
          id: 'tmpl-c3',
          type: 'true_false' as const,
          title: 'True or False: CSS stands for Cascading Style Sheets.',
          options: [
            { id: 'opt-ctf1', text: 'True', isCorrect: true },
            { id: 'opt-ctf2', text: 'False', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-c4',
          type: 'multiple_choice' as const,
          title: 'Which SQL command is used to retrieve data from a database table?',
          options: [
            { id: 'opt-sql1', text: 'SELECT', isCorrect: true },
            { id: 'opt-sql2', text: 'GET', isCorrect: false },
            { id: 'opt-sql3', text: 'FETCH', isCorrect: false },
            { id: 'opt-sql4', text: 'EXTRACT', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
      ],
    },
    {
      id: 'geography-world',
      title: 'World Geography & History',
      subject: 'Geography',
      grade: 'General Knowledge',
      questionCount: 4,
      icon: Globe2,
      color: 'border-amber-200 bg-amber-50/50 text-amber-700',
      questions: [
        {
          id: 'tmpl-g1',
          type: 'multiple_choice' as const,
          title: 'What is the largest ocean on Planet Earth?',
          options: [
            { id: 'opt-geo1', text: 'Pacific Ocean', isCorrect: true },
            { id: 'opt-geo2', text: 'Atlantic Ocean', isCorrect: false },
            { id: 'opt-geo3', text: 'Indian Ocean', isCorrect: false },
            { id: 'opt-geo4', text: 'Arctic Ocean', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-g2',
          type: 'multiple_choice' as const,
          title: 'What is the capital city of Japan?',
          options: [
            { id: 'opt-j1', text: 'Tokyo', isCorrect: true },
            { id: 'opt-j2', text: 'Kyoto', isCorrect: false },
            { id: 'opt-j3', text: 'Osaka', isCorrect: false },
            { id: 'opt-j4', text: 'Hiroshima', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-g3',
          type: 'true_false' as const,
          title: 'True or False: Mount Everest is the highest mountain above sea level on Earth.',
          options: [
            { id: 'opt-[#gtf1]', text: 'True', isCorrect: true },
            { id: 'opt-[#gtf2]', text: 'False', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
        {
          id: 'tmpl-g4',
          type: 'multiple_choice' as const,
          title: 'Which continent has the largest land mass?',
          options: [
            { id: 'opt-cont1', text: 'Asia', isCorrect: true },
            { id: 'opt-cont2', text: 'Africa', isCorrect: false },
            { id: 'opt-cont3', text: 'North America', isCorrect: false },
            { id: 'opt-cont4', text: 'Europe', isCorrect: false },
          ],
          points: 10,
          isRequired: true,
        },
      ],
    },
  ];

  const handleSelectBlankType = (type: string) => {
    onClose();
    navigate(`/builder/new?type=${type}`);
  };

  const handleSelectCuratedTemplate = (template: typeof curatedTemplates[0]) => {
    onClose();
    navigate('/builder/new?type=quiz', {
      state: {
        aiQuestions: template.questions,
        aiMetadata: {
          topic: template.title,
          subject: template.subject,
          grade: template.grade,
          difficulty: 'medium',
        },
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 select-none">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 flex flex-col">
          {/* Top Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#7C3AED] flex items-center justify-center shadow-xs">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Create Learning Resource</h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Choose a creation method: Blank Canvas, MEXO AI, Curated Templates or CSV File Import
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-7">
            {/* 1. MEXO AI Generator Highlight Card */}
            <div
              onClick={() => setShowAiModal(true)}
              className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 z-10">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold backdrop-blur-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>MEXO AI Resource Engine</span>
                </div>
                <h3 className="text-xl font-black group-hover:translate-x-1 transition-transform">
                  Generate Resource with MEXO AI
                </h3>
                <p className="text-xs text-purple-100 max-w-lg leading-relaxed">
                  Enter any topic, paste notes, or upload a document to generate a complete quiz, assessment, or slide deck in seconds.
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center z-10 group-hover:scale-110 transition-transform shrink-0">
                <BrainCircuit className="w-8 h-8 text-yellow-300" />
              </div>
            </div>

            {/* 2. CURATED RESOURCE TEMPLATES SECTION */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Layout className="w-4 h-4 text-[#7C3AED]" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Select a Curated Resource Template
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curatedTemplates.map(tmpl => {
                  const Icon = tmpl.icon;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectCuratedTemplate(tmpl)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 hover:shadow-md hover:border-purple-300 bg-white group ${tmpl.color}`}
                    >
                      <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors truncate">
                            {tmpl.title}
                          </h5>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] shrink-0">
                            {tmpl.questionCount} Qs
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{tmpl.subject} · {tmpl.grade}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. CREATE BLANK RESOURCE GRID */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Create Blank Resource
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {blankCreationTypes.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectBlankType(opt.type)}
                      className="p-4 rounded-2xl border border-slate-200/80 hover:border-purple-300 hover:shadow-mexo-md transition-all text-left flex items-start space-x-3 bg-white hover:bg-purple-50/30 cursor-pointer group"
                    >
                      <div className={`p-2.5 rounded-2xl ${opt.color} group-hover:scale-105 transition-transform shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#7C3AED] transition-colors truncate">
                            {opt.title}
                          </h4>
                          {opt.badge && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] shrink-0">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{opt.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. BULK FILE IMPORT & CSV TEMPLATE */}
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Bulk File Import & CSV Template</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Upload your question spreadsheet directly or download our starter template.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadSampleCSV}
                  className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-[#7C3AED] font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-2xs group"
                >
                  <Download className="w-4 h-4 text-purple-600 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download Sample CSV Template</span>
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="p-3 rounded-2xl bg-[#7C3AED] hover:bg-purple-700 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import CSV / File Now</span>
                </button>
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
