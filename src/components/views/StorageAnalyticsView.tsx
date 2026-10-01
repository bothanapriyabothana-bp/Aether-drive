import React from 'react';
import {
  BarChart3,
  HardDrive,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  PieChart,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { FileItem, FolderItem, StorageStats } from '../../types';
import { formatBytes } from '../../services/storageService';

interface StorageAnalyticsViewProps {
  files: FileItem[];
  folders: FolderItem[];
  storageStats: StorageStats;
}

export const StorageAnalyticsView: React.FC<StorageAnalyticsViewProps> = ({
  files,
  folders,
  storageStats,
}) => {
  const activeFiles = files.filter((f) => !f.deleted);
  const sortedByLargest = [...activeFiles].sort((a, b) => b.size - a.size).slice(0, 8);

  const categories = [
    {
      name: 'Documents & PDFs',
      stats: storageStats.byType.documents,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      icon: FileText,
    },
    {
      name: 'Media & Images',
      stats: storageStats.byType.media,
      color: 'bg-purple-500',
      textColor: 'text-purple-400',
      icon: ImageIcon,
    },
    {
      name: 'Spreadsheets & Data',
      stats: storageStats.byType.spreadsheets,
      color: 'bg-cyan-400',
      textColor: 'text-cyan-400',
      icon: FileSpreadsheet,
    },
    {
      name: 'Archives & Backups',
      stats: storageStats.byType.archives,
      color: 'bg-amber-400',
      textColor: 'text-amber-400',
      icon: FileArchive,
    },
    {
      name: 'Code & Config',
      stats: storageStats.byType.code,
      color: 'bg-emerald-400',
      textColor: 'text-emerald-400',
      icon: FileCode,
    },
    {
      name: 'Other Formats',
      stats: storageStats.byType.other,
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
      icon: File,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white tracking-tight">Storage Analytics</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800/40">
            Real-time Metering
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Detailed capacity distribution, category breakdowns, and storage growth insights
        </p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Used Space
          </div>
          <div className="text-3xl font-extrabold text-white">
            {formatBytes(storageStats.usedBytes)}
          </div>
          <div className="text-xs text-blue-400 font-medium">
            {storageStats.usedPercentage.toFixed(2)}% of 100 GB vault
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Available Remaining Space
          </div>
          <div className="text-3xl font-extrabold text-green-500">
            {formatBytes(storageStats.freeBytes)}
          </div>
          <div className="text-xs text-slate-400">Ready for encrypted uploads</div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Total Vault Items
          </div>
          <div className="text-3xl font-extrabold text-blue-400">
            {storageStats.fileCount}{' '}
            <span className="text-sm font-normal text-slate-400">files</span>
          </div>
          <div className="text-xs text-slate-400">
            Across {storageStats.folderCount} structured folder(s)
          </div>
        </div>
      </div>

      {/* Category Breakdown Grid */}
      <div className="p-6 bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-blue-400" />
          <span>Storage Breakdown by Format</span>
        </h2>

        {/* Big visual distribution bar */}
        <div className="w-full h-4 bg-slate-800 rounded-full flex overflow-hidden">
          {categories.map((cat) => {
            const pct = (cat.stats.bytes / Math.max(1, storageStats.usedBytes)) * 100;
            return (
              <div
                key={cat.name}
                className={`${cat.color} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${cat.name}: ${formatBytes(cat.stats.bytes)}`}
              />
            );
          })}
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const pct = (cat.stats.bytes / Math.max(1, storageStats.usedBytes)) * 100;
            return (
              <div
                key={cat.name}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg bg-slate-800 ${cat.textColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{cat.name}</div>
                      <div className="text-[11px] text-slate-400">{cat.stats.count} file(s)</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {formatBytes(cat.stats.bytes)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="p-6 bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Largest Stored Items in Vault</span>
        </h2>

        {sortedByLargest.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No files available to rank.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Security Tag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedByLargest.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3 px-4 font-medium text-white truncate max-w-xs">
                      {file.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {file.extension.toUpperCase() || 'FILE'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-400">
                      {formatBytes(file.size)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{file.ownerName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                        {file.securityTag || 'Internal'}
                      </span>
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
