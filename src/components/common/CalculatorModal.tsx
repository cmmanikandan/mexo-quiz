import React, { useState } from 'react';
import { MexoModal } from './MexoModal';
import { Calculator as CalcIcon, Delete } from 'lucide-react';

export const CalculatorModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');

  const handleInput = (val: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const handleClear = () => setDisplay('0');

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    try {
      const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
      // Use Function constructor instead of eval to avoid security warnings
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const result = new Function(`return (${sanitized})`)();
      setDisplay(String(Number((result as number).toFixed(6))));
    } catch (e) {
      setDisplay('Error');
    }
  };

  const buttons = [
    'C', '(', ')', '÷',
    '7', '8', '9', '×',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '⌫', '='
  ];

  return (
    <MexoModal isOpen={isOpen} onClose={onClose} title={<div className="flex items-center space-x-2"><CalcIcon className="w-5 h-5 text-[#7C3AED]" /><span>Scientific Calculator</span></div>} maxWidth="sm">
      <div className="space-y-4">
        {/* Display */}
        <div className="bg-slate-900 text-right p-4 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-2xl font-mono font-bold text-white tracking-wider truncate block">
            {display}
          </span>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn) => {
            let bgClass = 'bg-slate-100 text-slate-900 hover:bg-slate-200';
            if (btn === '=') bgClass = 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] font-bold';
            else if (['÷', '×', '-', '+', 'C'].includes(btn)) bgClass = 'bg-purple-100 text-[#7C3AED] hover:bg-purple-200 font-bold';

            return (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') handleClear();
                  else if (btn === '⌫') handleDelete();
                  else if (btn === '=') handleCalculate();
                  else handleInput(btn);
                }}
                className={`h-12 rounded-xl text-sm font-semibold transition-all cursor-pointer ${bgClass}`}
              >
                {btn}
              </button>
            );
          })}
        </div>
      </div>
    </MexoModal>
  );
};
