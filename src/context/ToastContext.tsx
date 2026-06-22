import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
      
      {/* Toast Container - fixed to top-right with stack styling */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-zinc-200 text-zinc-900';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            Icon = CheckCircle;
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-50 border-rose-200 text-rose-900';
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50 border-amber-200 text-amber-900';
            Icon = AlertTriangle;
            iconColor = 'text-amber-550';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-lg pointer-events-auto transition-all duration-300 transform translate-x-0 animate-in slide-in-from-right-full duration-200 ${bgClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-xs font-semibold leading-5">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-zinc-650 transition-colors p-0.5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
