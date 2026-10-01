import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { formatBytes, checkDuplicateChecksum, findExistingFileByName, uploadFileService } from '../../services/storageService';
import { FileItem, FolderItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolderId: string | null;
  folders: FolderItem[];
  onUploadComplete: (file: FileItem) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentFolderId,
  folders,
  onUploadComplete,
}) => {
  const { user, profile } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [securityTag, setSecurityTag] = useState<'Internal' | 'Confidential' | 'Restricted' | 'Public'>('Internal');
  const [targetFolderId, setTargetFolderId] = useState<string | null>(currentFolderId);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Duplicate / Version prompt state
  const [duplicateFile, setDuplicateFile] = useState<FileItem | null>(null);
  const [sameNameFile, setSameNameFile] = useState<FileItem | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setDuplicateFile(null);
    setSameNameFile(null);

    if (!user?.email) return;

    setIsChecking(true);
    try {
      // 1. Check duplicate by SHA-256
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      const dup = await checkDuplicateChecksum(checksum, user.email);
      if (dup) {
        setDuplicateFile(dup);
      }

      // 2. Check same name in current folder
      const sameName = await findExistingFileByName(file.name, targetFolderId, user.email);
      if (sameName && (!dup || dup.id !== sameName.id)) {
        setSameNameFile(sameName);
      }
    } catch (e) {
      console.warn('Pre-upload check caught error:', e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleStartUpload = async (mode: 'standard' | 'new_version' = 'standard') => {
    if (!selectedFile || !user || !profile) return;

    setIsUploading(true);
    setErrorMsg(null);
    setUploadProgress(10);

    try {
      const fileResult = await uploadFileService(
        selectedFile,
        targetFolderId,
        {
          uid: user.uid,
          email: user.email!,
          name: profile.name,
        },
        {
          isNewVersionOf: mode === 'new_version' && sameNameFile ? sameNameFile : undefined,
          onProgress: (p) => setUploadProgress(p),
          securityTag,
        }
      );

      onUploadComplete(fileResult);
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete upload.');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setDuplicateFile(null);
    setSameNameFile(null);
    setErrorMsg(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#111724] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Upload File to Vault</h2>
              <p className="text-xs text-slate-400">Zero-knowledge end-to-end encrypted storage</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/70'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Click to select file or drag & drop here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, DOCX, XLSX, Images, ZIP, Code, CSV, etc. up to 100 MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected File Details */}
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-700/40 text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary file'}
                    </div>
                  </div>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg text-xs"
                  >
                    Change
                  </button>
                )}
              </div>

              {/* Duplicate Detection Warning */}
              {duplicateFile && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Duplicate File Detected</span>
                  </div>
                  <p className="text-slate-300">
                    A file with identical SHA-256 hash already exists in your vault:
                    <strong className="text-white ml-1 font-mono">{duplicateFile.name}</strong>.
                  </p>
                </div>
              )}

              {/* Same Name / Versioning Detection */}
              {sameNameFile && !duplicateFile && (
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Existing File Match Found</span>
                  </div>
                  <p className="text-slate-300">
                    A file named <strong className="text-white font-mono">{sameNameFile.name}</strong> already exists here (current version: v{sameNameFile.version || 1}).
                  </p>
                </div>
              )}

              {/* Target Folder & Classification Options */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Target Folder</label>
                  <select
                    value={targetFolderId || ''}
                    onChange={(e) => setTargetFolderId(e.target.value || null)}
                    disabled={isUploading}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Root Workspace</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Security Classification</label>
                  <select
                    value={securityTag}
                    onChange={(e) => setSecurityTag(e.target.value as any)}
                    disabled={isUploading}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Internal">Internal</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Restricted">Restricted</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Encrypting & Storing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          {selectedFile && sameNameFile ? (
            <>
              <button
                type="button"
                onClick={() => handleStartUpload('new_version')}
                disabled={isUploading || isChecking}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                Upload as v{(sameNameFile.version || 1) + 1}
              </button>
              <button
                type="button"
                onClick={() => handleStartUpload('standard')}
                disabled={isUploading || isChecking}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Upload as Separate
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleStartUpload('standard')}
              disabled={!selectedFile || isUploading || isChecking}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Encrypting...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{duplicateFile ? 'Upload Duplicate Anyway' : 'Upload File'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
