import React, { useState } from 'react';
import { MexoButton } from '../../components/common/MexoButton';
import { CertificateViewer } from '../../components/results/CertificateViewer';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Award, Download, Printer } from 'lucide-react';

export const StudentCertificatesPage: React.FC = () => {
  useDocumentTitle('My Certificates — MEXO Quiz');
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const certificates = [
    { id: 'c1', title: 'Quantum Physics & Particle Dynamics Scholar', date: 'August 5, 2026', score: 95 },
    { id: 'c2', title: 'JavaScript Master Developer Certificate', date: 'July 28, 2026', score: 90 },
    { id: 'c3', title: 'Global Explorer Certificate', date: 'July 15, 2026', score: 88 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Earned Certificates</h1>
        <p className="text-xs text-slate-500 mt-0.5">Verified academic credentials issued by MEXO Education Platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {certificates.map(cert => (
          <div key={cert.id} className="p-6 bg-white rounded-3xl border border-amber-200 shadow-mexo-card space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2">{cert.title}</h3>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">Score: {cert.score}% · Verified</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Issued: {cert.date}</p>
            </div>
            <MexoButton variant="purple" size="xs" onClick={() => setSelectedCert(cert)}>
              View Certificate
            </MexoButton>
          </div>
        ))}
      </div>

      {selectedCert && (
        <CertificateViewer
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          userName="MEXO Scholar"
          quizTitle={selectedCert.title}
          scorePercentage={selectedCert.score}
          completedAt={new Date().toISOString()}
        />
      )}
    </div>
  );
};
