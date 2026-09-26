import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-foreground/75 tracking-wide">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full px-3.5 py-2.5 bg-card border ${
            error ? 'border-red-500 focus-visible:ring-red-500/50' : 'border-border focus-visible:ring-primary/50'
          } rounded-xl text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 text-sm transition-all ${className}`}
          {...props}
        />
        {error && (
          <p className="text-xs font-medium text-red-500 animate-in fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
