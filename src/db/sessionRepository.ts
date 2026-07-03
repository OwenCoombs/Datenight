import { getDatabase } from '@/db/database';
import { DateSession, PhotoMemory, SessionEvent } from '@/types/date';

interface SessionRow {
  id: string;
  json: string;
}

/**
 * The full session lives as a JSON document (single source of truth for
 * resume). Photos and events are additionally mirrored into their own
 * tables for durability and simple querying.
 */
export function saveSession(session: DateSession): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO date_sessions (id, experience_id, status, started_at, completed_at, score, json)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       status = excluded.status,
       started_at = excluded.started_at,
       completed_at = excluded.completed_at,
       score = excluded.score,
       json = excluded.json;`,
    [
      session.id,
      session.experienceId,
      session.status,
      session.startedAt,
      session.completedAt,
      session.score ?? null,
      JSON.stringify(session),
    ],
  );
}

export function appendEvent(event: SessionEvent): void {
  const db = getDatabase();
  db.runSync(
    `INSERT OR IGNORE INTO session_events (id, session_id, type, partner, mission_id, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      event.id,
      event.sessionId,
      event.type,
      event.partner ?? null,
      event.missionId ?? null,
      event.metadata ? JSON.stringify(event.metadata) : null,
      event.createdAt,
    ],
  );
}

export function appendPhoto(photo: PhotoMemory): void {
  const db = getDatabase();
  db.runSync(
    `INSERT OR IGNORE INTO date_photos (id, session_id, uri, round, created_at)
     VALUES (?, ?, ?, ?, ?);`,
    [photo.id, photo.sessionId, photo.uri, photo.round, photo.createdAt],
  );
}

export function getSessionById(id: string): DateSession | null {
  const db = getDatabase();
  const row = db.getFirstSync<SessionRow>(
    'SELECT id, json FROM date_sessions WHERE id = ?;',
    [id],
  );
  return row ? parseSession(row) : null;
}

/** The single resumable session, if one exists. */
export function getActiveSession(): DateSession | null {
  const db = getDatabase();
  const row = db.getFirstSync<SessionRow>(
    `SELECT id, json FROM date_sessions
     WHERE status IN ('setup', 'ready', 'active')
     ORDER BY started_at DESC LIMIT 1;`,
  );
  return row ? parseSession(row) : null;
}

export function getFinishedSessions(): DateSession[] {
  const db = getDatabase();
  const rows = db.getAllSync<SessionRow>(
    `SELECT id, json FROM date_sessions
     WHERE status IN ('completed', 'ended_early')
     ORDER BY completed_at DESC;`,
  );
  return rows
    .map((row) => parseSession(row))
    .filter((session): session is DateSession => session !== null);
}

export function deleteSession(id: string): void {
  const db = getDatabase();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM session_events WHERE session_id = ?;', [id]);
    db.runSync('DELETE FROM date_photos WHERE session_id = ?;', [id]);
    db.runSync('DELETE FROM date_sessions WHERE id = ?;', [id]);
  });
}

function parseSession(row: SessionRow): DateSession | null {
  try {
    return JSON.parse(row.json) as DateSession;
  } catch {
    // Corrupted row — surface as missing rather than crashing the app.
    return null;
  }
}
