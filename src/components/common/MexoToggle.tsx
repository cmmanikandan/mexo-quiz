import React from 'react';
import * as Switch from '@radix-ui/react-switch';

export interface MexoToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const MexoToggle: React.FC<MexoToggleProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between space-x-3 py-1">
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-xs font-semibold text-slate-800">{label}</span>}
          {description && <span className="text-[11px] text-slate-500">{description}</span>}
        </div>
      )}
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="w-11 h-6 bg-slate-200 rounded-full relative data-[state=checked]:bg-[#7C3AED] transition-colors cursor-pointer outline-none disabled:opacity-50"
      >
        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-150 translate-x-0.5 data-[state=checked]:translate-x-5.5" />
      </Switch.Root>
    </div>
  );
};
