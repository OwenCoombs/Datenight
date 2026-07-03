import { Redirect } from 'expo-router';

import { getCoupleProfile } from '@/db/profileRepository';

export default function Index() {
  const profile = getCoupleProfile();
  return profile ? <Redirect href="/home" /> : <Redirect href="/onboarding" />;
}
