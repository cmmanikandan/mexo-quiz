import React from 'react';
import { AlertTriangle, Save, LogOut, X, RefreshCw } from 'lucide-react';
import { MexoButton } from '../common/MexoButton';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  isSaving?: boolean;
  saveError?: string | null;
  onCancel: () => void;
  onSaveAndLeave: () => void;
  onLeaveWithoutSaving: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  isSaving = false,
  saveError = null,
  onCancel,
  onSaveAndLeave,
  onLeaveWithoutSaving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 relative overflow-hidden">
        {/* Top Warning Banner Accent */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-purple-500 to-indigo-600 absolute top-0 left-0 right-0" />

        <div className="flex items-start justify-between pt-1">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Unsaved changes</h3>
              <p className="text-xs text-slate-500 font-semibold">You have unsaved changes in this quiz.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          What would you like to do with your recent question and settings modifications?
        </p>

        {saveError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{saveError || "Couldn't save changes. Please check connection and try again."}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onLeaveWithoutSaving}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Without Saving</span>
          </button>

          <button
            onClick={onSaveAndLeave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Leave</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
