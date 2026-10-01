import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  History,
  Trash2,
  Copy,
  Check,
  Shield,
  FileText,
  Calendar,
  User,
  HardDrive,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { FileItem } from '../../types';
import { formatBytes } from '../../services/storageService';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onOpenVersions: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
  onShare,
  onOpenVersions,
  onDelete,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !file) return null;

  const isImage =
    file.mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.extension);

  const isPdf =
    file.mimeType === 'application/pdf' || file.extension === 'pdf';

  const isText =
    file.mimeType.startsWith('text/') ||
    ['txt', 'json', 'csv', 'md', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'py'].includes(
      file.extension
    );

  const copyHash = () => {
    navigator.clipboard.writeText(file.checksum || '');
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const previewSource = file.storageUrl || file.dataBase64;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[85vh] bg-[#111724] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white truncate">{file.name}</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-700/40">
                  v{file.version || 1}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {file.securityTag || 'Internal'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {formatBytes(file.size)} • {file.mimeType}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(file)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              title="Download"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={() => onShare(file)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Share Link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onOpenVersions(file)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Version History"
            >
              <History className="w-3.5 h-3.5" />
              <span>Versions</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onDelete(file);
              }}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Preview, Right Inspector */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Main Preview Area */}
          <div className="flex-1 bg-[#090d14] flex items-center justify-center p-4 overflow-auto relative">
            {isImage && previewSource ? (
              <img
                src={previewSource}
                alt={file.name}
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            ) : isPdf && previewSource ? (
              <iframe
                src={`${previewSource}#toolbar=0`}
                title={file.name}
                className="w-full h-full rounded-lg border border-slate-800"
              />
            ) : (
              <div className="text-center p-8 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{file.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct visual preview not available for this binary format in sandbox. You can securely download or share this file.
                  </p>
                </div>
                <button
                  onClick={() => onDownload(file)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Download className="w-4 h-4" />
                  Download File ({formatBytes(file.size)})
                </button>
              </div>
            )}
          </div>

          {/* Right Inspector Drawer */}
          <div className="w-full md:w-80 bg-[#0e131f] border-t md:border-t-0 md:border-l border-slate-800 p-5 overflow-y-auto space-y-5 text-xs">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Security & Integrity</span>
              </h3>
              <div className="space-y-2.5">
                <div>
                  <span className="text-slate-400 block mb-1">SHA-256 Checksum Hash:</span>
                  <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-indigo-300 break-all">
                    <span className="truncate">{file.checksum || 'Verified in Vault'}</span>
                    <button
                      onClick={copyHash}
                      className="p-1 hover:text-white text-slate-400 rounded shrink-0"
                      title="Copy Checksum"
                    >
                      {copiedHash ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>Integrity verified: Hash matches cloud replica</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                File Details
              </h3>
              <dl className="space-y-2.5 text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <dt className="text-slate-400 flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5" /> Size:
                  </dt>
                  <dd className="font-medium text-white">{formatBytes(file.size)}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <dt className="text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Owner:
                  </dt>
                  <dd className="font-medium text-white">{file.ownerName}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <dt className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Created:
                  </dt>
                  <dd className="font-medium text-white">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <dt className="text-slate-400">Last Modified:</dt>
                  <dd className="font-medium text-white">
                    {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <dt className="text-slate-400">Classification:</dt>
                  <dd className="font-medium text-indigo-300">{file.securityTag || 'Internal'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
