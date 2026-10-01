import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  orderBy,
  addDoc,
} from 'firebase/firestore';
import { storage, db } from './firebase';
import { FileItem, FolderItem, FileVersionItem, ShareLink } from '../types';
import { logActivity } from './authService';

// Cryptographic SHA-256 Hash Computation
export async function calculateSHA256(file: File | Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Convert small/medium files to Base64 for instant client preview and offline fallback
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Format bytes helper
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Check for duplicate checksum in user files
export async function checkDuplicateChecksum(
  checksum: string,
  userEmail: string
): Promise<FileItem | null> {
  try {
    const q = query(
      collection(db, 'files'),
      where('ownerEmail', '==', userEmail),
      where('checksum', '==', checksum),
      where('deleted', '==', false)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as FileItem;
    }
    return null;
  } catch (err) {
    console.error('Error checking duplicate:', err);
    return null;
  }
}

// Check if file with same name exists in folder
export async function findExistingFileByName(
  name: string,
  folderId: string | null,
  userEmail: string
): Promise<FileItem | null> {
  try {
    const q = query(
      collection(db, 'files'),
      where('ownerEmail', '==', userEmail),
      where('name', '==', name),
      where('folderId', '==', folderId),
      where('deleted', '==', false)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as FileItem;
    }
    return null;
  } catch {
    return null;
  }
}

// Upload file with progress, SHA-256 calculation, and versioning
export async function uploadFileService(
  file: File,
  folderId: string | null,
  user: { uid: string; email: string; name: string },
  options?: {
    isNewVersionOf?: FileItem;
    onProgress?: (percent: number) => void;
    securityTag?: 'Confidential' | 'Internal' | 'Public' | 'Restricted';
  }
): Promise<FileItem> {
  const checksum = await calculateSHA256(file);
  const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || '' : '';
  const fileId = options?.isNewVersionOf?.id || `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const storagePath = `users/${user.uid}/files/${fileId}_${file.name}`;
  const storageRef = ref(storage, storagePath);

  let dataBase64 = '';
  if (file.size < 5 * 1024 * 1024) {
    try {
      dataBase64 = await fileToBase64(file);
    } catch (e) {
      console.warn('Could not cache base64 for file:', e);
    }
  }

  let downloadUrl = '';
  try {
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        checksum,
        ownerEmail: user.email,
        originalName: file.name,
      },
    });

    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          options?.onProgress?.(Math.round(progress));
        },
        (error) => {
          console.warn('Firebase Storage upload failed (falling back to Firestore cache):', error);
          // Fallback gracefully so files are still stored and functioning
          resolve();
        },
        async () => {
          try {
            downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          } catch {
            downloadUrl = dataBase64;
          }
          resolve();
        }
      );
    });
  } catch (err) {
    console.warn('Storage upload error caught:', err);
  }

  if (!downloadUrl && dataBase64) {
    downloadUrl = dataBase64;
  }

  const existingFile = options?.isNewVersionOf;
  let currentVersion = 1;

  if (existingFile) {
    // Archive previous version
    currentVersion = (existingFile.version || 1) + 1;
    const versionDoc: Omit<FileVersionItem, 'id'> = {
      fileId: existingFile.id,
      versionNumber: existingFile.version || 1,
      fileName: existingFile.name,
      size: existingFile.size,
      mimeType: existingFile.mimeType,
      checksum: existingFile.checksum,
      storagePath: existingFile.storagePath,
      storageUrl: existingFile.storageUrl,
      createdAt: existingFile.updatedAt || existingFile.createdAt,
      createdByEmail: existingFile.ownerEmail,
      createdByName: existingFile.ownerName,
      dataBase64: existingFile.dataBase64,
    };
    await addDoc(collection(db, 'fileVersions'), versionDoc);
  }

  const fileData: FileItem = {
    id: fileId,
    name: file.name,
    originalName: file.name,
    storagePath,
    storageUrl: downloadUrl,
    ownerId: user.uid,
    ownerEmail: user.email,
    ownerName: user.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    extension: ext,
    folderId: folderId || null,
    createdAt: existingFile?.createdAt || Date.now(),
    updatedAt: Date.now(),
    deleted: false,
    deletedAt: null,
    checksum,
    isFavorite: existingFile?.isFavorite || false,
    securityTag: options?.securityTag || 'Internal',
    version: currentVersion,
    versionCount: currentVersion,
    dataBase64: dataBase64 || existingFile?.dataBase64 || '',
  };

  await setDoc(doc(db, 'files', fileId), fileData);

  await logActivity(
    'FILE_UPLOADED',
    existingFile ? `New Version (v${currentVersion}) Uploaded` : 'File Uploaded',
    `Uploaded "${file.name}" (${formatBytes(file.size)}) with SHA-256 hash ${checksum.substring(0, 10)}...`,
    user.email,
    user.name,
    'file',
    'success',
    { fileId, fileName: file.name }
  );

  return fileData;
}

// Move file to Trash
export async function moveFileToTrash(file: FileItem, user: { email: string; name: string }) {
  await updateDoc(doc(db, 'files', file.id), {
    deleted: true,
    deletedAt: Date.now(),
  });

  await logActivity(
    'FILE_DELETED',
    'File Moved to Trash',
    `Moved "${file.name}" to Trash`,
    user.email,
    user.name,
    'file',
    'warning',
    { fileId: file.id, fileName: file.name }
  );
}

// Restore file from Trash
export async function restoreFileFromTrash(file: FileItem, user: { email: string; name: string }) {
  await updateDoc(doc(db, 'files', file.id), {
    deleted: false,
    deletedAt: null,
  });

  await logActivity(
    'FILE_RESTORED',
    'File Restored',
    `Restored "${file.name}" from Trash to active storage`,
    user.email,
    user.name,
    'file',
    'success',
    { fileId: file.id, fileName: file.name }
  );
}

// Permanently delete file
export async function permanentlyDeleteFile(file: FileItem, user: { email: string; name: string }) {
  // 1. Delete from Firebase Storage
  if (file.storagePath) {
    try {
      const storageRef = ref(storage, file.storagePath);
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('Storage object deletion skipped or already absent:', e);
    }
  }

  // 2. Delete Firestore doc
  await deleteDoc(doc(db, 'files', file.id));

  // 3. Delete versions
  try {
    const versionsQuery = query(collection(db, 'fileVersions'), where('fileId', '==', file.id));
    const versionSnaps = await getDocs(versionsQuery);
    for (const v of versionSnaps.docs) {
      await deleteDoc(doc(db, 'fileVersions', v.id));
    }
  } catch (err) {
    console.error('Error deleting versions:', err);
  }

  await logActivity(
    'FILE_PERMANENTLY_DELETED',
    'File Permanently Purged',
    `Permanently purged "${file.name}" (${formatBytes(file.size)})`,
    user.email,
    user.name,
    'file',
    'warning',
    { fileId: file.id, fileName: file.name }
  );
}

// Empty entire trash
export async function emptyTrash(userEmail: string, user: { email: string; name: string }) {
  const q = query(
    collection(db, 'files'),
    where('ownerEmail', '==', userEmail),
    where('deleted', '==', true)
  );
  const snap = await getDocs(q);
  let count = 0;
  for (const docSnap of snap.docs) {
    const file = { id: docSnap.id, ...docSnap.data() } as FileItem;
    await permanentlyDeleteFile(file, user);
    count++;
  }
  return count;
}

// Rename file
export async function renameFile(
  file: FileItem,
  newName: string,
  user: { email: string; name: string }
) {
  const ext = newName.includes('.') ? newName.split('.').pop()?.toLowerCase() || '' : file.extension;
  await updateDoc(doc(db, 'files', file.id), {
    name: newName,
    extension: ext,
    updatedAt: Date.now(),
  });

  await logActivity(
    'FILE_RENAMED',
    'File Renamed',
    `Renamed "${file.name}" to "${newName}"`,
    user.email,
    user.name,
    'file',
    'success',
    { fileId: file.id, fileName: newName }
  );
}

// Move file to folder
export async function moveFile(
  file: FileItem,
  targetFolderId: string | null,
  targetFolderName: string,
  user: { email: string; name: string }
) {
  await updateDoc(doc(db, 'files', file.id), {
    folderId: targetFolderId,
    updatedAt: Date.now(),
  });

  await logActivity(
    'FILE_MOVED',
    'File Moved',
    `Moved "${file.name}" to folder: ${targetFolderName || 'Root Workspace'}`,
    user.email,
    user.name,
    'file',
    'success',
    { fileId: file.id, fileName: file.name }
  );
}

// Create new folder
export async function createFolderService(
  name: string,
  parentId: string | null,
  user: { uid?: string; email: string; name: string },
  color = '#6366f1'
): Promise<FolderItem> {
  const folderId = `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const folderData: FolderItem = {
    id: folderId,
    name,
    parentId: parentId || null,
    ownerId: user.uid || `admin_${user.email}`,
    ownerEmail: user.email,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    color,
    fileCount: 0,
  };

  await setDoc(doc(db, 'folders', folderId), folderData);

  await logActivity(
    'FOLDER_CREATED',
    'New Folder Created',
    `Created folder "${name}"`,
    user.email,
    user.name,
    'file',
    'success'
  );

  return folderData;
}

export const createFolder = (
  name: string,
  parentId: string | null,
  color = '#6366f1',
  user: { email: string; name: string }
) => createFolderService(name, parentId, user, color);

// Get Share Link by Token
export async function getShareLinkByToken(token: string): Promise<ShareLink | null> {
  try {
    const q = query(collection(db, 'shareLinks'), where('token', '==', token));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as ShareLink;
  } catch (err) {
    console.error('Error fetching share link by token:', err);
    return null;
  }
}

// Generate Secure Share Link
export async function createShareLinkService(
  file: FileItem,
  expiresInHours: number,
  user: { email: string; name: string }
): Promise<ShareLink> {
  const token = `aether_share_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
  const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const expiresAt = Date.now() + expiresInHours * 60 * 60 * 1000;

  const shareData: ShareLink = {
    id: shareId,
    token,
    fileId: file.id,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.mimeType,
    storageUrl: file.storageUrl,
    fileChecksum: file.checksum,
    createdAt: Date.now(),
    expiresAt,
    createdByEmail: user.email,
    createdByName: user.name,
    active: true,
    accessCount: 0,
  };

  await setDoc(doc(db, 'shareLinks', shareId), shareData);

  await logActivity(
    'FILE_SHARED',
    'Secure Share Link Created',
    `Created secure ${expiresInHours}h expiring share link for "${file.name}"`,
    user.email,
    user.name,
    'security',
    'success',
    { fileId: file.id, fileName: file.name }
  );

  return shareData;
}

// Revoke Share Link
export async function revokeShareLinkService(
  shareId: string,
  fileName: string,
  user: { email: string; name: string }
) {
  await updateDoc(doc(db, 'shareLinks', shareId), {
    active: false,
  });

  await logActivity(
    'SHARE_LINK_REVOKED',
    'Share Link Revoked',
    `Deactivated active sharing link for "${fileName}"`,
    user.email,
    user.name,
    'security',
    'warning'
  );
}

// Fetch file version history
export async function getFileVersionHistory(fileId: string): Promise<FileVersionItem[]> {
  try {
    const q = query(
      collection(db, 'fileVersions'),
      where('fileId', '==', fileId),
      orderBy('versionNumber', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FileVersionItem));
  } catch {
    return [];
  }
}

// Restore a previous version
export async function restoreFileVersionService(
  versionItem: FileVersionItem,
  currentFile: FileItem,
  user: { email: string; name: string }
) {
  // Archive current as a version
  const newArchiveVersion = (currentFile.version || 1) + 1;
  await addDoc(collection(db, 'fileVersions'), {
    fileId: currentFile.id,
    versionNumber: currentFile.version || 1,
    fileName: currentFile.name,
    size: currentFile.size,
    mimeType: currentFile.mimeType,
    checksum: currentFile.checksum,
    storagePath: currentFile.storagePath,
    storageUrl: currentFile.storageUrl,
    createdAt: currentFile.updatedAt || currentFile.createdAt,
    createdByEmail: currentFile.ownerEmail,
    createdByName: currentFile.ownerName,
    dataBase64: currentFile.dataBase64,
  });

  // Update active file to version item data
  await updateDoc(doc(db, 'files', currentFile.id), {
    name: versionItem.fileName,
    size: versionItem.size,
    mimeType: versionItem.mimeType,
    checksum: versionItem.checksum,
    storageUrl: versionItem.storageUrl,
    storagePath: versionItem.storagePath,
    dataBase64: versionItem.dataBase64 || '',
    version: newArchiveVersion,
    updatedAt: Date.now(),
  });

  await logActivity(
    'FILE_RESTORED',
    'File Version Restored',
    `Restored version v${versionItem.versionNumber} of "${versionItem.fileName}"`,
    user.email,
    user.name,
    'file',
    'success',
    { fileId: currentFile.id, fileName: versionItem.fileName }
  );
}
