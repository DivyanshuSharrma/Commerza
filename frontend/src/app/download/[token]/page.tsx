'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DownloadInfo {
  id: string;
  productTitle: string;
  status: string;
  expiresAt: string;
  downloadCount: number;
  downloadLimit: number;
  isExpired: boolean;
  isLimitExceeded: boolean;
  isPaid: boolean;
}

export default function DownloadPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [info, setInfo] = React.useState<DownloadInfo | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  React.useEffect(() => {
    if (!token) return;

    fetch(`${apiUrl}/download/info/${token}`)
      .then((res) => {
        if (res.status === 404) throw new Error('invalid_token');
        if (!res.ok) throw new Error('fetch_error');
        return res.json();
      })
      .then((body) => {
        setInfo(body.data);
      })
      .catch((err) => {
        if (err.message === 'invalid_token') {
          setError('invalid_token');
        } else {
          setError('fetch_error');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleDownload = () => {
    if (!token || downloading) return;
    setDownloading(true);
    
    // Redirect browser to download route directly
    // This triggers raw binary stream download directly in the browser
    window.location.href = `${apiUrl}/download/d/${token}`;
    
    // Set download confirmation status
    setTimeout(() => {
      setDownloaded(true);
      setDownloading(false);
      
      // Refresh info to decrement remaining downloads
      fetch(`${apiUrl}/download/info/${token}`)
        .then((res) => res.json())
        .then((body) => {
          if (body.data) setInfo(body.data);
        })
        .catch(() => {});
    }, 2000);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-pulse">
        <div className="h-8 bg-foreground/10 rounded w-1/3 mb-6"></div>
        <div className="h-48 bg-foreground/5 rounded-2xl w-full"></div>
      </div>
    );
  }

  // State 1: Invalid Token State
  if (error === 'invalid_token' || !info) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <span className="text-5xl mb-4 select-none">❌</span>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Invalid Download Link</h1>
        <p className="text-xs text-foreground/50 max-w-sm mb-8 leading-relaxed">
          The security token in this link is invalid or has been modified. Please confirm the link URL from your confirmation email.
        </p>
        <Button onClick={() => router.push('/')}>Return to Store</Button>
      </div>
    );
  }

  // State 2: Unpaid Order State
  if (!info.isPaid) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <span className="text-5xl mb-4 select-none">💳</span>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Payment Verification Required</h1>
        <p className="text-xs text-foreground/50 max-w-sm mb-8 leading-relaxed">
          This order has not been completed. If you have already completed checkout, please wait a minute and refresh the page.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Status</Button>
      </div>
    );
  }

  // State 3: Expired Token State
  if (info.isExpired) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <span className="text-5xl mb-4 select-none">⏳</span>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Download Link Expired</h1>
        <p className="text-xs text-foreground/50 max-w-sm mb-6 leading-relaxed">
          This download link expired on <strong className="text-foreground">{formatDate(info.expiresAt)}</strong>. Please request a link regeneration.
        </p>
        <Card className="p-5 bg-card w-full max-w-sm mb-8">
          <h4 className="text-xs font-bold text-foreground mb-2 text-left">Regenerate Link</h4>
          <p className="text-[11px] text-foreground/60 text-left mb-4">
            Enter your order email address below to request a new secure link.
          </p>
          <Button className="w-full py-2 text-xs font-bold" onClick={() => router.push('/')}>
            Contact Support for Help
          </Button>
        </Card>
        <Button variant="outline" onClick={() => router.push('/')}>Return to Catalog</Button>
      </div>
    );
  }

  // State 4: Limit Exceeded State
  if (info.isLimitExceeded) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <span className="text-5xl mb-4 select-none">⚠️</span>
        <h1 className="text-2xl font-extrabold text-foreground mb-2">Download Limit Exceeded</h1>
        <p className="text-xs text-foreground/50 max-w-sm mb-8 leading-relaxed">
          You have reached the maximum download limit of <strong className="text-foreground">{info.downloadLimit}</strong> attempts for this item.
        </p>
        <p className="text-xs text-foreground/60 mb-6">
          If you need to reset your download link or need assistance, please contact support.
        </p>
        <Button variant="outline" onClick={() => router.push('/')}>Return to Catalog</Button>
      </div>
    );
  }

  const remaining = Math.max(0, info.downloadLimit - info.downloadCount);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 inline-block select-none">📥</span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Your Digital File is Ready</h1>
        <p className="text-xs text-foreground/50 mt-2">Download your product files securely below.</p>
      </div>

      <Card className="p-6 bg-card mb-8">
        <h3 className="font-bold text-foreground text-lg mb-4 truncate">{info.productTitle}</h3>
        
        <div className="space-y-3.5 text-xs text-foreground/75">
          <div className="flex justify-between pb-3 border-b border-border/50">
            <span>Remaining Downloads:</span>
            <span className="font-bold text-foreground">{remaining} of {info.downloadLimit}</span>
          </div>
          <div className="flex justify-between pb-3 border-b border-border/50">
            <span>Expires On:</span>
            <span className="font-semibold text-foreground">{formatDate(info.expiresAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>File Type:</span>
            <span className="font-semibold text-foreground">Digital Zip/Archive</span>
          </div>
        </div>
      </Card>

      {downloaded && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-4 rounded-xl text-center mb-6 text-xs font-semibold animate-in zoom-in-95 duration-200">
          ✓ Download triggered successfully! If the download didn't start, please click the button again.
        </div>
      )}

      <div className="space-y-4">
        <Button
          className="w-full py-4 text-base font-bold shadow-md cursor-pointer"
          onClick={handleDownload}
          isLoading={downloading}
          disabled={downloading || remaining === 0}
        >
          Download File
        </Button>
        <p className="text-[10px] text-foreground/45 text-center leading-relaxed">
          Please download your file using a stable internet connection. Sharing download links is strictly prohibited.
        </p>
      </div>
    </div>
  );
}
