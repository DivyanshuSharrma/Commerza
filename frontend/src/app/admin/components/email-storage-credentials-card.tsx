'use client';

interface EmailStorageCredentialsCardProps {
  emailProvider: string;
  storageProvider: string;
  form: {
    resend_api_key: string;
    smtp_host: string;
    smtp_port: string;
    smtp_user: string;
    smtp_pass: string;
    aws_access_key_id: string;
    aws_secret_access_key: string;
    aws_bucket_name: string;
    aws_region: string;
    aws_endpoint: string;
  };
  updateField: (key: string, value: string) => void;
  showSecrets: Record<string, boolean>;
  toggleShowSecret: (field: string) => void;
}

export function EmailStorageCredentialsCard({
  emailProvider,
  storageProvider,
  form,
  updateField,
  showSecrets,
  toggleShowSecret,
}: EmailStorageCredentialsCardProps) {
  return (
    <>
      {/* Resend Email Credentials */}
      {emailProvider === 'RESEND' && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>✉️</span> Resend Transactional Email API Key
            </h3>
            <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
              AES-256 Encrypted
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Resend API Key (re_...)
            </label>
            <div className="relative">
              <input
                type={showSecrets['resend_api_key'] ? 'text' : 'password'}
                value={form.resend_api_key}
                onChange={(e) => updateField('resend_api_key', e.target.value)}
                placeholder="re_xxxxxxxxxxxxxx"
                className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => toggleShowSecret('resend_api_key')}
                className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
              >
                {showSecrets['resend_api_key'] ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMTP Email Credentials */}
      {emailProvider === 'SMTP' && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>📬</span> Custom SMTP Gateway Coordinates
            </h3>
            <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
              AES-256 Encrypted
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                SMTP Hostname
              </label>
              <input
                type="text"
                value={form.smtp_host}
                onChange={(e) => updateField('smtp_host', e.target.value)}
                placeholder="smtp.example.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Port
              </label>
              <input
                type="text"
                value={form.smtp_port}
                onChange={(e) => updateField('smtp_port', e.target.value)}
                placeholder="587"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Username
              </label>
              <input
                type="text"
                value={form.smtp_user}
                onChange={(e) => updateField('smtp_user', e.target.value)}
                placeholder="smtp-user@domain.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showSecrets['smtp_pass'] ? 'text' : 'password'}
                  value={form.smtp_pass}
                  onChange={(e) => updateField('smtp_pass', e.target.value)}
                  placeholder="Enter SMTP password"
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('smtp_pass')}
                  className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
                >
                  {showSecrets['smtp_pass'] ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Storage Credentials (S3 / R2) */}
      {(storageProvider === 'S3' || storageProvider === 'R2') && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <span>☁️</span> {storageProvider === 'R2' ? 'Cloudflare R2' : 'Amazon S3'} Credentials
            </h3>
            <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
              AES-256 Encrypted
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Access Key ID
              </label>
              <input
                type="text"
                value={form.aws_access_key_id}
                onChange={(e) => updateField('aws_access_key_id', e.target.value)}
                placeholder="AKIA..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Secret Access Key
              </label>
              <div className="relative">
                <input
                  type={showSecrets['aws_secret_access_key'] ? 'text' : 'password'}
                  value={form.aws_secret_access_key}
                  onChange={(e) => updateField('aws_secret_access_key', e.target.value)}
                  placeholder="Enter secret access key"
                  className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => toggleShowSecret('aws_secret_access_key')}
                  className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
                >
                  {showSecrets['aws_secret_access_key'] ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Bucket Name
              </label>
              <input
                type="text"
                value={form.aws_bucket_name}
                onChange={(e) => updateField('aws_bucket_name', e.target.value)}
                placeholder="commerza-vault"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Region
              </label>
              <input
                type="text"
                value={form.aws_region}
                onChange={(e) => updateField('aws_region', e.target.value)}
                placeholder="us-east-1 (or auto for R2)"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          {storageProvider === 'R2' && (
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Cloudflare R2 Endpoint URL
              </label>
              <input
                type="text"
                value={form.aws_endpoint}
                onChange={(e) => updateField('aws_endpoint', e.target.value)}
                placeholder="https://<account_id>.r2.cloudflarestorage.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
