import React, { useState, useRef } from 'react';
import { MexoModal } from '../common/MexoModal';
import { MexoButton } from '../common/MexoButton';
import { Question } from '../../types/quiz';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Download,
  FolderOpen,
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
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate & Download Official MEXO Quiz Sample CSV Template
  const handleDownloadSampleCSV = () => {
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
    setSuccessCount(null);

    if (!rawContent.trim()) {
      setError('Please select a file or paste content to import.');
      return;
    }

    try {
      const parsedQuestions: Question[] = [];

      if (selectedFormat === 'json' || selectedFormat === 'mexo_forms') {
        const parsed = JSON.parse(rawContent);
        const items = Array.isArray(parsed) ? parsed : parsed.questions || parsed.fields || [];
        items.forEach((item: any, i: number) => {
          parsedQuestions.push({
            id: `q-imp-${Date.now()}-${i}`,
            type: item.type || 'multiple_choice',
            title: item.title || item.label || item.question || `Imported Question ${i + 1}`,
            points: item.points || 10,
            options: (item.options || ['Option A', 'Option B']).map((opt: any, idx: number) => ({
              id: `opt-${idx}`,
              text: typeof opt === 'string' ? opt : opt.text || opt.label,
              isCorrect: typeof opt === 'object' ? !!opt.isCorrect : idx === 0,
            })),
            explanation: item.explanation || '',
            isRequired: true,
          });
        });
      } else {
        // Robust CSV / TXT Parser
        const lines = rawContent
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);

        // Skip header if line 1 starts with "Question"
        const startIndex = lines[0]?.toLowerCase().includes('question text') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i];
          // Regex matching CSV values while handling quoted strings containing commas
          const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

          if (cleanParts.length === 0 || !cleanParts[0]) continue;

          const title = cleanParts[0];
          const qType = cleanParts[1] === 'true_false' ? 'true_false' : 'multiple_choice';

          const optA = cleanParts[2] || 'Option A';
          const optB = cleanParts[3] || 'Option B';
          const optC = cleanParts[4] || '';
          const optD = cleanParts[5] || '';
          const correctKey = (cleanParts[6] || 'A').toUpperCase();
          const points = parseInt(cleanParts[7], 10) || 10;
          const explanation = cleanParts[8] || '';

          const optionsList = [
            { id: 'opt-a', text: optA, isCorrect: correctKey === 'A' || correctKey === '1' },
            { id: 'opt-b', text: optB, isCorrect: correctKey === 'B' || correctKey === '2' },
          ];

          if (optC) {
            optionsList.push({
              id: 'opt-c',
              text: optC,
              isCorrect: correctKey === 'C' || correctKey === '3',
            });
          }
          if (optD) {
            optionsList.push({
              id: 'opt-d',
              text: optD,
              isCorrect: correctKey === 'D' || correctKey === '4',
            });
          }

          // If no option is marked correct, default first option
          if (!optionsList.some(o => o.isCorrect)) {
            optionsList[0].isCorrect = true;
          }

          parsedQuestions.push({
            id: `q-imp-${Date.now()}-${i}`,
            type: qType,
            title,
            points,
            options: optionsList,
            explanation,
            isRequired: true,
          });
        }
      }

      if (parsedQuestions.length === 0) {
        setError('No valid questions could be extracted from the file.');
        return;
      }

      setSuccessCount(parsedQuestions.length);
      setTimeout(() => {
        onImport(parsedQuestions);
        onClose();
      }, 1000);
    } catch (e: any) {
      setError(`Parsing error: ${e.message || 'Invalid format'}`);
    }
  };

  return (
    <MexoModal isOpen={isOpen} onClose={onClose} title="Import Questions to Quiz" maxWidth="lg">
      <div className="space-y-4 pt-1">
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

        {successCount !== null && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Successfully extracted & imported {successCount} questions!</span>
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
            Parse & Import Questions
          </MexoButton>
        </div>
      </div>
    </MexoModal>
  );
};
