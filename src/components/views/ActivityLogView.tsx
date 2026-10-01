import React, { useState } from 'react';
import {
  Activity,
  Upload,
  Trash2,
  Share2,
  FolderPlus,
  UserCheck,
  Edit2,
  Search,
  Filter,
  Calendar,
} from 'lucide-react';
import { ActivityLog } from '../../types';

interface ActivityLogViewProps {
  activities: ActivityLog[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ activities }) => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredActivities = activities.filter((act) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchDetails = act.details.toLowerCase().includes(q);
      const matchUser = act.userName.toLowerCase().includes(q) || act.userEmail.toLowerCase().includes(q);
      if (!matchTitle && !matchDetails && !matchUser) return false;
    }
    if (filterAction !== 'ALL') {
      if (filterAction === 'FILES' && !act.action.includes('FILE')) return false;
      if (filterAction === 'FOLDERS' && !act.action.includes('FOLDER')) return false;
      if (filterAction === 'AUTH' && !['LOGIN', 'LOGOUT', 'USER_SWITCHED'].includes(act.action)) return false;
      if (filterAction === 'SHARING' && !act.action.includes('SHARE')) return false;
    }
    return true;
  });

  const getActionBadge = (act: ActivityLog) => {
    switch (act.action) {
      case 'FILE_UPLOADED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/40">UPLOAD</span>;
      case 'FILE_DELETED':
      case 'FILE_PERMANENTLY_DELETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800/40">DELETE</span>;
      case 'FILE_SHARED':
      case 'SHARE_LINK_REVOKED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/40">SHARE</span>;
      case 'FOLDER_CREATED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/40">FOLDER</span>;
      case 'LOGIN':
      case 'USER_SWITCHED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800/40">AUTH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">EVENT</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Activity Log</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800/40">
            {activities.length} Recorded Events
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Immutable audit trails tracking all administrative logins, file modifications, share creations, and purges
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="FILES">File Events</option>
            <option value="FOLDERS">Folder Events</option>
            <option value="SHARING">Sharing Events</option>
            <option value="AUTH">Authentication Events</option>
          </select>
        </div>
      </div>

      {/* Activities Table */}
      <div className="bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5">{getActionBadge(act)}</td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {act.title}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 max-w-sm truncate">
                      {act.details}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{act.userName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{act.userEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
                      {new Date(act.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
