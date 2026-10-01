import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  FolderPlus,
  Shield,
  BarChart2,
  Users,
  Lock,
  FileText,
  Clock,
  Sparkles,
  X,
  ArrowRight,
} from 'lucide-react';
import { FileItem } from '../../types';

interface CommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileItem[];
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onLockApp: () => void;
  onSelectFile: (file: FileItem) => void;
}

export const CommandCenterModal: React.FC<CommandCenterModalProps> = ({
  isOpen,
  onClose,
  files,
  onNavigate,
  onOpenUpload,
  onOpenNewFolder,
  onLockApp,
  onSelectFile,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredFiles = query.trim()
    ? files
        .filter((f) => !f.deleted && f.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : [];

  const quickActions = [
    {
      id: 'upload',
      title: 'Upload New File',
      desc: 'Encrypt and store files in cloud vault',
      icon: Upload,
      action: () => {
        onClose();
        onOpenUpload();
      },
    },
    {
      id: 'folder',
      title: 'Create Folder',
      desc: 'Organize files into structured directories',
      icon: FolderPlus,
      action: () => {
        onClose();
        onOpenNewFolder();
      },
    },
    {
      id: 'security',
      title: 'Security Center',
      desc: 'Review sessions, integrity score & shared links',
      icon: Shield,
      action: () => {
        onClose();
        onNavigate('security');
      },
    },
    {
      id: 'organizer',
      title: 'Smart Organizer',
      desc: 'AI metadata suggestions to categorize root files',
      icon: Sparkles,
      action: () => {
        onClose();
        onNavigate('organizer');
      },
    },
    {
      id: 'analytics',
      title: 'Storage Analytics',
      desc: 'Inspect file distribution & capacity breakdown',
      icon: BarChart2,
      action: () => {
        onClose();
        onNavigate('analytics');
      },
    },
    {
      id: 'users',
      title: 'User Management',
      desc: 'Admin permissions, account switching & deletions',
      icon: Users,
      action: () => {
        onClose();
        onNavigate('users');
      },
    },
    {
      id: 'lock',
      title: 'Lock AetherDrive',
      desc: 'Instantly lock interface with master authentication',
      icon: Lock,
      action: () => {
        onClose();
        onLockApp();
      },
    },
  ];

  const matchingActions = query.trim()
    ? quickActions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.desc.toLowerCase().includes(query.toLowerCase())
      )
    : quickActions;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#111724] border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, action or file name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-base font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Matched files */}
          {filteredFiles.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Matching Files
              </div>
              <div className="space-y-1">
                {filteredFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onClose();
                      onSelectFile(file);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-300">
                          {file.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {file.mimeType} • {file.securityTag || 'Internal'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Commands & Navigation
            </div>
            <div className="space-y-1">
              {matchingActions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.action}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-200 group-hover:text-white">
                          {act.title}
                        </div>
                        <div className="text-xs text-slate-400">{act.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono text-[10px]">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono text-[10px]">
              ↓
            </kbd>
          </div>
          <div className="flex items-center gap-2">
            <span>Close:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono text-[10px]">
              ESC
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
