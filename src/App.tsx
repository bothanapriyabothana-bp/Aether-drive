import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from './services/firebase';
import { FileItem, FolderItem, ActivityLog, ShareLink } from './types';
import { calculateStorageStats, calculateSecurityScore } from './services/analyticsService';

// Layout
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { LandingPage } from './components/views/LandingPage';
import { LoginPage } from './components/views/LoginPage';
import { DashboardView } from './components/views/DashboardView';
import { MyFilesView } from './components/views/MyFilesView';
import { TrashView } from './components/views/TrashView';
import { SecurityCenterView } from './components/views/SecurityCenterView';
import { StorageAnalyticsView } from './components/views/StorageAnalyticsView';
import { SmartOrganizerView } from './components/views/SmartOrganizerView';
import { ActivityLogView } from './components/views/ActivityLogView';
import { UserManagementView } from './components/views/UserManagementView';
import { PublicShareView } from './components/views/PublicShareView';

// Modals
import { CommandCenterModal } from './components/modals/CommandCenterModal';
import { UploadModal } from './components/modals/UploadModal';
import { NewFolderModal } from './components/modals/NewFolderModal';
import { FilePreviewModal } from './components/modals/FilePreviewModal';
import { ShareModal } from './components/modals/ShareModal';
import { VersionHistoryModal } from './components/modals/VersionHistoryModal';
import { SwitchUserModal } from './components/modals/SwitchUserModal';
import { QuickLockOverlay } from './components/modals/QuickLockOverlay';
import { SessionTimeoutModal } from './components/modals/SessionTimeoutModal';

const Workspace: React.FC = () => {
  const { user, profile, isAuthenticated, isAuthorizedAdmin } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Domain Collections
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);

  // Modals state
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isSwitchUserOpen, setIsSwitchUserOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [sharingFile, setSharingFile] = useState<FileItem | null>(null);
  const [versionHistoryFile, setVersionHistoryFile] = useState<FileItem | null>(null);

  // Firestore Subscriptions
  useEffect(() => {
    if (!user?.email || !isAuthorizedAdmin) return;

    // Files Subscription (Realtime)
    const filesQuery = query(collection(db, 'files'));
    const unsubFiles = onSnapshot(filesQuery, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FileItem));
      setFiles(items);
    });

    // Folders Subscription (Realtime)
    const foldersQuery = query(collection(db, 'folders'));
    const unsubFolders = onSnapshot(foldersQuery, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FolderItem));
      setFolders(items);
    });

    // Activity Logs Subscription (Realtime)
    const activityQuery = query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc'));
    const unsubActivities = onSnapshot(activityQuery, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ActivityLog));
      setActivities(items);
    });

    // Share Links Subscription
    const shareQuery = query(collection(db, 'shareLinks'));
    const unsubShares = onSnapshot(shareQuery, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ShareLink));
      setShareLinks(items);
    });

    return () => {
      unsubFiles();
      unsubFolders();
      unsubActivities();
      unsubShares();
    };
  }, [user, isAuthorizedAdmin]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute analytics and stats
  const storageStats = calculateStorageStats(files, folders);
  const securityScore = calculateSecurityScore(files, activities, shareLinks);

  const activeFiles = files.filter((f) => !f.deleted);
  const trashFiles = files.filter((f) => f.deleted);

  const handleNavigate = (tab: string) => {
    setCurrentTab(tab);
    if (tab !== 'files') {
      setCurrentFolderId(null);
    }
  };

  const handleRefresh = useCallback(() => {
    // onSnapshot automatically updates state
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#09090B] text-slate-200 overflow-hidden font-sans select-none">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenNewFolder={() => setIsNewFolderOpen(true)}
        storageStats={storageStats}
        trashCount={trashFiles.length}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#09090B]">
        {/* Global Header */}
        <Header
          onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
          onOpenSwitchUser={() => setIsSwitchUserOpen(true)}
          onNavigate={handleNavigate}
          currentTab={currentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              files={files}
              folders={folders}
              activities={activities}
              storageStats={storageStats}
              securityScore={securityScore}
              onNavigate={handleNavigate}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewFolder={() => setIsNewFolderOpen(true)}
              onSelectFile={(f) => setPreviewFile(f)}
            />
          )}

          {currentTab === 'files' && (
            <MyFilesView
              files={files}
              folders={folders}
              currentFolderId={currentFolderId}
              setCurrentFolderId={setCurrentFolderId}
              searchQuery={searchQuery}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewFolder={() => setIsNewFolderOpen(true)}
              onPreviewFile={(f) => setPreviewFile(f)}
              onShareFile={(f) => setSharingFile(f)}
              onOpenVersions={(f) => setVersionHistoryFile(f)}
              onFileUpdated={handleRefresh}
            />
          )}

          {currentTab === 'shared' && (
            <SecurityCenterView
              files={files}
              securityScore={securityScore}
              shareLinks={shareLinks}
              onRefreshData={handleRefresh}
            />
          )}

          {currentTab === 'organizer' && (
            <SmartOrganizerView
              files={files}
              folders={folders}
              onRefreshData={handleRefresh}
            />
          )}

          {currentTab === 'recent' && (
            <MyFilesView
              files={files}
              folders={folders}
              currentFolderId={null}
              setCurrentFolderId={setCurrentFolderId}
              searchQuery={searchQuery}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewFolder={() => setIsNewFolderOpen(true)}
              onPreviewFile={(f) => setPreviewFile(f)}
              onShareFile={(f) => setSharingFile(f)}
              onOpenVersions={(f) => setVersionHistoryFile(f)}
              onFileUpdated={handleRefresh}
            />
          )}

          {currentTab === 'activity' && (
            <ActivityLogView activities={activities} />
          )}

          {currentTab === 'security' && (
            <SecurityCenterView
              files={files}
              securityScore={securityScore}
              shareLinks={shareLinks}
              onRefreshData={handleRefresh}
            />
          )}

          {currentTab === 'analytics' && (
            <StorageAnalyticsView
              files={files}
              folders={folders}
              storageStats={storageStats}
            />
          )}

          {currentTab === 'users' && (
            <UserManagementView onOpenSwitchUser={() => setIsSwitchUserOpen(true)} />
          )}

          {currentTab === 'trash' && (
            <TrashView files={files} folders={folders} onRefresh={handleRefresh} />
          )}
        </main>
      </div>

      {/* Global Interactive Modals */}
      <CommandCenterModal
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        files={activeFiles}
        folders={folders}
        onNavigate={(tab) => {
          handleNavigate(tab);
          setIsCommandCenterOpen(false);
        }}
        onSelectFile={(f) => {
          setPreviewFile(f);
          setIsCommandCenterOpen(false);
        }}
        onOpenUpload={() => {
          setIsCommandCenterOpen(false);
          setIsUploadOpen(true);
        }}
        onOpenNewFolder={() => {
          setIsCommandCenterOpen(false);
          setIsNewFolderOpen(true);
        }}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentFolderId={currentFolderId}
        existingFiles={files}
        onUploadComplete={handleRefresh}
      />

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        currentFolderId={currentFolderId}
        onFolderCreated={handleRefresh}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onOpenShare={(f) => setSharingFile(f)}
        onOpenVersions={(f) => setVersionHistoryFile(f)}
        onFileUpdated={handleRefresh}
      />

      <ShareModal
        file={sharingFile}
        onClose={() => setSharingFile(null)}
        onShareCreated={handleRefresh}
      />

      <VersionHistoryModal
        file={versionHistoryFile}
        onClose={() => setVersionHistoryFile(null)}
        onVersionRestored={handleRefresh}
      />

      <SwitchUserModal
        isOpen={isSwitchUserOpen}
        onClose={() => setIsSwitchUserOpen(false)}
      />

      {/* Quick Lock and Session Inactivity Protection */}
      <QuickLockOverlay />
      <SessionTimeoutModal />
    </div>
  );
};

export default function App() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  // Check URL hash for public share links (#share/token)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share/')) {
        const token = hash.replace('#share/', '');
        setShareToken(token);
      } else {
        setShareToken(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <AuthProvider>
      <AppContent
        isLoginMode={isLoginMode}
        setIsLoginMode={setIsLoginMode}
        shareToken={shareToken}
        onClearShareToken={() => {
          window.location.hash = '';
          setShareToken(null);
        }}
      />
    </AuthProvider>
  );
}

const AppContent: React.FC<{
  isLoginMode: boolean;
  setIsLoginMode: (v: boolean) => void;
  shareToken: string | null;
  onClearShareToken: () => void;
}> = ({ isLoginMode, setIsLoginMode, shareToken, onClearShareToken }) => {
  const { isAuthenticated, loading } = useAuth();

  // If public share link is accessed
  if (shareToken) {
    return <PublicShareView token={shareToken} onGoHome={onClearShareToken} />;
  }

  // Loading spinner during auth hydration
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Authenticated State -> Load full enterprise workspace
  if (isAuthenticated) {
    return <Workspace />;
  }

  // Unauthenticated -> Landing page or Login
  if (isLoginMode) {
    return <LoginPage onBackToLanding={() => setIsLoginMode(false)} />;
  }

  return <LandingPage onGoToLogin={() => setIsLoginMode(true)} />;
};
