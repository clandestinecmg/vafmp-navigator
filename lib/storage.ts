// lib/storage.ts
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadMetadata,
} from 'firebase/storage';
import { app } from './firebase';
import { auth } from './authApi';

/** Single storage instance */
export const storage = getStorage(app);

/** ---- Folder “categories” kept in one place for consistency ---- */
export const STORAGE_CATEGORIES = {
  profile: 'profile', // profile photos, avatar
  claims: 'claims', // claim-related docs
  scans: 'scans', // camera/scan PDFs & images
  attachments: 'attachments', // misc user uploads
} as const;

export type StorageCategory = keyof typeof STORAGE_CATEGORIES;

/** Build a user-scoped path: users/{uid}/{category}/{filename} */
function userPath(
  category: StorageCategory | string,
  filename: string,
): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not signed in');
  const cat =
    typeof category === 'string' ? category : STORAGE_CATEGORIES[category];
  return `users/${uid}/${cat}/${filename}`;
}

/** Normalize incoming file data for Expo Go / native builds */
function normalizeData(
  data: Blob | Uint8Array | ArrayBuffer,
): Blob | Uint8Array {
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  return data as Blob | Uint8Array;
}

/** Core uploader that everything routes through */
export async function uploadUserFile(
  category: StorageCategory | string,
  filename: string,
  data: Blob | Uint8Array | ArrayBuffer,
  opts?: {
    metadata?: UploadMetadata;
    onProgress?: (percent: number) => void;
  },
): Promise<string> {
  const path = userPath(category, filename);
  const fileRef = ref(storage, path);
  const task = uploadBytesResumable(
    fileRef,
    normalizeData(data),
    opts?.metadata,
  );

  return new Promise<string>((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        if (opts?.onProgress) {
          const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
          opts.onProgress(Math.round(pct));
        }
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}

/** Convenience: read URL for a user file */
export async function getUserFileUrl(
  category: StorageCategory | string,
  filename: string,
): Promise<string> {
  const path = userPath(category, filename);
  return getDownloadURL(ref(storage, path));
}

/** Convenience: delete a user file */
export async function deleteUserFile(
  category: StorageCategory | string,
  filename: string,
): Promise<void> {
  const path = userPath(category, filename);
  await deleteObject(ref(storage, path));
}

/* ======================================================================
   READY-TO-USE HELPERS
   ====================================================================== */

export function uploadProfileImage(
  filename: string,
  data: Blob | Uint8Array | ArrayBuffer,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadUserFile('profile', filename, data, {
    metadata: { contentType: inferContentType(filename) },
    onProgress,
  });
}

export function uploadClaimFile(
  filename: string,
  data: Blob | Uint8Array | ArrayBuffer,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadUserFile('claims', filename, data, {
    metadata: { contentType: inferContentType(filename) },
    onProgress,
  });
}

export function uploadScan(
  filename: string,
  data: Blob | Uint8Array | ArrayBuffer,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadUserFile('scans', filename, data, {
    metadata: { contentType: inferContentType(filename) },
    onProgress,
  });
}

export function uploadAttachment(
  filename: string,
  data: Blob | Uint8Array | ArrayBuffer,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return uploadUserFile('attachments', filename, data, {
    metadata: { contentType: inferContentType(filename) },
    onProgress,
  });
}

/** Guess content type from filename */
function inferContentType(name: string): string | undefined {
  const n = name.toLowerCase();
  if (n.endsWith('.jpg') || n.endsWith('.jpeg')) return 'image/jpeg';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  if (n.endsWith('.heic')) return 'image/heic';
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.txt')) return 'text/plain';
  return undefined;
}
