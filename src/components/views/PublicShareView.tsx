import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Download,
  ShieldCheck,
  Clock,
  Lock,
  FileText,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { getShareLinkByToken, formatBytes } from '../../services/storageService';
import { ShareLink } from '../../types';

interface PublicShareViewProps {
  token: string;
  onGoHome: () => void;
}

export const PublicShareView: React.FC<PublicShareViewProps> = ({ token, onGoHome }) => {
  const [shareData, setShareData] = useState<ShareLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const loadShare = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const link = await getShareLinkByToken(token);
        if (!link) {
          setError('This share link does not exist or has been permanently removed.');
          return;
        }

        if (!link.active) {
          setError('This share link has been revoked by the administrator.');
          return;
        }

        if (link.expiresAt < Date.now()) {
          setError('This share link has expired.');
          return;
        }

        setShareData(link);
        if (!link.passwordHash) {
          setIsPasswordUnlocked(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve shared file.');
      } finally {
        setIsLoading(false);
      }
    };

    loadShare();
  }, [token]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareData) return;
    if (shareData.passwordHash && password !== shareData.passwordHash) {
      setPasswordError('Incorrect password for this shared resource.');
      return;
    }
    setIsPasswordUnlocked(true);
    setPasswordError(null);
  };

  const handleDownload = () => {
    if (!shareData?.storageUrl) return;
    const a = document.createElement('a');
    a.href = shareData.storageUrl;
    a.download = shareData.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-slate-200">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
        <p className="text-xs text-slate-400">Verifying secure token authorization...</p>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="max-w-md w-full bg-[#0C0C0E] border border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Access Unavailable</h2>
            <p className="text-xs text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Return to AetherDrive Home
          </button>
        </div>
      </div>
    );
  }

  if (!isPasswordUnlocked) {
    return (
      <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-6 text-slate-200">
        <div className="max-w-md w-full bg-[#0C0C0E] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Password Protected File</h2>
            <p className="text-xs text-slate-400">
              Enter the passcode set by <strong className="text-slate-200">{shareData.createdByName}</strong> to download <strong>{shareData.fileName}</strong>
            </p>
          </div>

          {passwordError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg shadow-blue-900/20"
            >
              Unlock & Access File
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col justify-between p-6 text-slate-200">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <HardDrive className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white">AetherDrive Secure Transfer</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-green-500 font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>E2EE Encrypted Link</span>
        </div>
      </div>

      {/* Main Shared File Card */}
      <div className="max-w-xl w-full mx-auto my-8">
        <div className="bg-[#0C0C0E] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-white truncate">{shareData.fileName}</h1>
              <div className="text-xs text-slate-400 mt-1">
                Shared by <strong className="text-slate-200">{shareData.createdByName}</strong>
              </div>
            </div>
          </div>

          {/* Details Table */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">File Size:</span>
              <span className="font-mono font-semibold text-white">
                {formatBytes(shareData.fileSize)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Expiration Window:</span>
              <span className="font-mono text-amber-400">
                {new Date(shareData.expiresAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Integrity Digest:</span>
              <span className="font-mono text-blue-400 text-[11px]">
                {shareData.fileChecksum ? `SHA-256: ${shareData.fileChecksum.substring(0, 16)}...` : 'Verified'}
              </span>
            </div>
          </div>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download File ({formatBytes(shareData.fileSize)})
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-600">
        AetherDrive Zero-Knowledge Cloud Storage Infrastructure
      </div>
    </div>
  );
};
