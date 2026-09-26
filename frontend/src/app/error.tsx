'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
      <span className="text-6xl mb-4 select-none">⚠️</span>
      <h1 className="text-3xl font-extrabold text-foreground mb-2">Something Went Wrong</h1>
      <p className="text-xs text-foreground/50 mb-8 max-w-xs leading-relaxed">
        An unexpected error occurred during execution. Please attempt to reset the session.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
