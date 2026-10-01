import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  Sparkles,
  Clock,
  Activity,
  Shield,
  BarChart3,
  Users,
  Trash2,
  Plus,
  Upload,
  FolderPlus,
  Settings,
  HelpCircle,
  HardDrive,
  ChevronDown,
} from 'lucide-react';
import { formatBytes } from '../../services/storageService';
import { StorageStats } from '../../types';

interface SidebarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  storageStats: StorageStats;
  trashCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenUpload,
  onOpenNewFolder,
  storageStats,
  trashCount = 0,
}) => {
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setIsNewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'files', label: 'My Files', icon: FolderOpen },
    { id: 'shared', label: 'Shared With Me', icon: Share2 },
    { id: 'organizer', label: 'Smart Organizer', icon: Sparkles, badge: 'AI' },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'security', label: 'Security Center', icon: Shield },
    { id: 'analytics', label: 'Storage Analytics', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'trash', label: 'Trash', icon: Trash2, count: trashCount },
  ];

  return (
    <aside className="w-64 bg-[#0C0C0E] border-r border-slate-800 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-900/20">
          A
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white">AetherDrive</span>
        </div>
      </div>

      {/* New Action Dropdown */}
      <div className="p-4 relative" ref={newMenuRef}>
        <button
          onClick={() => setIsNewMenuOpen(!isNewMenuOpen)}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 group"
        >
          <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
          <span>New</span>
          <ChevronDown className="w-3.5 h-3.5 ml-auto text-blue-200" />
        </button>

        {isNewMenuOpen && (
          <div className="absolute left-4 right-4 top-16 bg-[#0C0C0E] border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1.5 z-40 animate-in fade-in duration-100">
            <button
              onClick={() => {
                setIsNewMenuOpen(false);
                onOpenUpload();
              }}
              className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => {
                setIsNewMenuOpen(false);
                onOpenNewFolder();
              }}
              className="w-full px-3.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-blue-400" />
              <span>New Folder</span>
            </button>
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-semibold border border-blue-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Storage Meter & Settings */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Storage</span>
            <span className="text-xs font-bold text-slate-300">
              {formatBytes(storageStats.usedBytes)} / 100 GB
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(2, storageStats.usedPercentage)}%` }}
            />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={() => onNavigate('security')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => onNavigate('security')}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Support</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
