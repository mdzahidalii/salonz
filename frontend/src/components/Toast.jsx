import React from 'react';
import { useSalon } from '../context/SalonContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useSalon();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isError
                ? 'bg-[#FDF2F2] border-[#F8B4B4] text-[#9B1C1C]'
                : isInfo
                ? 'bg-[#F0F5FF] border-[#BFDBFE] text-[#1E429F]'
                : 'bg-[#FBF8F3] border-[#E5D7C7] text-[#4A2E1B]'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {isError ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : isInfo ? (
                <Info className="w-5 h-5 text-blue-600" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#8B5E3C]" />
              )}
            </div>

            <div className="flex-1 text-sm font-medium leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-stone-400 hover:text-stone-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

