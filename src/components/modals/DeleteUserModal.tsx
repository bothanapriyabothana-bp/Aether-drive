import React, { useState } from 'react';
import { Trash2, X, AlertTriangle, KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { deleteUserAccount } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

interface DeleteUserModalProps {
  targetEmail: string | null;
  targetName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDeletedSuccess: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  targetEmail,
  targetName,
  isOpen,
  onClose,
  onDeletedSuccess,
}) => {
  const { user } = useAuth();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !targetEmail) return null;

  const isSelf = user?.email?.toLowerCase() === targetEmail.toLowerCase();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeleting(true);
    setErrorMsg(null);

    try {
      await deleteUserAccount(targetEmail, confirmPassword);
      onDeletedSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Operation halted. Could not complete administrator account deletion.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#111724] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20 bg-red-950/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Delete User?</h2>
              <p className="text-xs text-red-300">Permanent administrator account purge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleDelete} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
              <div>
                <strong className="block font-semibold">Action Blocked:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Target Account:</span>
              <strong className="text-white font-mono">{targetName} ({targetEmail})</strong>
            </div>
            <p className="text-amber-300/90 font-medium pt-1">
              "This permanently removes the user's account and associated cloud data. This action cannot be undone."
            </p>
            <p className="text-slate-400 text-[11px]">
              Purges Firebase Authentication credentials, personal vault files, active sessions, and metadata.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Confirm Password for Authorization</span>
            </label>
            <input
              type="password"
              required
              autoFocus
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter your current password..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmPassword || isDeleting}
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Confirm Permanent Deletion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
