import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Versioned migrations tracked via PRAGMA user_version.
 * Add new migrations to the end of the list — never edit old ones.
 */
const migrations: string[] = [
  // v1 — initial schema
  `
  CREATE TABLE IF NOT EXISTS couple_profile (
    id TEXT PRIMARY KEY,
    partner_one_name TEXT NOT NULL,
    partner_two_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS date_sessions (
    id TEXT PRIMARY KEY,
    experience_id TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TEXT,
    completed_at TEXT,
    score INTEGER,
    json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS date_photos (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    uri TEXT NOT NULL,
    round INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS session_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    type TEXT NOT NULL,
    partner TEXT,
    mission_id TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_status ON date_sessions(status);
  CREATE INDEX IF NOT EXISTS idx_photos_session ON date_photos(session_id);
  CREATE INDEX IF NOT EXISTS idx_events_session ON session_events(session_id);
  `,
];

export function runMigrations(db: SQLiteDatabase): void {
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version;');
  const currentVersion = row?.user_version ?? 0;

  for (let version = currentVersion; version < migrations.length; version += 1) {
    db.withTransactionSync(() => {
      db.execSync(migrations[version]);
      db.execSync(`PRAGMA user_version = ${version + 1};`);
    });
  }
}
