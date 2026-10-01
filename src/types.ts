export type UserRole = 'admin';

export interface AllowedUser {
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  defaultPasswordHint?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  initials: string;
  role: UserRole;
  createdAt: number;
  lastLogin: number;
  status: 'active' | 'suspended';
  preferredTimeoutMinutes?: number;
}

export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  storagePath: string;
  storageUrl: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  size: number; // bytes
  mimeType: string;
  extension: string;
  folderId: string | null; // null = root
  createdAt: number;
  updatedAt: number;
  deleted: boolean;
  deletedAt: number | null;
  checksum: string; // SHA-256
  isFavorite?: boolean;
  securityTag?: 'Confidential' | 'Internal' | 'Public' | 'Restricted';
  version: number;
  versionCount?: number;
  dataBase64?: string; // fallback preview cache if direct storage CORS requires
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  ownerId: string;
  ownerEmail: string;
  createdAt: number;
  updatedAt: number;
  color?: string;
  fileCount?: number;
}

export interface FileVersionItem {
  id: string;
  fileId: string;
  versionNumber: number;
  fileName: string;
  size: number;
  mimeType: string;
  checksum: string;
  storagePath: string;
  storageUrl: string;
  createdAt: number;
  createdByEmail: string;
  createdByName: string;
  note?: string;
  dataBase64?: string;
}

export type ActivityAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'FILE_UPLOADED'
  | 'FILE_DOWNLOADED'
  | 'FILE_RENAMED'
  | 'FILE_MOVED'
  | 'FILE_DELETED'
  | 'FILE_RESTORED'
  | 'FILE_PERMANENTLY_DELETED'
  | 'FOLDER_CREATED'
  | 'FILE_SHARED'
  | 'SHARE_LINK_REVOKED'
  | 'USER_SWITCHED'
  | 'PASSWORD_CHANGED'
  | 'USER_DELETED'
  | 'SECURITY_SETTING_CHANGED'
  | 'SESSION_LOCKED'
  | 'SESSION_UNLOCKED'
  | 'INTEGRITY_CHECKED';

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  title: string;
  details: string;
  userEmail: string;
  userName: string;
  timestamp: number;
  ipOrDevice: string;
  category: 'auth' | 'file' | 'security' | 'user' | 'admin';
  status: 'success' | 'warning' | 'error';
  fileId?: string;
  fileName?: string;
}

export interface ShareLink {
  id: string;
  token: string;
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storageUrl: string;
  fileChecksum: string;
  createdAt: number;
  expiresAt: number;
  createdByEmail: string;
  createdByName: string;
  active: boolean;
  accessCount: number;
  maxAccessCount?: number;
  passwordProtected?: boolean;
  passwordHash?: string;
}

export interface SecuritySession {
  id: string;
  userEmail: string;
  userName: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  loginTime: number;
  lastActiveTime: number;
  isCurrent: boolean;
  status: 'active' | 'terminated';
}

export interface SecurityEvent {
  id: string;
  type: 'NEW_DEVICE' | 'SUSPICIOUS_LOGIN' | 'MULTIPLE_FAILURES' | 'PASSWORD_EXPIRY' | 'PUBLIC_SHARE';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  userEmail: string;
  ip: string;
  resolved: boolean;
}

export interface StorageStats {
  totalBytes: number;
  usedBytes: number;
  freeBytes: number;
  usedPercentage: number;
  fileCount: number;
  folderCount: number;
  byType: {
    documents: { bytes: number; count: number };
    media: { bytes: number; count: number };
    spreadsheets: { bytes: number; count: number };
    archives: { bytes: number; count: number };
    code: { bytes: number; count: number };
    other: { bytes: number; count: number };
  };
}

export interface SecurityScoreData {
  score: number; // 0-100
  grade: 'STRONG' | 'MODERATE' | 'ATTENTION_REQUIRED';
  encryptionActive: boolean;
  twoFactorActive: boolean;
  recentPasswordChange: boolean;
  unresolvedEventsCount: number;
  activeSessionsCount: number;
  activeSharedLinksCount: number;
  integrityIssuesCount: number;
  explanation: string;
  breakdown: {
    accountSecurity: number; // /25
    sessionHealth: number; // /25
    sharingExposure: number; // /25
    fileIntegrity: number; // /25
  };
}
