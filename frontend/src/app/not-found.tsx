import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
      <span className="text-6xl mb-4 select-none">🗺️</span>
      <h1 className="text-3xl font-extrabold text-foreground mb-2">Page Not Found</h1>
      <p className="text-xs text-foreground/50 mb-8 max-w-xs leading-relaxed">
        The page you are looking for doesn't exist or has been relocated. Let's get you back to the catalog.
      </p>
      <Link href="/">
        <Button>Return to Store</Button>
      </Link>
    </div>
  );
}
