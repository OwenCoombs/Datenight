import { Directory, File, Paths } from 'expo-file-system';

/**
 * Move a temporary camera URI into app-controlled persistent storage.
 * Camera URIs live in cache and are not guaranteed to survive, so every
 * photo attached to a session must pass through here first.
 */
export function persistPhoto(tempUri: string, sessionId: string, photoId: string): string {
  const dir = new Directory(Paths.document, 'photos', sessionId);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }

  const extension = guessExtension(tempUri);
  const destination = new File(dir, `${photoId}.${extension}`);
  const source = new File(tempUri);
  source.copy(destination);
  return destination.uri;
}

export function deleteSessionPhotos(sessionId: string): void {
  try {
    const dir = new Directory(Paths.document, 'photos', sessionId);
    if (dir.exists) {
      dir.delete();
    }
  } catch {
    // Best effort — orphaned files are harmless.
  }
}

function guessExtension(uri: string): string {
  const match = /\.(\w{3,4})(?:\?|$)/.exec(uri);
  return match ? match[1].toLowerCase() : 'jpg';
}
