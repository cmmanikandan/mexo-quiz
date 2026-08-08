import React, { useState } from 'react';
import { MexoModal } from '../common/MexoModal';
import { MexoButton } from '../common/MexoButton';
import { Question } from '../../types/quiz';
import { Upload, FileText, FileSpreadsheet, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

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

  const handleParse = () => {
    setError('');
    setSuccessCount(null);

    if (!rawContent.trim()) {
      setError('Please paste file text or upload content.');
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
              isCorrect: idx === 0,
            })),
            isRequired: true,
          });
        });
      } else {
        // CSV or TXT line parser
        const lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
        lines.forEach((line, i) => {
          const parts = line.split(',');
          const title = parts[0] || `Question ${i + 1}`;
          const optionsText = parts.slice(1);
          parsedQuestions.push({
            id: `q-imp-${Date.now()}-${i}`,
            type: 'multiple_choice',
            title,
            points: 10,
            options: (optionsText.length > 0 ? optionsText : ['True', 'False']).map((opt, idx) => ({
              id: `opt-${idx}`,
              text: opt.trim(),
              isCorrect: idx === 0,
            })),
            isRequired: true,
          });
        });
      }

      if (parsedQuestions.length === 0) {
        setError('No valid questions could be extracted.');
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
        <div className="flex space-x-2 border-b border-slate-100 pb-3">
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
            <span>Successfully imported {successCount} questions!</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Paste File Content or Data (CSV line format: Question, Option1, Option2...)
          </label>
          <textarea
            rows={8}
            value={rawContent}
            onChange={e => setRawContent(e.target.value)}
            placeholder={
              selectedFormat === 'csv'
                ? 'What is H2O?, Water, Oxygen, Hydrogen\nCapital of France?, Paris, London, Rome'
                : 'Paste JSON array or MEXO Forms export data here...'
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
