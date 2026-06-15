'use client';

import { useSearchParams } from 'next/navigation';
import DashboardHome from './DashboardHome';
import LinksPage from './LinksPage';
import AnalyticsPage from './AnalyticsPage';
import ApiKeysPage from './ApiKeysPage';
import SettingsPage from './SettingsPage';

export default function DashboardContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'home';

  return (
    <>
      {tab === 'home' && <DashboardHome />}
      {tab === 'links' && <LinksPage />}
      {tab === 'analytics' && <AnalyticsPage />}
      {tab === 'api-keys' && <ApiKeysPage />}
      {tab === 'settings' && <SettingsPage />}
      {!['home', 'links', 'analytics', 'api-keys', 'settings'].includes(tab) && <DashboardHome />}
    </>
  );
}
