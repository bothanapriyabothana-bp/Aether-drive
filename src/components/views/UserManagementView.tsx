import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Trash2,
  Lock,
  Mail,
  Key,
  Calendar,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { ALLOWED_USERS } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { DeleteUserModal } from '../modals/DeleteUserModal';

interface UserManagementViewProps {
  onOpenSwitchUser: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onOpenSwitchUser }) => {
  const { user } = useAuth();
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<(typeof ALLOWED_USERS)[0] | null>(null);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800/40">
              Dual-Admin Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Governed access control restricted to authorized enterprise administrators
          </p>
        </div>

        <button
          onClick={onOpenSwitchUser}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
        >
          <UserCheck className="w-4 h-4" />
          <span>Switch Administrator</span>
        </button>
      </div>

      {/* Strict Allowlist Banner */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-300 shadow-xl">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block font-semibold">Strict Allowlist Security Policy</strong>
          <span>
            Only pre-configured administrative emails have access to this cloud instance. All external self-registration and guest accounts are blocked at both client and Firestore security rule levels.
          </span>
        </div>
      </div>

      {/* Administrators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ALLOWED_USERS.map((admin) => {
          const isCurrent = user?.email?.toLowerCase() === admin.email.toLowerCase();
          return (
            <div
              key={admin.email}
              className={`p-6 rounded-2xl border transition-all shadow-xl space-y-5 flex flex-col justify-between ${
                isCurrent
                  ? 'bg-[#0C0C0E] border-blue-500/60 ring-1 ring-blue-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-md">
                      {admin.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{admin.name}</h3>
                        {isCurrent && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-blue-400 font-medium">{admin.role}</div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
                    ADMIN
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-mono text-slate-200">{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Permission Scope: Root Vault, Shares, Users, Security</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Status: Active & Authorized</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                {!isCurrent ? (
                  <button
                    onClick={onOpenSwitchUser}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Switch to Account</span>
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Currently Active Session</span>
                  </div>
                )}

                <button
                  onClick={() => setSelectedUserToDelete(admin)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Account Governance"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete User Modal */}
      {selectedUserToDelete && (
        <DeleteUserModal
          userToDelete={selectedUserToDelete}
          onClose={() => setSelectedUserToDelete(null)}
        />
      )}
    </div>
  );
};
