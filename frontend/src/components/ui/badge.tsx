import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export function Badge({ className = '', variant = 'primary', children, ...props }: BadgeProps) {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide';
  
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
