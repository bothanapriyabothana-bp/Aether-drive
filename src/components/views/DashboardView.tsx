import React from 'react';
import {
  ShieldCheck,
  HardDrive,
  Upload,
  FolderPlus,
  Sparkles,
  ArrowRight,
  Clock,
  Lock,
  FileText,
  Share2,
  Trash2,
  UserCheck,
  AlertCircle,
  Activity as ActivityIcon,
  ChevronRight,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { FileItem, FolderItem, ActivityLog, StorageStats, SecurityScoreData } from '../../types';
import { formatBytes } from '../../services/storageService';
import { ALLOWED_USERS } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

interface DashboardViewProps {
  files: FileItem[];
  folders: FolderItem[];
  activities: ActivityLog[];
  storageStats: StorageStats;
  securityScore: SecurityScoreData;
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onSelectFile: (file: FileItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  files,
  folders,
  activities,
  storageStats,
  securityScore,
  onNavigate,
  onOpenUpload,
  onOpenNewFolder,
  onSelectFile,
}) => {
  const { user, profile, allowedUser } = useAuth();
  const userName = profile?.name || allowedUser?.name || 'Administrator';

  const activeFiles = files.filter((f) => !f.deleted);
  const unorganizedCount = activeFiles.filter((f) => !f.folderId).length;

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'FILE_UPLOADED':
        return 'bg-blue-500';
      case 'FILE_DELETED':
      case 'FILE_PERMANENTLY_DELETED':
        return 'bg-red-500';
      case 'FILE_SHARED':
      case 'SHARE_LINK_REVOKED':
        return 'bg-amber-500';
      case 'FOLDER_CREATED':
        return 'bg-green-500';
      case 'LOGIN':
      case 'USER_SWITCHED':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time cloud infrastructure overview</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewFolder}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-blue-400" />
            <span>New Folder</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>+ New Upload</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Storage Health</span>
          <div className="text-3xl font-bold text-white mt-2">98.2%</div>
          <div className="text-green-500 text-xs mt-1 font-medium">Optimal Performance</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Files Encrypted</span>
          <div className="text-3xl font-bold text-white mt-2">
            {activeFiles.length > 0 ? activeFiles.length : 12482}
          </div>
          <div className="text-slate-400 text-xs mt-1">AES-256 Standard</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors" onClick={() => onNavigate('security')}>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Security Score</span>
          <div className="text-3xl font-bold text-blue-400 mt-2">
            {securityScore.score}
            <span className="text-lg text-slate-500">/100</span>
          </div>
          <div className="text-slate-400 text-xs mt-1">Highly Protected</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl cursor-pointer hover:border-slate-700 transition-colors" onClick={() => onNavigate('users')}>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Active Sessions</span>
          <div className="text-3xl font-bold text-white mt-2">02</div>
          <div className="text-slate-400 text-xs mt-1">AK & BP Active</div>
        </div>
      </div>

      {/* Main Grid: Audit Log (8 cols) & User Management / Security Integrity (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Audit Log Table (8 cols) */}
        <div className="lg:col-span-8 bg-[#0C0C0E] border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl">
          <div>
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="font-bold text-white text-sm">Recent Activity Audit Log</h2>
              <button
                onClick={() => onNavigate('activity')}
                className="text-blue-400 hover:text-blue-300 text-xs font-bold transition-colors"
              >
                View All Activity
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/30 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-3">Action</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">IP Address</th>
                    <th className="px-6 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-400 divide-y divide-slate-800">
                  {activities.length > 0 ? (
                    activities.slice(0, 5).map((act, index) => (
                      <tr key={act.id} className={index % 2 === 1 ? 'bg-slate-900/10' : ''}>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-slate-200">
                            <div className={`w-2 h-2 rounded-full ${getActivityColor(act.action)}`} />
                            {act.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white uppercase text-xs">
                          {act.userName.split(' ')[0]}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                          {act.ipAddress || '192.168.1.104'}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(act.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-slate-200">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            File Upload: Architecture.pdf
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">ABISHEK</td>
                        <td className="px-6 py-4 font-mono text-xs">192.168.1.104</td>
                        <td className="px-6 py-4 text-xs">Just Now</td>
                      </tr>
                      <tr className="bg-slate-900/10">
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-slate-200">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            Session Started: Bothana
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">BOTHANA</td>
                        <td className="px-6 py-4 font-mono text-xs">104.22.4.155</td>
                        <td className="px-6 py-4 text-xs">14 mins ago</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-slate-200">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Share Link Revoked
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">ABISHEK</td>
                        <td className="px-6 py-4 font-mono text-xs">192.168.1.104</td>
                        <td className="px-6 py-4 text-xs">1 hour ago</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-slate-200">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            Folder Created: Q4_Reports
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">BOTHANA</td>
                        <td className="px-6 py-4 font-mono text-xs">104.22.4.155</td>
                        <td className="px-6 py-4 text-xs">2 hours ago</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-2 text-slate-200">
                            <div className="w-2 h-2 rounded-full bg-slate-500" />
                            Bulk Backup Completed
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-white">SYSTEM</td>
                        <td className="px-6 py-4 font-mono text-xs">Localhost</td>
                        <td className="px-6 py-4 text-xs">3 hours ago</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: User Management & Security Integrity (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Management Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center justify-between">
              <span>User Management</span>
              <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-bold">
                2 Admins
              </span>
            </h3>

            <div className="space-y-4">
              {ALLOWED_USERS.map((admin) => (
                <div key={admin.email} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        admin.initials === 'AK' ? 'bg-blue-600' : 'bg-purple-600'
                      } flex items-center justify-center text-[10px] font-bold text-white shadow`}
                    >
                      {admin.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{admin.name}</div>
                      <div className="text-[10px] text-slate-500">{admin.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('users')}
                    className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-white transition-opacity"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('users')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <UserCheck className="w-4 h-4" />
                <span>Switch User</span>
              </button>
            </div>
          </div>

          {/* Security Integrity Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#121215] border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <h3 className="text-white font-bold mb-1">Security Integrity</h3>
              <p className="text-slate-400 text-xs mb-4">SHA-256 Checksums Verified</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: '100%' }} />
                </div>
                <span className="text-[10px] font-bold text-green-500">VERIFIED</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
              <Shield className="w-24 h-24 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Storage Breakdown & Smart Organizer Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Breakdown */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Storage Overview</h2>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {formatBytes(storageStats.usedBytes)}
              <span className="text-base font-normal text-slate-400 ml-2">
                used of 100 GB
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-3 bg-slate-800 rounded-full flex overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all"
                style={{
                  width: `${(storageStats.byType.documents.bytes / Math.max(1, storageStats.usedBytes)) * 100}%`,
                }}
              />
              <div
                className="bg-purple-500 h-full transition-all"
                style={{
                  width: `${(storageStats.byType.media.bytes / Math.max(1, storageStats.usedBytes)) * 100}%`,
                }}
              />
              <div
                className="bg-cyan-400 h-full transition-all"
                style={{
                  width: `${(storageStats.byType.spreadsheets.bytes / Math.max(1, storageStats.usedBytes)) * 100}%`,
                }}
              />
              <div
                className="bg-amber-400 h-full transition-all"
                style={{
                  width: `${(storageStats.byType.code.bytes / Math.max(1, storageStats.usedBytes)) * 100}%`,
                }}
              />
              <div
                className="bg-slate-500 h-full transition-all"
                style={{
                  width: `${(storageStats.byType.other.bytes / Math.max(1, storageStats.usedBytes)) * 100}%`,
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Docs ({formatBytes(storageStats.byType.documents.bytes)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Media ({formatBytes(storageStats.byType.media.bytes)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Data ({formatBytes(storageStats.byType.spreadsheets.bytes)})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Code ({formatBytes(storageStats.byType.code.bytes)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smart Organizer Quick Banner */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Smart Organizer</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {unorganizedCount > 0
                ? `${unorganizedCount} root documents are unclassified. Automatically route and categorize them into structured departmental vaults.`
                : 'All documents in vault are cleanly categorized in organized directories.'}
            </p>

            <div className="p-4 bg-slate-800/60 border border-slate-750 rounded-xl">
              <div className="text-2xl font-bold text-white">
                {unorganizedCount} <span className="text-xs text-slate-400 font-normal">unfiled items</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {activeFiles.length} total active files in vault
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('organizer')}
            className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Review Organization</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
