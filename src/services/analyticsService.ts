import { FileItem, FolderItem, StorageStats, SecurityScoreData, ShareLink, SecuritySession } from '../types';

export const TOTAL_ALLOCATED_STORAGE_BYTES = 100 * 1024 * 1024 * 1024; // 100 GB standard allocation

export function calculateStorageStats(files: FileItem[], folders: FolderItem[]): StorageStats {
  const activeFiles = files.filter((f) => !f.deleted);

  let usedBytes = 0;
  const byType = {
    documents: { bytes: 0, count: 0 },
    media: { bytes: 0, count: 0 },
    spreadsheets: { bytes: 0, count: 0 },
    archives: { bytes: 0, count: 0 },
    code: { bytes: 0, count: 0 },
    other: { bytes: 0, count: 0 },
  };

  for (const f of activeFiles) {
    const size = f.size || 0;
    usedBytes += size;
    const ext = (f.extension || '').toLowerCase();
    const mime = (f.mimeType || '').toLowerCase();

    if (
      ext === 'pdf' ||
      ext === 'doc' ||
      ext === 'docx' ||
      ext === 'txt' ||
      ext === 'rtf' ||
      mime.includes('pdf') ||
      mime.includes('word') ||
      mime.includes('text/plain')
    ) {
      byType.documents.bytes += size;
      byType.documents.count += 1;
    } else if (
      ext === 'jpg' ||
      ext === 'jpeg' ||
      ext === 'png' ||
      ext === 'gif' ||
      ext === 'webp' ||
      ext === 'svg' ||
      ext === 'mp4' ||
      ext === 'mov' ||
      mime.includes('image') ||
      mime.includes('video')
    ) {
      byType.media.bytes += size;
      byType.media.count += 1;
    } else if (
      ext === 'xls' ||
      ext === 'xlsx' ||
      ext === 'csv' ||
      mime.includes('sheet') ||
      mime.includes('csv')
    ) {
      byType.spreadsheets.bytes += size;
      byType.spreadsheets.count += 1;
    } else if (
      ext === 'zip' ||
      ext === 'tar' ||
      ext === 'gz' ||
      ext === 'rar' ||
      ext === '7z' ||
      mime.includes('zip') ||
      mime.includes('compressed')
    ) {
      byType.archives.bytes += size;
      byType.archives.count += 1;
    } else if (
      ext === 'json' ||
      ext === 'js' ||
      ext === 'ts' ||
      ext === 'tsx' ||
      ext === 'jsx' ||
      ext === 'py' ||
      ext === 'html' ||
      ext === 'css' ||
      mime.includes('json') ||
      mime.includes('javascript')
    ) {
      byType.code.bytes += size;
      byType.code.count += 1;
    } else {
      byType.other.bytes += size;
      byType.other.count += 1;
    }
  }

  const freeBytes = Math.max(0, TOTAL_ALLOCATED_STORAGE_BYTES - usedBytes);
  const usedPercentage = Math.min(100, Math.max(0.1, (usedBytes / TOTAL_ALLOCATED_STORAGE_BYTES) * 100));

  return {
    totalBytes: TOTAL_ALLOCATED_STORAGE_BYTES,
    usedBytes,
    freeBytes,
    usedPercentage,
    fileCount: activeFiles.length,
    folderCount: folders.length,
    byType,
  };
}

export function calculateSecurityScore(
  files: FileItem[],
  sessions: SecuritySession[],
  shareLinks: ShareLink[],
  unresolvedEventsCount: number = 0
): SecurityScoreData {
  let accountSecurity = 25; // standard base for authenticated admin
  let sessionHealth = 25;
  let sharingExposure = 25;
  let fileIntegrity = 25;

  // Session deductions
  const activeSessions = sessions.filter((s) => s.status === 'active');
  if (activeSessions.length > 3) {
    sessionHealth -= 8;
  } else if (activeSessions.length > 1) {
    sessionHealth -= 3;
  }

  // Sharing deductions: if too many open unexpired links exist
  const now = Date.now();
  const activeSharedLinks = shareLinks.filter((s) => s.active && s.expiresAt > now);
  if (activeSharedLinks.length > 5) {
    sharingExposure -= 10;
  } else if (activeSharedLinks.length > 2) {
    sharingExposure -= 5;
  }

  // Event deductions
  if (unresolvedEventsCount > 0) {
    accountSecurity -= Math.min(15, unresolvedEventsCount * 5);
  }

  // File integrity: check if all active files have valid checksums
  const activeFiles = files.filter((f) => !f.deleted);
  const filesWithoutChecksum = activeFiles.filter((f) => !f.checksum || f.checksum.length < 10);
  if (filesWithoutChecksum.length > 0) {
    fileIntegrity -= Math.min(15, filesWithoutChecksum.length * 5);
  }

  const totalScore = Math.max(
    40,
    Math.min(100, accountSecurity + sessionHealth + sharingExposure + fileIntegrity)
  );

  let grade: 'STRONG' | 'MODERATE' | 'ATTENTION_REQUIRED' = 'STRONG';
  let explanation = 'Your account and data infrastructure are well protected.';

  if (totalScore < 70) {
    grade = 'ATTENTION_REQUIRED';
    explanation = 'Multiple active shared links or pending security alerts require review.';
  } else if (totalScore < 88) {
    grade = 'MODERATE';
    explanation = 'Good posture, but review active sessions and temporary shared links.';
  }

  return {
    score: totalScore,
    grade,
    encryptionActive: true,
    twoFactorActive: true,
    recentPasswordChange: true,
    unresolvedEventsCount,
    activeSessionsCount: activeSessions.length,
    activeSharedLinksCount: activeSharedLinks.length,
    integrityIssuesCount: filesWithoutChecksum.length,
    explanation,
    breakdown: {
      accountSecurity,
      sessionHealth,
      sharingExposure,
      fileIntegrity,
    },
  };
}

export interface SmartFolderSuggestion {
  suggestedFolder: string;
  category: string;
  files: FileItem[];
  reason: string;
}

export function generateSmartOrganizationSuggestions(files: FileItem[]): SmartFolderSuggestion[] {
  // Only check unorganized files (in root folder)
  const rootFiles = files.filter((f) => !f.deleted && !f.folderId);
  const suggestionsMap: Record<string, { category: string; files: FileItem[]; reason: string }> = {};

  for (const f of rootFiles) {
    const ext = (f.extension || '').toLowerCase();
    const name = f.name.toLowerCase();

    let targetFolder = '';
    let category = '';
    let reason = '';

    if (ext === 'pdf' || ext === 'doc' || ext === 'docx' || ext === 'txt') {
      if (name.includes('report') || name.includes('q1') || name.includes('q2') || name.includes('q3') || name.includes('q4') || name.includes('annual')) {
        targetFolder = 'Reports';
        category = 'Documents';
        reason = 'Matching financial/periodic report keywords';
      } else if (name.includes('project') || name.includes('spec') || name.includes('blueprint')) {
        targetFolder = 'Projects';
        category = 'Documents';
        reason = 'Identified project architectural document';
      } else {
        targetFolder = 'Documents';
        category = 'Documents';
        reason = 'Standard enterprise document format';
      }
    } else if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp' || ext === 'svg') {
      targetFolder = 'Images';
      category = 'Media';
      reason = 'Visual media asset';
    } else if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') {
      targetFolder = 'Finance & Data';
      category = 'Spreadsheets';
      reason = 'Structured data workbook';
    } else if (ext === 'zip' || ext === 'tar' || ext === 'gz' || ext === 'rar') {
      targetFolder = 'Archives';
      category = 'Archives';
      reason = 'Compressed package archive';
    } else if (ext === 'json' || ext === 'ts' || ext === 'js' || ext === 'py') {
      targetFolder = 'Code & Config';
      category = 'Code';
      reason = 'Source code / data payload';
    }

    if (targetFolder) {
      if (!suggestionsMap[targetFolder]) {
        suggestionsMap[targetFolder] = { category, files: [], reason };
      }
      suggestionsMap[targetFolder].files.push(f);
    }
  }

  return Object.entries(suggestionsMap).map(([suggestedFolder, data]) => ({
    suggestedFolder,
    category: data.category,
    files: data.files,
    reason: data.reason,
  }));
}
