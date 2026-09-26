'use client';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({ email, setEmail, password, setPassword, onSubmit }: LoginFormProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="bg-card border border-border w-full max-w-md p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">
          Commerza Admin Portal
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:opacity-90 text-white font-bold py-2 rounded-lg transition-colors cursor-pointer text-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
