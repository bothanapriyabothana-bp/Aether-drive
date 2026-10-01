import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Loader2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types';
import { formatBytes, restoreFileFromTrash, permanentlyDeleteFile, emptyTrash } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface TrashViewProps {
  files: FileItem[];
  folders: FolderItem[];
  onRefresh: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({ files, folders, onRefresh }) => {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  const deletedFiles = files.filter((f) => f.deleted);

  const handleRestore = async (file: FileItem) => {
    if (!user || !profile) return;
    setIsProcessing(true);
    try {
      await restoreFileFromTrash(file, {
        email: user.email!,
        name: profile.name,
      });
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePermanentDelete = async (file: FileItem) => {
    if (!user || !profile) return;
    setIsProcessing(true);
    try {
      await permanentlyDeleteFile(file, {
        email: user.email!,
        name: profile.name,
      });
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!user || !profile) return;
    setIsProcessing(true);
    try {
      await emptyTrash(user.email!, {
        email: user.email!,
        name: profile.name,
      });
      setShowEmptyConfirm(false);
      onRefresh();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Trash</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-red-950 text-red-300 border border-red-800/40">
              {deletedFiles.length} items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deleted items can be restored or permanently purged from your cloud vault
          </p>
        </div>

        {deletedFiles.length > 0 && (
          <button
            onClick={() => setShowEmptyConfirm(true)}
            disabled={isProcessing}
            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {/* Content */}
      {deletedFiles.length === 0 ? (
        <div className="py-20 text-center border border-slate-800 rounded-2xl bg-[#0C0C0E] p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">Trash is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Items moved to trash will appear here. No deleted items currently pending cleanup.
          </p>
        </div>
      ) : (
        <div className="bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Size</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Deleted At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {deletedFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/30 text-red-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{file.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            SHA: {file.checksum?.substring(0, 10)}...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell text-slate-400 font-mono">
                      {formatBytes(file.size)}
                    </td>

                    <td className="py-3.5 px-4 hidden md:table-cell text-slate-400">
                      {file.deletedAt
                        ? new Date(file.deletedAt).toLocaleString()
                        : 'Recently'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(file)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(file)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-lg font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty Trash Confirm Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0C0C0E] border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 text-slate-200">
            <div className="flex items-center gap-3 text-red-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Permanently Empty Trash?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will permanently delete all {deletedFiles.length} item(s) from cloud storage and Firestore metadata. This action is irreversible.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEmptyConfirm(false)}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEmptyTrash}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Purge All Items
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
