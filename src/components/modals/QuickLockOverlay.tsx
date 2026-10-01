import React, { useState } from 'react';
import { Lock, KeyRound, Loader2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const QuickLockOverlay: React.FC = () => {
  const { isLocked, unlockSession, logout, user, profile } = useAuth();
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isLocked) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsVerifying(true);
    setErrorMsg(null);

    const success = await unlockSession(password);
    if (!success) {
      setErrorMsg('Incorrect password. Please try again.');
    } else {
      setPassword('');
    }
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#070a10]/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111724] border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Shield / Lock Graphic */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-pulse" />
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AetherDrive is Locked</h2>
          <p className="text-xs text-slate-400 mt-1">
            Session security lock engaged for <strong className="text-slate-200">{profile?.name || user?.email}</strong>
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Enter Password to Resume</span>
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={!password || isVerifying}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
          >
            {isVerifying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            Unlock Workspace
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Entirely</span>
          </button>
        </div>
      </div>
    </div>
  );
};
