import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconX
} from '@tabler/icons-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-[#4C97DB]/40 bg-white text-[#263445]';
        let icon = <IconInfoCircle className="w-5 h-5 text-[#4C97DB] shrink-0" stroke={1.75} />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-white text-[#263445]';
          icon = <IconCircleCheck className="w-5 h-5 text-emerald-600 shrink-0" stroke={1.75} />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-white text-[#263445]';
          icon = <IconAlertTriangle className="w-5 h-5 text-amber-600 shrink-0" stroke={1.75} />;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 bg-white text-[#263445]';
          icon = <IconAlertCircle className="w-5 h-5 text-rose-600 shrink-0" stroke={1.75} />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight text-[#263445]">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-[#718096] mt-1 leading-snug">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#718096] hover:text-[#263445] transition-colors p-1 rounded-lg"
              aria-label="Fermer la notification"
            >
              <IconX className="w-4 h-4" stroke={1.75} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
