import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SessionTimeoutModal: React.FC = () => {
  const { showTimeoutWarning, extendSession, lockSession } = useAuth();

  if (!showTimeoutWarning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#111724] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-center text-slate-200 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <h3 className="text-base font-bold text-white">Your session is about to expire</h3>
          <p className="text-xs text-slate-400 mt-1">
            Due to inactivity, AetherDrive will automatically lock your workspace in 60 seconds to protect confidential cloud data.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={lockSession}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock Now
          </button>
          <button
            onClick={extendSession}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};
