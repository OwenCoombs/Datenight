import * as SQLite from 'expo-sqlite';

import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;
let initError: Error | null = null;

/**
 * Open (and migrate) the app database. Throws if SQLite cannot initialize,
 * so callers can show a real error state instead of hanging.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (initError) {
    throw initError;
  }
  if (!db) {
    try {
      db = SQLite.openDatabaseSync('datenight.db');
      db.execSync('PRAGMA journal_mode = WAL;');
      db.execSync('PRAGMA foreign_keys = ON;');
      runMigrations(db);
    } catch (error) {
      initError = error instanceof Error ? error : new Error(String(error));
      db = null;
      throw initError;
    }
  }
  return db;
}
