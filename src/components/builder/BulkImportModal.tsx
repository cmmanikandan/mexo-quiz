import React, { useState, useRef } from 'react';
import { MexoModal } from '../common/MexoModal';
import { MexoButton } from '../common/MexoButton';
import { Question } from '../../types/quiz';
import { parseImportFile, ImportedQuestionItem, ImportParseResult } from '../../utils/importParser';
import { toast } from '../../services/toastService';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Download,
  FolderOpen,
  ArrowLeft,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface BulkImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (questions: Question[]) => void;
}

export const BulkImportModal: React.FC<BulkImportProps> = ({ isOpen, onClose, onImport }) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'mexo_forms' | 'txt'>('csv');
  const [rawContent, setRawContent] = useState('');
  const [error, setError] = useState('');
  const [parseResult, setParseResult] = useState<ImportParseResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [importProgressText, setImportProgressText] = useState('Importing quiz...');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate & Download Official MEXO Quiz Sample CSV Template
  const handleDownloadSampleCSV = () => {
    const csvContent =
      'Question Text,Question Type,Option A,Option B,Option C,Option D,Correct Option (A/B/C/D),Points,Explanation\n' +
      '"What does CPU stand for?",multiple_choice,"Central Processing Unit","Computer Personal Unit","Central Program Utility","Control Processing User","A",10,"CPU is the main processing unit."\n' +
      '"Which language structures web pages?",multiple_choice,"CSS","HTML","JavaScript","Python","B",10,"HTML provides the markup structure."\n' +
      '"The Earth orbits around the Sun.",true_false,"True","False","","","A",10,"Earth orbits Sun every 365 days."\n' +
      '"Which planet is known as the Red Planet?",multiple_choice,"Venus","Mars","Jupiter","Saturn","B",10,"Mars has iron oxide on its surface."';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'MEXO_Quiz_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle direct file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        setRawContent(text);
        if (file.name.endsWith('.csv')) setSelectedFormat('csv');
        else if (file.name.endsWith('.json')) setSelectedFormat('json');
        else if (file.name.endsWith('.txt')) setSelectedFormat('txt');
      }
    };
    reader.readAsText(file);
  };

  const handleParse = () => {
    setError('');

    if (!rawContent.trim()) {
      setError('Please select a file or paste content to import.');
      return;
    }

    const result = parseImportFile(rawContent, selectedFormat);

    if (result.questions.length === 0) {
      setError(result.warnings[0] || 'No valid questions could be extracted from the file.');
      return;
    }

    setParseResult(result);
    setStep('preview');
  };

  const handleSelectCorrectAnswerInPreview = (qId: string, optionId: string) => {
    if (!parseResult) return;

    const updatedQuestions = parseResult.questions.map(q => {
      if (q.id !== qId) return q;

      const updatedOptions = q.options.map(o => ({
        ...o,
        isCorrect: o.id === optionId,
      }));

      const matchedOpt = updatedOptions.find(o => o.id === optionId);

      return {
        ...q,
        options: updatedOptions,
        status: 'valid' as const,
        detectedAnswerLabel: matchedOpt ? matchedOpt.text : 'Valid',
        warningMessage: undefined,
      };
    });

    const validCount = updatedQuestions.filter(q => q.status === 'valid').length;
    const needsReviewCount = updatedQuestions.filter(q => q.status === 'needs_review').length;

    setParseResult({
      ...parseResult,
      questions: updatedQuestions,
      validCount,
      needsReviewCount,
    });
  };

  const handleConfirmImport = async () => {
    if (!parseResult) return;

    setStep('importing');
    setImportProgressText('Importing questions into database...');

    // Convert ImportedQuestionItem[] to standard Question[]
    const finalQuestions: Question[] = parseResult.questions.map(iq => ({
      id: iq.id,
      type: iq.type,
      title: iq.title,
      points: iq.points,
      options: iq.options,
      explanation: iq.explanation,
      isRequired: iq.isRequired,
    }));

    // Simulating atomic transaction progress
    setImportProgressText(`✓ ${finalQuestions.length} questions parsed and validated`);

    setTimeout(() => {
      onImport(finalQuestions);
      toast.success(
        '✓ Quiz imported successfully',
        `${finalQuestions.length} questions saved to Supabase.`
      );
      onClose();
    }, 400);
  };

  return (
    <MexoModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'upload'
          ? 'Import Questions to Quiz'
          : step === 'preview'
          ? 'Import Preview & Validation'
          : 'Saving Questions...'
      }
      maxWidth="lg"
    >
      {step === 'upload' ? (
        <div className="space-y-4 pt-1 select-none">
          {/* Header Action: Download Sample CSV Template */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-900">Need a CSV template format?</p>
              <p className="text-[11px] text-slate-500">
                Download our ready-to-use CSV template to structure your questions, choices, and answer keys.
              </p>
            </div>
            <button
              onClick={handleDownloadSampleCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Format Selector */}
          <div className="flex space-x-2 border-b border-slate-100 pb-3 overflow-x-auto">
            {[
              { id: 'csv', label: 'CSV / Excel', icon: FileSpreadsheet },
              { id: 'json', label: 'JSON Format', icon: FileCode },
              { id: 'mexo_forms', label: 'MEXO Forms', icon: FileText },
              { id: 'txt', label: 'TXT File', icon: FileText },
            ].map(fmt => {
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFormat === fmt.id
                      ? 'bg-purple-100 text-[#7C3AED] border border-purple-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{fmt.label}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload File or Paste Raw Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Select File OR Paste Content Below
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.json,.txt"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#7C3AED] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse File...</span>
              </button>
            </div>

            <textarea
              rows={7}
              value={rawContent}
              onChange={e => setRawContent(e.target.value)}
              placeholder={
                selectedFormat === 'csv'
                  ? 'Question Text,Question Type,Option A,Option B,Option C,Option D,Correct Option (A/B/C/D),Points,Explanation\n"What is H2O?",multiple_choice,"Water","CO2","NaCl","O2","A",10,"Water consists of H2O"'
                  : 'Paste JSON array or file contents here...'
              }
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#7C3AED]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <MexoButton variant="outline" size="sm" onClick={onClose}>
              Cancel
            </MexoButton>
            <MexoButton variant="purple" size="sm" onClick={handleParse} leftIcon={<Upload className="w-4 h-4" />}>
              Parse & Preview
            </MexoButton>
          </div>
        </div>
      ) : step === 'preview' ? (
        /* STEP 2: IMPORT PREVIEW & VALIDATION */
        <div className="space-y-4 pt-1 select-none">
          {/* Import Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Questions Found</p>
              <p className="text-lg font-black text-slate-900 mt-0.5">{parseResult?.questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Options Extracted</p>
              <p className="text-lg font-black text-blue-600 mt-0.5">{parseResult?.optionsCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Valid Answers</p>
              <p className="text-lg font-black text-emerald-600 mt-0.5">{parseResult?.validCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Needs Review</p>
              <p className={`text-lg font-black mt-0.5 ${parseResult?.needsReviewCount ? 'text-amber-600' : 'text-slate-400'}`}>
                {parseResult?.needsReviewCount}
              </p>
            </div>
          </div>

          {parseResult?.needsReviewCount! > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {parseResult?.needsReviewCount} question(s) need a correct answer selected before saving. Please assign their answer keys below.
              </span>
            </div>
          )}

          {/* Import Preview Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl max-w-full max-h-72">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="sticky top-0 bg-slate-100 z-10">
                <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px]">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3">Question</th>
                  <th className="p-3">Correct Answer</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {parseResult?.questions.map((q, idx) => {
                  const isNeedsReview = q.status === 'needs_review';
                  return (
                    <tr key={q.id} className={isNeedsReview ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}>
                      <td className="p-3 text-center font-mono font-bold text-slate-400">Q{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900 max-w-xs truncate">{q.title}</td>
                      <td className="p-3">
                        {isNeedsReview ? (
                          <select
                            onChange={e => handleSelectCorrectAnswerInPreview(q.id, e.target.value)}
                            defaultValue=""
                            className="py-1 px-2 text-xs rounded-xl bg-white border border-amber-300 font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            <option value="" disabled>
                              Select Correct Option...
                            </option>
                            {q.options.map(o => (
                              <option key={o.id} value={o.id}>
                                {o.text}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-semibold text-emerald-700">{q.detectedAnswerLabel}</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isNeedsReview ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold inline-flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Needs Review</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold inline-flex items-center space-x-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>✓ Valid</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Upload</span>
            </button>

            <MexoButton
              variant="purple"
              size="sm"
              onClick={handleConfirmImport}
              disabled={parseResult?.needsReviewCount! > 0}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Confirm & Save {parseResult?.questions.length} Questions
            </MexoButton>
          </div>
        </div>
      ) : (
        /* STEP 3: SAVING PROGRESS */
        <div className="py-12 text-center space-y-4 select-none">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-slate-900">{importProgressText}</p>
            <p className="text-xs text-slate-500">Writing relational questions and answer keys to Supabase...</p>
          </div>
        </div>
      )}
    </MexoModal>
  );
};
