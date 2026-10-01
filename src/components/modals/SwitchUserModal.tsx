import React, { useState } from 'react';
import { UserCheck, X, KeyRound, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { ALLOWED_USERS } from '../../services/firebase';
import { AllowedUser } from '../../types';
import { switchUserAccount } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface SwitchUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchedSuccess: () => void;
}

export const SwitchUserModal: React.FC<SwitchUserModalProps> = ({
  isOpen,
  onClose,
  onSwitchedSuccess,
}) => {
  const { user } = useAuth();
  const [selectedAdmin, setSelectedAdmin] = useState<AllowedUser | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const otherAdmins = ALLOWED_USERS.filter(
    (u) => u.email.toLowerCase() !== user?.email?.toLowerCase()
  );

  const handleSelectAdmin = (admin: AllowedUser) => {
    setSelectedAdmin(admin);
    setPassword('');
    setErrorMsg(null);
  };

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !password) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await switchUserAccount(selectedAdmin.email, password);
      onSwitchedSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify the target administrator password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#111724] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Switch Administrator Session</h2>
              <p className="text-xs text-slate-400">Secure re-authentication required to assume role</p>
            </div>
          </div>
          <button
            onClick={onClose}
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

          {!selectedAdmin ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Select Authorized Account to Switch Into:
              </div>
              <div className="space-y-2">
                {otherAdmins.map((admin) => (
                  <button
                    key={admin.email}
                    type="button"
                    onClick={() => handleSelectAdmin(admin)}
                    className="w-full p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-indigo-500/50 flex items-center justify-between transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold text-sm flex items-center justify-center shadow-md">
                        {admin.initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-indigo-300">
                          {admin.name}
                        </div>
                        <div className="text-xs text-slate-400">{admin.email}</div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                          Admin Role
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSwitchSubmit} className="space-y-4">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {selectedAdmin.initials}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{selectedAdmin.name}</div>
                    <div className="text-[11px] text-slate-400">{selectedAdmin.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enter Password for {selectedAdmin.name}</span>
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master password..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Full security validation is executed. Prevents unauthorized privilege escalation.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedAdmin(null)}
                  disabled={isLoading}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!password || isLoading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  Authenticate & Switch
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
