'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, FileText, Users, ShoppingCart,
  TrendingUp, Settings, Truck, ClipboardList, ArrowLeftRight,
  BarChart3, Plus, ChevronDown, ChevronRight, BarChart2,
  X, Check, Zap, Star, Building2,
} from 'lucide-react';
import { useState } from 'react';
import { Logo } from './logo';

const navItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Stock', href: '/stock', icon: Package },
  { label: 'Factures', href: '/factures', icon: FileText },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Analytiques', href: '/analytiques', icon: BarChart2 },
];

const achatsPaths = ['/fournisseurs', '/achats'];
const ventesPaths = ['/ventes/transactions', '/ventes/rapports'];

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    price: '5 900',
    priceLabel: 'FCFA/mois',
    desc: 'Pour démarrer votre activité',
    color: '#6B7280',
    features: [
      'Factures illimitées',
      'Jusqu\'à 50 clients',
      'Gestion du stock de base',
      'Support par email',
    ],
    disabled: ['Bons de commande', 'Fournisseurs', 'Analytiques avancées', 'Multi-utilisateurs'],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Star,
    price: '19 900',
    priceLabel: 'FCFA/mois',
    desc: 'Le plus populaire pour les commerçants',
    color: '#0D9488',
    recommended: true,
    features: [
      'Tout le plan Starter',
      'Clients illimités',
      'Bons de commande & Fournisseurs',
      'Rapports & Analytiques',
      'Export PDF',
      'Support prioritaire',
    ],
    disabled: ['Multi-boutiques', 'Multi-utilisateurs'],
  },
  {
    id: 'business',
    name: 'Business',
    icon: Building2,
    price: 'Sur devis',
    priceLabel: '',
    desc: 'Pour les grandes structures',
    color: '#0D5C4A',
    features: [
      'Tout le plan Pro',
      'Multi-boutiques',
      'Multi-utilisateurs (jusqu\'à 5)',
      'Tableau de bord avancé',
      'Support dédié 7j/7',
      'Formation incluse',
    ],
    disabled: [],
  },
];

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState('pro');
  const [confirmed, setConfirmed] = useState(false);

  const handleSubscribe = () => {
    setConfirmed(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">1 mois gratuit, sans engagement</h2>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full">Offre limitée</span>
            </div>
            <p className="text-sm text-gray-500">
              Choisissez votre plan et essayez gratuitement pendant <span className="font-semibold text-[#0D9488]">30 jours</span>. Aucune carte requise.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-[#E8F5F1] flex items-center justify-center">
              <Check className="w-8 h-8 text-[#0D9488]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Demande envoyée !</h3>
            <p className="text-sm text-gray-500 text-center">
              Notre équipe vous contactera dans les 24h pour finaliser votre abonnement.
            </p>
          </div>
        ) : (
          <>
            {/* Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selected === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelected(plan.id)}
                    className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-[#0D9488] bg-[#F0FDFB] shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    {plan.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#0D9488] text-white text-[11px] font-bold rounded-full whitespace-nowrap">
                        Recommandé
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: plan.color + '20' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: plan.color }} />
                      </div>
                      <span className="font-bold text-gray-900 text-sm">{plan.name}</span>
                    </div>
                    <div className="mb-1">
                      <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                      {plan.priceLabel && (
                        <span className="text-xs text-gray-500 ml-1">{plan.priceLabel}</span>
                      )}
                    </div>
                    {plan.id !== 'business' && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          1er mois offert
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-500 mb-3 leading-snug">{plan.desc}</p>
                    <ul className="space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[11.5px] text-gray-700">
                          <Check className="w-3 h-3 text-[#0D9488] mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                      {plan.disabled.map((f) => (
                        <li key={f} className="flex items-start gap-1.5 text-[11.5px] text-gray-400 line-through">
                          <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400">
                {selected === 'business'
                  ? 'Tarif personnalisé selon vos besoins. Devis sous 24h.'
                  : `Gratuit pendant 30 jours, puis ${plans.find(p => p.id === selected)?.price} FCFA/mois. Orange Money | Wave | virement.`}
              </p>
              <button
                onClick={handleSubscribe}
                className="w-full sm:w-auto bg-[#0D9488] hover:bg-[#0a7a6e] text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
              >
                {selected === 'business'
                  ? 'Nous contacter'
                  : 'Essayer gratuitement - 1 mois offert'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function matchPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + '/');
}

export function Sidebar() {
  const pathname = usePathname();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isActive = (href: string) => matchPath(pathname, href);
  const achatsSectionActive = achatsPaths.some(p => matchPath(pathname, p));
  const ventesSectionActive = ventesPaths.some(p => matchPath(pathname, p));

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    achats: achatsSectionActive,
    ventes: true,
  });
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenSections(prev => {
      const next = { ...prev };
      if (achatsPaths.some(p => matchPath(pathname, p))) next.achats = true;
      if (ventesPaths.some(p => matchPath(pathname, p))) next.ventes = true;
      return next;
    });
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <aside className="w-[260px] h-screen flex flex-col fixed left-0 top-0 bg-white border-r border-[#E5E7EB]">

        <div className="px-5 pt-6 pb-4">
          <Logo />
          <div className="pl-[52px] mt-[-4px]">
            <p className="text-[11px] text-[#6B7280]">Professional Plan</p>
          </div>
        </div>

        <div className="px-4 mb-5">
          <Link href="/factures/nouvelle" className="w-full flex items-center justify-between bg-[#0D5C4A] hover:bg-[#0a4a3a] text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 active:translate-y-0 group">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
              <span>Créer</span>
            </div>
            <span className="text-[11px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">N</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 pb-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                  active
                    ? 'bg-[#E8F5F1] text-[#0D5C4A]'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                <item.icon
                  className={`w-[18px] h-[18px] flex-shrink-0 ${active ? 'text-[#0D5C4A]' : 'text-[#9CA3AF]'}`}
                  strokeWidth={1.8}
                />
                {item.label}
              </Link>
            );
          })}

          {/* Section Achats */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('achats')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-[13.5px] font-medium rounded-lg transition-all ${
                achatsSectionActive
                  ? 'bg-[#E8F5F1] text-[#0D5C4A]'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart
                  className={`w-[18px] h-[18px] ${achatsSectionActive ? 'text-[#0D5C4A]' : 'text-[#9CA3AF]'}`}
                  strokeWidth={1.8}
                />
                <span>Achats</span>
              </div>
              {openSections.achats
                ? <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
                : <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />}
            </button>

            {openSections.achats && (
              <div className="mt-0.5 ml-6 pl-3 border-l border-[#E5E7EB] space-y-0.5">
                {([
                  { href: '/fournisseurs', label: 'Fournisseurs', icon: Truck },
                  { href: '/achats', label: 'Bons de commande', icon: ClipboardList },
                ] as const).map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                        active
                          ? 'bg-[#E8F5F1] text-[#0D5C4A] font-semibold'
                          : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${active ? 'text-[#0D5C4A]' : 'text-[#9CA3AF]'}`}
                        strokeWidth={1.8}
                      />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section Ventes */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection('ventes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-[13.5px] font-medium rounded-lg transition-all ${
                ventesSectionActive
                  ? 'bg-[#E8F5F1] text-[#0D5C4A]'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp
                  className={`w-[18px] h-[18px] ${ventesSectionActive ? 'text-[#0D5C4A]' : 'text-[#9CA3AF]'}`}
                  strokeWidth={1.8}
                />
                <span>Ventes</span>
              </div>
              {openSections.ventes
                ? <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
                : <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />}
            </button>

            {openSections.ventes && (
              <div className="mt-0.5 ml-6 pl-3 border-l border-[#E5E7EB] space-y-0.5">
                {([
                  { href: '/ventes/transactions', label: 'Transactions', icon: ArrowLeftRight },
                  { href: '/ventes/rapports', label: 'Rapports', icon: BarChart3 },
                ] as const).map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                        active
                          ? 'bg-[#E8F5F1] text-[#0D5C4A] font-semibold'
                          : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${active ? 'text-[#0D5C4A]' : 'text-[#9CA3AF]'}`}
                        strokeWidth={1.8}
                      />
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Paramètres */}
          <div className="pt-1">
            <Link
              href="/parametres"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all ${
                isActive('/parametres')
                  ? 'bg-[#E8F5F1] text-[#0D5C4A]'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`}
            >
              <Settings
                className={`w-[18px] h-[18px] flex-shrink-0 ${isActive('/parametres') ? 'text-[#0D5C4A]' : 'text-[#9CA3AF]'}`}
                strokeWidth={1.8}
              />
              Paramètres
            </Link>
          </div>
        </nav>

        {/* Carte Upgrade */}
        <div className="p-4 mx-3 mb-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-[13px] font-bold text-[#111827] mb-1">3 jours restants !</p>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full mb-2.5 overflow-hidden">
            <div className="h-full w-[57%] bg-[#0D9488] rounded-full" />
          </div>
          <p className="text-[11.5px] text-[#6B7280] leading-snug mb-3">
            Choisissez un plan et débloquez toutes les fonctionnalités.
          </p>
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full bg-[#0D9488] hover:bg-[#0a7a6e] text-white text-[12.5px] font-semibold py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0"
          >
            Upgrade plan
          </button>
        </div>
      </aside>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
