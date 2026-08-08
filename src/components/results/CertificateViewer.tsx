import React from 'react';
import { MexoModal } from '../common/MexoModal';
import { MexoButton } from '../common/MexoButton';
import { Award, Download, Printer, CheckCircle2 } from 'lucide-react';

interface CertificateProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  quizTitle: string;
  scorePercentage: number;
  completedAt: string;
}

export const CertificateViewer: React.FC<CertificateProps> = ({
  isOpen,
  onClose,
  userName,
  quizTitle,
  scorePercentage,
  completedAt,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <MexoModal isOpen={isOpen} onClose={onClose} title="Official MEXO Certificate of Completion" maxWidth="4xl">
      <div className="space-y-6 pt-2 select-none">
        {/* Certificate Frame */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-purple-50 border-8 border-double border-amber-300 shadow-2xl text-center space-y-6 relative overflow-hidden">
          {/* Watermark / Logo background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <img src="/logo.png" alt="MEXO" className="w-80 h-80 object-contain" />
          </div>

          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg mb-2">
              <Award className="w-10 h-10" />
            </div>
            <h2 className="text-xs font-extrabold text-amber-700 uppercase tracking-widest">
              Certificate of Academic Excellence
            </h2>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider">MEXO Education Ecosystem</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-slate-500 italic">This is proudly awarded to</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {userName}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              for successfully completing and mastering the curriculum assessment
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-amber-200 max-w-lg mx-auto shadow-sm">
            <h4 className="text-lg font-extrabold text-[#7C3AED]">{quizTitle}</h4>
            <p className="text-xs font-bold text-emerald-600 mt-1">
              Distinction Grade: {scorePercentage}% Score
            </p>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-amber-200 max-w-lg mx-auto text-left text-xs">
            <div>
              <p className="font-mono text-slate-500 text-[10px]">Issued on: {new Date(completedAt).toLocaleDateString()}</p>
              <p className="font-mono text-slate-400 text-[10px]">ID: CERT-MEXO-{Date.now().toString(36).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <div className="h-8 border-b border-slate-900 font-serif italic font-bold text-slate-900 px-2">
                Dr. Evelyn Vance
              </div>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">MEXO Academic Board</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end space-x-3">
          <MexoButton variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Print Certificate
          </MexoButton>
          <MexoButton variant="purple" size="sm" onClick={() => alert('Certificate downloaded as PDF!')} leftIcon={<Download className="w-4 h-4" />}>
            Download PDF
          </MexoButton>
        </div>
      </div>
    </MexoModal>
  );
};
