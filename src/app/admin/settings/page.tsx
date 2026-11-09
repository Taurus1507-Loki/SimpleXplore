import React from 'react';
import { db } from '@/lib/db';
import SettingsClient from './SettingsClient';
import { Settings } from 'lucide-react';

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await db.getSettings();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-600" />
          Website Configuration &amp; Settings
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Customize website branding, default currency, contact details and affiliate disclosures
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}

