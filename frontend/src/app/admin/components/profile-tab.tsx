'use client';

import { useState, useEffect } from 'react';

interface ProfileTabProps {
  adminUser: {
    name: string;
    email: string;
  };
  onUpdate: (data: any) => Promise<boolean>;
}

export function ProfileTab({ adminUser, onUpdate }: ProfileTabProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync loaded user credentials
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: adminUser.name || '',
      email: adminUser.email || '',
    }));
  }, [adminUser]);

  // Compute password match
  const passwordsMatch = form.newPassword === form.confirmPassword;
  
  // Compute password strength
  const passwordStrength = {
    length: form.newPassword.length >= 8,
    hasNumber: /\d/.test(form.newPassword),
    hasLetter: /[a-zA-Z]/.test(form.newPassword),
  };

  const isPasswordValid = 
    !form.newPassword || 
    (passwordStrength.length && passwordStrength.hasNumber && passwordStrength.hasLetter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form.newPassword) {
      if (!form.currentPassword) {
        setErrorMsg('Current password is required to change password');
        return;
      }
      if (!passwordsMatch) {
        setErrorMsg('New password and password confirmation do not match');
        return;
      }
      if (!isPasswordValid) {
        setErrorMsg('New password does not meet strength requirements');
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
      };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }

      const success = await onUpdate(payload);
      if (success) {
        setForm((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-3xl font-extrabold text-foreground">Admin Profile Settings</h2>
      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2.5 rounded-lg text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Admin Full Name
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Admin Email Address (Updates login credential)
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div className="border-t border-border pt-4 mt-2 space-y-4">
          <h3 className="text-sm font-bold text-foreground">Change Password</h3>
          
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Minimum 8 characters (letters + numbers)"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {form.newPassword && (
              <div className="mt-2 space-y-1">
                <p className="text-[11px] font-medium text-foreground/50">Requirements:</p>
                <ul className="text-[11px] space-y-0.5">
                  <li className={passwordStrength.length ? 'text-green-500 font-semibold' : 'text-red-500'}>
                    {passwordStrength.length ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={passwordStrength.hasLetter ? 'text-green-500 font-semibold' : 'text-red-500'}>
                    {passwordStrength.hasLetter ? '✓' : '✗'} Contains a letter
                  </li>
                  <li className={passwordStrength.hasNumber ? 'text-green-500 font-semibold' : 'text-red-500'}>
                    {passwordStrength.hasNumber ? '✓' : '✗'} Contains a number
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {form.confirmPassword && (
              <p className={`text-[11px] mt-1 font-semibold ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          {form.newPassword && (
            <div>
              <label className="block text-xs font-semibold text-red-500 mb-1">
                Verify Current Password (Required to apply password change)
              </label>
              <input
                type="password"
                required={!!form.newPassword}
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                placeholder="Enter current password"
                className="w-full px-3 py-2 bg-background border border-red-500/35 focus:border-red-500 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || (!!form.newPassword && (!passwordsMatch || !isPasswordValid))}
          className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
        >
          {saving ? 'Updating profile...' : 'Save Profile Credentials'}
        </button>
      </form>
    </div>
  );
}
