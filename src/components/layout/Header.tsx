import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Lock,
  Bell,
  UserCheck,
  Shield,
  LogOut,
  ChevronDown,
  Terminal,
  BarChart2,
  HardDrive,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenCommandCenter: () => void;
  onOpenSwitchUser: () => void;
  onNavigate: (tab: string) => void;
  currentTab: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandCenter,
  onOpenSwitchUser,
  onNavigate,
  currentTab,
  searchQuery,
  setSearchQuery,
}) => {
  const { user, profile, allowedUser, logout, lockSession } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = profile?.initials || allowedUser?.initials || 'AK';
  const name = profile?.name || allowedUser?.name || 'Administrator';
  const email = profile?.email || user?.email || 'admin@aetherdrive.internal';

  return (
    <header className="h-16 bg-[#09090B] border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left: Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Aether Command Center..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-20 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            onClick={onOpenCommandCenter}
            className="absolute right-2.5 px-2 py-0.5 bg-slate-800 border border-slate-700/60 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-700 flex items-center gap-1 transition-colors"
            title="Command Palette (Cmd+K)"
          >
            <span>⌘K</span>
          </button>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-6 ml-4">
        {/* Command Center button */}
        <button
          onClick={onOpenCommandCenter}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors hidden sm:flex items-center gap-1.5 text-xs"
          title="Command Center"
        >
          <Terminal className="w-4 h-4" />
          <span className="font-medium text-[11px]">Command</span>
        </button>

        {/* Lock AetherDrive button */}
        <button
          onClick={lockSession}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs"
          title="Lock AetherDrive"
        >
          <Lock className="w-4 h-4" />
          <span className="font-medium text-[11px] hidden md:inline">Lock</span>
        </button>

        {/* Notification indicator */}
        <button
          onClick={() => onNavigate('security')}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors relative"
          title="Security Alerts"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-[#09090B]" />
        </button>

        <div className="h-8 w-px bg-slate-800" />

        {/* User initials profile menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-white leading-tight">{name}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Administrator</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg">
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#0C0C0E] border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-2 text-slate-200 z-50 animate-in fade-in duration-100">
              {/* User summary */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{email}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400">
                      ADMINISTRATOR
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenSwitchUser();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Switch User</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('users');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>User Management</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('security');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Security Center</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onNavigate('analytics');
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors"
                >
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  <span>Storage Analytics</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    lockSession();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2.5 transition-colors"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Lock AetherDrive</span>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
