import * as React from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    info: 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900',
  };

  const icons = {
    success: '✓',
    error: '⚠️',
    info: 'ℹ',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-white/10 animate-in slide-in-from-bottom-5 duration-300 font-medium ${typeStyles[type]}`}>
      <span>{icons[type]}</span>
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-3 font-bold bg-white/20 hover:bg-white/30 w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer text-[10px]"
      >
        ✕
      </button>
    </div>
  );
}
