import { getDatabase } from '@/db/database';
import { CoupleProfile } from '@/types/profile';
import { createId } from '@/utils/ids';
import { nowIso } from '@/utils/time';

interface ProfileRow {
  id: string;
  partner_one_name: string;
  partner_two_name: string;
  created_at: string;
}

export function getCoupleProfile(): CoupleProfile | null {
  const db = getDatabase();
  const row = db.getFirstSync<ProfileRow>(
    'SELECT * FROM couple_profile ORDER BY created_at ASC LIMIT 1;',
  );
  if (!row) return null;
  return {
    id: row.id,
    partnerOneName: row.partner_one_name,
    partnerTwoName: row.partner_two_name,
    createdAt: row.created_at,
  };
}

export function saveCoupleProfile(
  partnerOneName: string,
  partnerTwoName: string,
): CoupleProfile {
  const db = getDatabase();
  const existing = getCoupleProfile();

  if (existing) {
    db.runSync(
      'UPDATE couple_profile SET partner_one_name = ?, partner_two_name = ? WHERE id = ?;',
      [partnerOneName, partnerTwoName, existing.id],
    );
    return { ...existing, partnerOneName, partnerTwoName };
  }

  const profile: CoupleProfile = {
    id: createId(),
    partnerOneName,
    partnerTwoName,
    createdAt: nowIso(),
  };
  db.runSync(
    'INSERT INTO couple_profile (id, partner_one_name, partner_two_name, created_at) VALUES (?, ?, ?, ?);',
    [profile.id, profile.partnerOneName, profile.partnerTwoName, profile.createdAt],
  );
  return profile;
}
