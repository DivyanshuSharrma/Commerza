import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-card border border-border rounded-2xl shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
