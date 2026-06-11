'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings } from '@/actions/settings';

type ShopSettings = {
  name: string;
  logoUrl: string;
};

type SettingsContextType = {
  settings: ShopSettings;
  updateSettings: (partial: Partial<ShopSettings>) => void;
};

const defaults: ShopSettings = { name: '', logoUrl: '' };

const SettingsContext = createContext<SettingsContextType>({
  settings: defaults,
  updateSettings: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ShopSettings>(defaults);

  useEffect(() => {
    getSettings().then(data => {
      if (data) {
        setSettings({ name: data.name ?? '', logoUrl: data.logo_url ?? '' });
      }
    });
  }, []);

  const updateSettings = (partial: Partial<ShopSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useShopSettings() {
  return useContext(SettingsContext);
}
