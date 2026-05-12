import { ConflictError } from '@shared/errors';

/**
 * Optimistic locking helper
 * Used for concurrent update detection (e.g., dishes version)
 */

export function checkVersion(currentVersion: number, expectedVersion: number): void {
  if (currentVersion !== expectedVersion) {
    throw new ConflictError(
      'VERSION_MISMATCH',
      'Resource has been modified. Please refresh and retry.'
    );
  }
}
