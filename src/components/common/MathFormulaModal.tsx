import React from 'react';
import { MexoModal } from './MexoModal';
import { BookOpen } from 'lucide-react';

export const MathFormulaModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const categories = [
    {
      title: 'Algebra & Quadratic',
      formulas: [
        { label: 'Quadratic Formula', code: 'x = (-b ± √(b² - 4ac)) / 2a' },
        { label: 'Binomial Theorem', code: '(a + b)ⁿ = ∑ (n k) aⁿ⁻ᵏ bᵏ' },
        { label: 'Logarithm Product Rule', code: 'log_b(m · n) = log_b(m) + log_b(n)' },
      ],
    },
    {
      title: 'Trigonometry',
      formulas: [
        { label: 'Pythagorean Identity', code: 'sin²(θ) + cos²(θ) = 1' },
        { label: 'Law of Sines', code: 'a / sin(A) = b / sin(B) = c / sin(C)' },
        { label: 'Law of Cosines', code: 'c² = a² + b² - 2ab cos(C)' },
      ],
    },
    {
      title: 'Calculus & Physics',
      formulas: [
        { label: 'Derivative Power Rule', code: 'd/dx [xⁿ] = n · xⁿ⁻¹' },
        { label: 'Mass-Energy Equivalence', code: 'E = m c²' },
        { label: 'Schrödinger Equation', code: '- (ℏ² / 2m) ∇² Ψ + V Ψ = E Ψ' },
        { label: 'Planck Energy Relation', code: 'E = h ν' },
      ],
    },
  ];

  return (
    <MexoModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center space-x-2"><BookOpen className="w-5 h-5 text-[#0878E8]" /><span>Formula Sheet & Reference</span></div>} maxWidth="lg">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {categories.map(cat => (
          <div key={cat.title} className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-[#7C3AED]">{cat.title}</h4>
            <div className="space-y-2">
              {cat.formulas.map(f => (
                <div key={f.label} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">{f.label}</span>
                  <span className="font-mono text-xs bg-white border border-slate-200 px-2.5 py-1 rounded-lg font-bold text-slate-900 shadow-2xs">
                    {f.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MexoModal>
  );
};
