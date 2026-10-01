import React, { useState, useEffect } from 'react';
import { History, X, Download, RotateCcw, FileText, Loader2, ShieldCheck, Check } from 'lucide-react';
import { FileItem, FileVersionItem } from '../../types';
import { getFileVersionHistory, restoreFileVersionService, formatBytes } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface VersionHistoryModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onVersionRestored: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  file,
  isOpen,
  onClose,
  onVersionRestored,
}) => {
  const { user, profile } = useAuth();
  const [versions, setVersions] = useState<FileVersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !isOpen) return;
    setIsLoading(true);
    getFileVersionHistory(file.id)
      .then((data) => setVersions(data))
      .finally(() => setIsLoading(false));
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const handleRestore = async (versionItem: FileVersionItem) => {
    if (!user || !profile || !file) return;
    setRestoringVersionId(versionItem.id);
    try {
      await restoreFileVersionService(versionItem, file, {
        email: user.email!,
        name: profile.name,
      });
      onVersionRestored();
      onClose();
    } catch (err) {
      console.error('Failed to restore version:', err);
    } finally {
      setRestoringVersionId(null);
    }
  };

  const handleDownloadVersion = (v: FileVersionItem) => {
    const url = v.storageUrl || v.dataBase64;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = v.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#111724] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">File Version History</h2>
              <p className="text-xs text-slate-400">Restore or download previous revisions of this file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active Version Card */}
        <div className="p-6 pb-2 shrink-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Active Current Version
          </div>
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs">
                v{file.version || 1}
              </div>
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{file.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                    Current
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {formatBytes(file.size)} • Modified by {file.ownerName} on{' '}
                  {new Date(file.updatedAt || file.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-xs font-mono text-indigo-300 hidden sm:block">
              SHA: {file.checksum?.substring(0, 8)}...
            </div>
          </div>
        </div>

        {/* Previous Version List */}
        <div className="p-6 pt-2 overflow-y-auto flex-1 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Previous Historical Versions ({versions.length})
          </div>

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs">Loading immutable version snapshots...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No previous versions for this file.</p>
              <p className="text-xs text-slate-500 mt-1">
                When you upload a modified copy of this file with the same name, previous revisions are preserved here automatically.
              </p>
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-xs">
                    v{ver.versionNumber}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-200">{ver.fileName}</div>
                    <div className="text-[11px] text-slate-400">
                      {formatBytes(ver.size)} • Archived on{' '}
                      {new Date(ver.createdAt).toLocaleString()} by {ver.createdByName}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadVersion(ver)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-colors border border-slate-700"
                    title="Download this version"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleRestore(ver)}
                    disabled={restoringVersionId === ver.id}
                    className="px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {restoringVersionId === ver.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
