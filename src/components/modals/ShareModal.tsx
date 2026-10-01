import React, { useState } from 'react';
import { Share2, X, Clock, Copy, Check, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { createShareLinkService } from '../../services/storageService';
import { FileItem, ShareLink } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ShareModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onShareCreated: (link: ShareLink) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  file,
  isOpen,
  onClose,
  onShareCreated,
}) => {
  const { user, profile } = useAuth();
  const [durationHours, setDurationHours] = useState<number>(24);
  const [createdShare, setCreatedShare] = useState<ShareLink | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const durationOptions = [
    { label: '1 Hour', value: 1 },
    { label: '24 Hours (1 Day)', value: 24 },
    { label: '7 Days', value: 168 },
    { label: '30 Days', value: 720 },
  ];

  const handleGenerateLink = async () => {
    if (!user || !profile) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const share = await createShareLinkService(file, durationHours, {
        email: user.email!,
        name: profile.name,
      });
      setCreatedShare(share);
      onShareCreated(share);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate secure link.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getShareUrl = (token: string) => {
    const origin = window.location.origin;
    return `${origin}/#share/${token}`;
  };

  const copyToClipboard = () => {
    if (!createdShare) return;
    navigator.clipboard.writeText(getShareUrl(createdShare.token));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setCreatedShare(null);
    setErrorMsg(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#111724] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Secure Share Link</h2>
              <p className="text-xs text-slate-400">Time-limited, revocable cryptographic access</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* File summary */}
          <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="truncate">
              <div className="text-sm font-semibold text-slate-100 truncate">{file.name}</div>
              <div className="text-xs text-slate-400">SHA-256: {file.checksum?.substring(0, 16)}...</div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 shrink-0">
              {file.securityTag || 'Internal'}
            </span>
          </div>

          {!createdShare ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Link Expiration Window</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDurationHours(opt.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        durationHours === opt.value
                          ? 'border-indigo-500 bg-indigo-500/10 text-white font-medium shadow-sm'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Expires in {opt.value >= 24 ? `${opt.value / 24}d` : `${opt.value}h`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs space-y-1 text-slate-300">
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Shield className="w-4 h-4" />
                  <span>Zero Credential Exposure</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Recipients will access the file via a signed, expiring token without revealing your Firebase Storage keys or personal credentials. You can revoke it anytime in Security &gt; Shared Links.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Secure sharing link generated successfully!</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Shareable Link (Expiring in {durationHours}h)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareUrl(createdShare.token)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {createdShare ? 'Done' : 'Cancel'}
          </button>
          {!createdShare && (
            <button
              type="button"
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              Generate Secure Link
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
