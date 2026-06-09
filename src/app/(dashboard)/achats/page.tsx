'use client';

import { useState } from 'react';
import { mockPurchaseOrders, mockSuppliers } from '@/data/mock';
import { formatCFA, formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Truck, X, CheckCircle2, Clock, PackageCheck } from 'lucide-react';

const statusConfig = {
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700' },
  partielle:  { label: 'Partielle',  className: 'bg-blue-50 text-blue-700' },
  recue:      { label: 'Reçue',      className: 'bg-emerald-50 text-emerald-700' },
  annulee:    { label: 'Annulée',    className: 'bg-[#F3F4F6] text-[#6B7280]' },
};

type PurchaseOrder = {
  id: string;
  number: string;
  supplierName: string;
  supplierId: string;
  date: string;
  expectedDate: string;
  amount: number;
  status: string;
  items: number;
};

type ModalMode = null | 'create' | 'detail' | 'receive';

export default function AchatsPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  const [form, setForm] = useState({
    supplierId: mockSuppliers[0]?.id ?? '',
    date: new Date().toISOString().split('T')[0],
    expectedDate: '',
    amount: '',
    items: '1',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  const filtered = orders.filter(bc => {
    const matchSearch =
      bc.number.toLowerCase().includes(search.toLowerCase()) ||
      bc.supplierName.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter ? bc.status === statusFilter : true);
  });

  const openDetail = (order: PurchaseOrder) => { setSelectedOrder(order); setModalMode('detail'); };
  const openReceive = (order: PurchaseOrder) => { setSelectedOrder(order); setModalMode('receive'); };
  const openCreate = () => {
    setForm({ supplierId: mockSuppliers[0]?.id ?? '', date: new Date().toISOString().split('T')[0], expectedDate: '', amount: '', items: '1', notes: '' });
    setFormError('');
    setModalMode('create');
  };
  const closeModal = () => { setModalMode(null); setSelectedOrder(null); };

  const handleCreate = () => {
    if (!form.supplierId || !form.expectedDate || !form.amount) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const supplier = mockSuppliers.find(s => s.id === form.supplierId);
    if (!supplier) return;
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const seq = String(orders.length + 1).padStart(4, '0');
    const newOrder: PurchaseOrder = {
      id: `bc_${Date.now()}`,
      number: `BC-${now.getFullYear()}${month}-${seq}`,
      supplierName: supplier.name,
      supplierId: supplier.id,
      date: form.date,
      expectedDate: form.expectedDate,
      amount: Math.round(parseFloat(form.amount) * 100),
      status: 'en_attente',
      items: parseInt(form.items) || 1,
    };
    setOrders(prev => [newOrder, ...prev]);
    closeModal();
  };

  const handleReceive = (partial: boolean) => {
    if (!selectedOrder) return;
    setOrders(prev =>
      prev.map(o => o.id === selectedOrder.id ? { ...o, status: partial ? 'partielle' : 'recue' } : o)
    );
    closeModal();
  };

  const tabs = [
    { key: '', label: `Tous (${orders.length})` },
    { key: 'en_attente', label: `En attente (${orders.filter(b => b.status === 'en_attente').length})` },
    { key: 'partielle',  label: `Partielle (${orders.filter(b => b.status === 'partielle').length})` },
    { key: 'recue',      label: `Reçus (${orders.filter(b => b.status === 'recue').length})` },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Bons de commande</h1>
          <p className="text-sm text-text-secondary mt-1">
            {orders.length} bons · {orders.filter(b => b.status === 'en_attente').length} en attente
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-[#0a4a3a] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nouveau bon
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        {/* Onglets */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-[#E5E7EB] overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${statusFilter === tab.key ? 'border-[#0D5C4A] text-[#0D5C4A]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="p-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" placeholder="N° bon ou fournisseur..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5">N° Bon</th>
                <th className="px-5 py-3.5">Fournisseur</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Livraison prévue</th>
                <th className="px-5 py-3.5">Montant</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length > 0 ? filtered.map(bc => {
                const cfg = statusConfig[bc.status as keyof typeof statusConfig] ?? statusConfig.en_attente;
                const canReceive = bc.status === 'en_attente' || bc.status === 'partielle';
                return (
                  <tr key={bc.id} className="group hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4 font-semibold text-[#111827]">{bc.number}</td>
                    <td className="px-5 py-4 text-[#374151]">
                      <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#9CA3AF]" />{bc.supplierName}</div>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">{formatDate(bc.date)}</td>
                    <td className="px-5 py-4 text-[#6B7280]">{formatDate(bc.expectedDate)}</td>
                    <td className="px-5 py-4 font-bold text-[#111827]">{formatCFA(bc.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openDetail(bc)}
                          className="p-1.5 text-[#9CA3AF] hover:text-[#0D5C4A] hover:bg-[#F0FDF9] rounded-lg transition-colors hover:scale-110 active:scale-95"
                          title="Voir le détail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canReceive && (
                          <button
                            onClick={() => openReceive(bc)}
                            className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors active:scale-95"
                          >
                            Réceptionner
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-[#9CA3AF] text-sm">
                    Aucun bon de commande trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">{filtered.length} bon(s) affiché(s)</div>
      </div>

      {/* ===== MODAL NOUVEAU BON ===== */}
      {modalMode === 'create' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Nouveau bon de commande</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">Créer un bon d&apos;achat fournisseur</p>
              </div>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">Fournisseur <span className="text-red-500">*</span></label>
                <select
                  value={form.supplierId}
                  onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                >
                  {mockSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Date commande <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Livraison prévue <span className="text-red-500">*</span></label>
                  <input type="date" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Montant (FCFA) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" placeholder="ex: 150000" value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Nb articles</label>
                  <input type="number" min="1" value={form.items}
                    onChange={e => setForm(f => ({ ...f, items: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all active:scale-95">
                  Annuler
                </button>
                <button onClick={handleCreate} className="px-4 py-2 text-sm font-medium text-white bg-[#0D5C4A] rounded-lg hover:bg-[#0a4a3a] hover:shadow-md transition-all active:scale-95">
                  Créer le bon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DÉTAIL ===== */}
      {modalMode === 'detail' && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">{selectedOrder.number}</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">Détail du bon de commande</p>
              </div>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {(() => {
                const cfg = statusConfig[selectedOrder.status as keyof typeof statusConfig] ?? statusConfig.en_attente;
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#6B7280]">Statut</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Fournisseur</span>
                        <span className="font-semibold text-[#111827]">{selectedOrder.supplierName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Date commande</span>
                        <span className="font-medium text-[#111827]">{formatDate(selectedOrder.date)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Livraison prévue</span>
                        <span className="font-medium text-[#111827]">{formatDate(selectedOrder.expectedDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">Nombre d&apos;articles</span>
                        <span className="font-medium text-[#111827]">{selectedOrder.items}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-[#E5E7EB] pt-3">
                        <span className="text-[#6B7280] font-medium">Montant total</span>
                        <span className="font-bold text-[#111827] text-base">{formatCFA(selectedOrder.amount)}</span>
                      </div>
                    </div>
                    {(selectedOrder.status === 'en_attente' || selectedOrder.status === 'partielle') && (
                      <button
                        onClick={() => { closeModal(); openReceive(selectedOrder); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all active:scale-95"
                      >
                        <PackageCheck className="w-4 h-4" />
                        Réceptionner ce bon
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL RÉCEPTIONNER ===== */}
      {modalMode === 'receive' && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#111827]">Réceptionner la commande</h2>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#6B7280]">
                Bon <span className="font-semibold text-[#111827]">{selectedOrder.number}</span> — {selectedOrder.supplierName}
              </p>
              <p className="text-sm text-[#6B7280]">La livraison est-elle complète ou partielle ?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleReceive(true)}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95"
                >
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Partielle</span>
                  <span className="text-xs text-[#6B7280] text-center">Une partie reçue</span>
                </button>
                <button
                  onClick={() => handleReceive(false)}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Complète</span>
                  <span className="text-xs text-[#6B7280] text-center">Tout reçu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
