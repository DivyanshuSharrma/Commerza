'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface AuthCardProps {
  onAuthenticated: (token: string, customer: { id: string; email: string; name?: string }) => void;
  initialToken?: string | null;
  initialEmail?: string | null;
}

export function AuthCard({ onAuthenticated, initialToken, initialEmail }: AuthCardProps) {
  const [email, setEmail] = React.useState(initialEmail || '');
  const [otp, setOtp] = React.useState('');
  const [step, setStep] = React.useState<'email' | 'otp'>(initialToken ? 'otp' : 'email');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  // Auto-verify if user arrives via 1-click magic link query params
  React.useEffect(() => {
    if (initialToken && initialEmail) {
      setLoading(true);
      fetch(`${apiUrl}/customer-portal/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: initialEmail, token: initialToken }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Magic link has expired or is invalid.');
          return res.json();
        })
        .then((body) => {
          if (body.data?.accessToken) {
            onAuthenticated(body.data.accessToken, body.data.customer);
          }
        })
        .catch((err) => {
          setError(err.message || 'Magic link verification failed.');
        })
        .finally(() => setLoading(false));
    }
  }, [initialToken, initialEmail]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch(`${apiUrl}/customer-portal/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Failed to request login code.');
      }

      setStep('otp');
      setInfo('We have dispatched a 6-digit access code and magic link to your email.');
    } catch (err: any) {
      setError(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/customer-portal/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: otp.trim(),
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Invalid or expired verification code.');
      }

      if (body.data?.accessToken) {
        onAuthenticated(body.data.accessToken, body.data.customer);
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto p-8 bg-card border-border/80 shadow-xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-lg select-none shadow-sm">
          📦
        </div>
        <h2 className="text-2xl font-black text-foreground tracking-tight">Customer Digital Vault</h2>
        <p className="text-xs text-foreground/60 leading-relaxed">
          {step === 'email'
            ? 'Access your purchased software codebases, lifetime download vaults, and tax invoices.'
            : `Enter the 6-digit verification code sent to ${email}.`}
        </p>
      </div>

      {info && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs leading-relaxed">
          {info}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed">
          {error}
        </div>
      )}

      {step === 'email' ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Purchase Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={loading}
          />
          <Button
            type="submit"
            className="w-full py-3 text-xs font-bold shadow-sm cursor-pointer"
            isLoading={loading}
            disabled={loading || !email.trim()}
          >
            Send Access Code &rarr;
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <Input
            label="6-Digit Verification Code"
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            disabled={loading}
            className="text-center font-mono tracking-widest text-lg font-bold"
          />
          <Button
            type="submit"
            className="w-full py-3 text-xs font-bold shadow-sm cursor-pointer"
            isLoading={loading}
            disabled={loading || otp.trim().length !== 6}
          >
            Unlock My Digital Vault
          </Button>
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setError(null);
                setInfo(null);
              }}
              className="text-[11px] text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
            >
              Use a different email address
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}
