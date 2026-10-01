import React, { useState } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  File,
  Upload,
  FolderPlus,
  MoreVertical,
  Download,
  Share2,
  History,
  Trash2,
  Edit2,
  FolderInput,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronRight,
  Eye,
  Lock,
} from 'lucide-react';
import { FileItem, FolderItem } from '../../types';
import { formatBytes, renameFile, moveFile, moveFileToTrash } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface MyFilesViewProps {
  files: FileItem[];
  folders: FolderItem[];
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  searchQuery: string;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onPreviewFile: (file: FileItem) => void;
  onShareFile: (file: FileItem) => void;
  onOpenVersions: (file: FileItem) => void;
  onFileUpdated: () => void;
}

export const MyFilesView: React.FC<MyFilesViewProps> = ({
  files,
  folders,
  currentFolderId,
  setCurrentFolderId,
  searchQuery,
  onOpenUpload,
  onOpenNewFolder,
  onPreviewFile,
  onShareFile,
  onOpenVersions,
  onFileUpdated,
}) => {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'updatedAt' | 'type'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Rename modal state
  const [renamingFile, setRenamingFile] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');

  // Move modal state
  const [movingFile, setMovingFile] = useState<FileItem | null>(null);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  // Active action menu row
  const [activeMenuFileId, setActiveMenuFileId] = useState<string | null>(null);

  const activeFiles = files.filter((f) => !f.deleted);

  // Folder navigation hierarchy
  const currentFolder = folders.find((f) => f.id === currentFolderId);
  const currentFolders = folders.filter((f) => f.parentId === currentFolderId);
  const folderFiles = activeFiles.filter((f) => f.folderId === currentFolderId);

  // Apply Search and Filters
  const filteredFiles = folderFiles.filter((file) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.name.toLowerCase().includes(q);
      const matchType = file.mimeType.toLowerCase().includes(q) || file.extension.toLowerCase().includes(q);
      const matchTag = file.securityTag?.toLowerCase().includes(q);
      if (!matchName && !matchType && !matchTag) return false;
    }

    if (typeFilter !== 'ALL') {
      const ext = (file.extension || '').toLowerCase();
      const mime = (file.mimeType || '').toLowerCase();
      if (typeFilter === 'DOCS' && !(ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'txt' || mime.includes('pdf') || mime.includes('word'))) return false;
      if (typeFilter === 'MEDIA' && !(mime.includes('image') || mime.includes('video') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'mp4'].includes(ext))) return false;
      if (typeFilter === 'SHEETS' && !(ext === 'xls' || ext === 'xlsx' || ext === 'csv')) return false;
      if (typeFilter === 'ARCHIVES' && !(['zip', 'tar', 'gz', 'rar', '7z'].includes(ext))) return false;
      if (typeFilter === 'CODE' && !(['json', 'ts', 'js', 'tsx', 'jsx', 'py', 'html', 'css'].includes(ext))) return false;
    }

    return true;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let result = 0;
    if (sortBy === 'name') result = a.name.localeCompare(b.name);
    else if (sortBy === 'size') result = a.size - b.size;
    else if (sortBy === 'updatedAt') result = (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt);
    else if (sortBy === 'type') result = a.extension.localeCompare(b.extension);

    return sortOrder === 'asc' ? result : -result;
  });

  const getFileIcon = (file: FileItem) => {
    const ext = file.extension.toLowerCase();
    const mime = file.mimeType.toLowerCase();

    if (ext === 'pdf' || mime.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv' || mime.includes('sheet') || mime.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    }
    if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext)) {
      return <FileArchive className="w-5 h-5 text-amber-400" />;
    }
    if (['json', 'js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-cyan-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
  };

  const handleDownload = (file: FileItem) => {
    const url = file.storageUrl || file.dataBase64;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFile || !newName.trim() || !user || !profile) return;
    await renameFile(renamingFile, newName.trim(), {
      email: user.email!,
      name: profile.name,
    });
    setRenamingFile(null);
    onFileUpdated();
  };

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingFile || !user || !profile) return;
    const target = folders.find((f) => f.id === targetFolderId);
    await moveFile(movingFile, targetFolderId, target?.name || 'Root Workspace', {
      email: user.email!,
      name: profile.name,
    });
    setMovingFile(null);
    onFileUpdated();
  };

  const handleDeleteToTrash = async (file: FileItem) => {
    if (!user || !profile) return;
    await moveFileToTrash(file, {
      email: user.email!,
      name: profile.name,
    });
    onFileUpdated();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-150">
      {/* Top Action & Breadcrumb Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={`font-semibold transition-colors ${
              currentFolderId === null ? 'text-white text-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Files
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-semibold text-white text-sm">{currentFolder.name}</span>
            </>
          )}
        </div>

        {/* Right action tools */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All File Types</option>
            <option value="DOCS">Documents & PDF</option>
            <option value="MEDIA">Images & Media</option>
            <option value="SHEETS">Spreadsheets & Data</option>
            <option value="ARCHIVES">Archives (ZIP/TAR)</option>
            <option value="CODE">Code & Config</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={`${sortBy}_${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('_') as [any, any];
              setSortBy(sb);
              setSortOrder(so);
            }}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="updatedAt_desc">Modified (Newest)</option>
            <option value="updatedAt_asc">Modified (Oldest)</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="size_desc">Size (Largest)</option>
            <option value="size_asc">Size (Smallest)</option>
          </select>

          <button
            onClick={onOpenNewFolder}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Folder</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-blue-900/20"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* Folders Row (if any in current level) */}
      {currentFolders.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Folders</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentFolders.map((folder) => {
              const count = activeFiles.filter((f) => f.folderId === folder.id).length;
              return (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="p-3.5 bg-[#0C0C0E] hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all group flex items-center gap-3 shadow-lg"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${folder.color || '#2563eb'}20` }}
                  >
                    <Folder className="w-4 h-4" style={{ color: folder.color || '#3b82f6' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate group-hover:text-blue-300">
                      {folder.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{count} items</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Content Area */}
      {sortedFiles.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 p-8 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-300">No files in this location</h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload files or drag and drop documents into this folder.
            </p>
          </div>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-blue-900/20"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload New File
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* Table / List View */
        <div className="bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Name</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Type</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Last Modified</th>
                  <th className="py-3.5 px-4 hidden lg:table-cell">Security</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => onPreviewFile(file)}
                  >
                    {/* Name */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {getFileIcon(file)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 group-hover:text-blue-400 truncate flex items-center gap-2">
                            <span className="truncate">{file.name}</span>
                            {file.version > 1 && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/40">
                                v{file.version}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 sm:hidden">
                            {formatBytes(file.size)} • {file.securityTag || 'Internal'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 hidden sm:table-cell text-slate-400 font-mono text-[11px]">
                      {file.extension.toUpperCase() || 'FILE'}
                    </td>

                    {/* Size */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {formatBytes(file.size)}
                    </td>

                    {/* Last Modified */}
                    <td className="py-3 px-4 hidden md:table-cell text-slate-400 text-[11px]">
                      {new Date(file.updatedAt || file.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Security Tag */}
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                        <Lock className="w-2.5 h-2.5" />
                        <span>{file.securityTag || 'Internal'}</span>
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onShareFile(file)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenVersions(file)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Version History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRenamingFile(file);
                            setNewName(file.name);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Rename"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setMovingFile(file);
                            setTargetFolderId(file.folderId);
                          }}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="Move"
                        >
                          <FolderInput className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteToTrash(file)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                          title="Move to Trash"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onPreviewFile(file)}
              className="p-4 bg-[#0C0C0E] border border-slate-800 hover:border-blue-500/50 rounded-2xl transition-all group cursor-pointer space-y-3 flex flex-col justify-between shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {getFileIcon(file)}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  {file.securityTag || 'Internal'}
                </span>
              </div>

              <div>
                <div className="text-xs font-semibold text-white group-hover:text-blue-400 truncate">
                  {file.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {formatBytes(file.size)} • v{file.version || 1}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleDownload(file)}
                  className="hover:text-white p-1"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onShareFile(file)}
                  className="hover:text-blue-400 p-1"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenVersions(file)}
                  className="hover:text-cyan-300 p-1"
                  title="Versions"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteToTrash(file)}
                  className="hover:text-red-400 p-1"
                  title="Trash"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename File Modal */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Rename File</h3>
            <form onSubmit={handleRenameSubmit} className="space-y-4">
              <input
                type="text"
                required
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-900/20"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move File Modal */}
      {movingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0C0C0E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white">Move File to Folder</h3>
            <form onSubmit={handleMoveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Select Destination</label>
                <select
                  value={targetFolderId || ''}
                  onChange={(e) => setTargetFolderId(e.target.value || null)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Root Workspace</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovingFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-blue-900/20"
                >
                  Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
