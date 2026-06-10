'use client';

import { Building2, Phone, Mail, MapPin, Tag, Percent, Save, CheckCircle } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { getSettings, updateSettingsAction } from '@/actions/settings';

type Settings = {
  name: string;
  phone: string;
  email: string;
  address: string;
  invoicePrefix: string;
  devise: string;
  tvaRate: number;
};

const defaults: Settings = {
  name: '',
  phone: '',
  email: '',
  address: '',
  invoicePrefix: 'FAC',
  devise: 'FCFA',
  tvaRate: 18,
};

export default function ParametresPage() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getSettings();
      if (data) {
        setSettings({
          name: data.name ?? '',
          phone: data.phone ?? '',
          email: data.email ?? '',
          address: data.address ?? '',
          invoicePrefix: data.invoice_prefix ?? 'FAC',
          devise: data.devise ?? 'FCFA',
          tvaRate: data.tva_rate ?? 18,
        });
      }
    });
  }, []);

  const handleSave = () => {
    setSaved(false);
    setError('');
    const formData = new FormData();
    formData.set('name', settings.name);
    formData.set('phone', settings.phone);
    formData.set('email', settings.email);
    formData.set('address', settings.address);
    formData.set('invoicePrefix', settings.invoicePrefix);
    formData.set('devise', settings.devise);
    formData.set('tvaRate', String(settings.tvaRate));
    startTransition(async () => {
      const result = await updateSettingsAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Paramètres</h1>
        <p className="text-sm text-[#6B7280] mt-1">Configurez les informations de votre boutique</p>
      </div>

      {/* Infos boutique */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-base font-semibold text-[#111827]">Informations de la boutique</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Nom de la boutique</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={settings.name}
                  onChange={e => setSettings({ ...settings, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Téléphone</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={settings.phone}
                  onChange={e => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Adresse</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={settings.address}
                  onChange={e => setSettings({ ...settings, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facturation */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-base font-semibold text-[#111827]">Paramètres de facturation</h2>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Préfixe factures</label>
              <div className="relative">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={e => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">Ex: FAC-202606-0001</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Devise</label>
              <input
                type="text"
                value={settings.devise}
                disabled
                className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] text-[#9CA3AF] cursor-not-allowed"
              />
              <p className="text-xs text-[#9CA3AF] mt-1">FCFA — fixe pour la V1</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Taux TVA (%)</label>
              <div className="relative">
                <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="number"
                  value={settings.tvaRate}
                  onChange={e => setSettings({ ...settings, tvaRate: Number(e.target.value) })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-base font-semibold text-[#111827]">Logo de la boutique</h2>
        </div>
        <div className="p-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl bg-[#F3F4F6] border-2 border-dashed border-[#D1D5DB] flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#D1D5DB]" />
          </div>
          <div>
            <button className="text-sm font-medium text-[#0D5C4A] hover:underline">
              Télécharger un logo
            </button>
            <p className="text-xs text-[#9CA3AF] mt-1">PNG, JPG · max 2 MB · recommandé 200×200px</p>
          </div>
        </div>
      </div>

      {/* Feedback + bouton sauvegarder */}
      <div className="flex items-center justify-between gap-4">
        <div>
          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              Paramètres sauvegardés
            </div>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-[#0a4a3a] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isPending ? 'Enregistrement...' : 'Sauvegarder les modifications'}
        </button>
      </div>
    </div>
  );
}
