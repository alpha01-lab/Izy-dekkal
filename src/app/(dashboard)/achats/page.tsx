'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { getPurchaseOrders, createPurchaseOrderAction, updatePurchaseOrderStatusAction } from '@/actions/purchase-orders';
import { getSuppliers } from '@/actions/suppliers';
import { getProducts } from '@/actions/products';
import { formatCFA, formatDate } from '@/lib/utils';
import { Plus, Search, Eye, Truck, X, CheckCircle2, Clock, PackageCheck, Trash2 } from 'lucide-react';

const statusConfig = {
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700' },
  partielle:  { label: 'Partielle',  className: 'bg-blue-50 text-blue-700' },
  recue:      { label: 'Reçue',      className: 'bg-emerald-50 text-emerald-700' },
};

type PurchaseOrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
};

type PurchaseOrder = {
  id: string;
  number: string;
  supplier_name: string;
  supplier_id: string;
  date: string;
  expected_date: string;
  amount: number;
  status: string;
  notes: string;
  purchase_order_items?: PurchaseOrderItem[];
};

type Supplier = { id: string; name: string };
type Product = { id: string; name: string; purchase_price: number; unit: string };
type ModalMode = null | 'create' | 'detail' | 'receive';

type OrderLine = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export default function AchatsPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [form, setForm] = useState({ supplierId: '', supplierName: '', date: new Date().toISOString().split('T')[0], expectedDate: '', notes: '' });
  const [lines, setLines] = useState<OrderLine[]>([]);
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [ordersData, suppliersData, productsData] = await Promise.all([getPurchaseOrders(), getSuppliers(), getProducts()]);
      setOrders(ordersData ?? []);
      setSuppliers(suppliersData ?? []);
      setProducts(productsData ?? []);
      if (suppliersData?.[0]) setForm(f => ({ ...f, supplierId: suppliersData[0].id, supplierName: suppliersData[0].name }));
    });
  }, []);

  const addLine = () => {
    setLines(prev => [...prev, { id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  const updateLine = (id: string, field: keyof OrderLine, value: string | number) => {
    setLines(prev => prev.map(line => {
      if (line.id !== id) return line;
      const newLine = { ...line, [field]: value };
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          newLine.unitPrice = product.purchase_price;
          newLine.productName = product.name;
        }
      }
      return newLine;
    }));
  };

  const orderTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const filtered = orders.filter(bc => {
    const matchSearch = bc.number.toLowerCase().includes(search.toLowerCase()) || bc.supplier_name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter ? bc.status === statusFilter : true);
  });

  const openDetail = (order: PurchaseOrder) => { setSelectedOrder(order); setModalMode('detail'); };
  const openReceive = (order: PurchaseOrder) => { setSelectedOrder(order); setModalMode('receive'); };
  const openCreate = () => {
    setForm({ supplierId: suppliers[0]?.id ?? '', supplierName: suppliers[0]?.name ?? '', date: new Date().toISOString().split('T')[0], expectedDate: '', notes: '' });
    setLines([]);
    setFormError('');
    setModalMode('create');
  };
  const closeModal = () => { setModalMode(null); setSelectedOrder(null); };

  const handleCreate = () => {
    if (!form.supplierId || !form.expectedDate) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (lines.length === 0 || lines.some(l => !l.productId)) {
      setFormError('Veuillez ajouter au moins un produit valide.');
      return;
    }
    setFormError('');
    const formData = new FormData();
    formData.append('supplierId', form.supplierId);
    formData.append('supplierName', form.supplierName);
    formData.append('date', form.date);
    formData.append('expectedDate', form.expectedDate);
    formData.append('notes', form.notes);
    formData.append('items', JSON.stringify(lines.map(l => ({
      productId: l.productId,
      productName: l.productName,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
    }))));

    startTransition(async () => {
      const result = await createPurchaseOrderAction(formData);
      if (result?.error) { setFormError(result.error); toast.error(result.error); return; }
      const fresh = await getPurchaseOrders();
      setOrders(fresh ?? []);
      toast.success('Bon de commande créé avec succès.');
      closeModal();
    });
  };

  const handleReceive = (partial: boolean) => {
    if (!selectedOrder) return;
    const newStatus = partial ? 'partielle' : 'recue';
    startTransition(async () => {
      const result = await updatePurchaseOrderStatusAction(selectedOrder.id, newStatus);
      if (result?.error) { toast.error(result.error); return; }
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: newStatus } : o));
      toast.success(partial ? 'Réception partielle enregistrée. Stock mis à jour.' : 'Réception complète enregistrée. Stock mis à jour.');
      closeModal();
    });
  };

  const tabs = [
    { key: '', label: `Tous (${orders.length})` },
    { key: 'en_attente', label: `En attente (${orders.filter(b => b.status === 'en_attente').length})` },
    { key: 'partielle',  label: `Partielle (${orders.filter(b => b.status === 'partielle').length})` },
    { key: 'recue',      label: `Reçus (${orders.filter(b => b.status === 'recue').length})` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Bons de commande</h1>
          <p className="text-sm text-text-secondary mt-1">
            {orders.length} bons · {orders.filter(b => b.status === 'en_attente').length} en attente
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-[#0a4a3a] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nouveau bon
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-[#E5E7EB] overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${statusFilter === tab.key ? 'border-[#0D5C4A] text-[#0D5C4A]' : 'border-transparent text-[#6B7280] hover:text-[#111827]'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" placeholder="N° bon ou fournisseur..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
          </div>
        </div>

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
                      <div className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#9CA3AF]" />{bc.supplier_name}</div>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">{formatDate(bc.date)}</td>
                    <td className="px-5 py-4 text-[#6B7280]">{bc.expected_date ? formatDate(bc.expected_date) : '—'}</td>
                    <td className="px-5 py-4 font-bold text-[#111827]">{formatCFA(bc.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openDetail(bc)} className="p-1.5 text-[#9CA3AF] hover:text-[#0D5C4A] hover:bg-[#F0FDF9] rounded-lg transition-colors hover:scale-110 active:scale-95" title="Voir le détail">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canReceive && (
                          <button onClick={() => openReceive(bc)}
                            className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors active:scale-95">
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
                    {isPending ? 'Chargement...' : 'Aucun bon de commande trouvé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">{filtered.length} bon(s) affiché(s)</div>
      </div>

      {modalMode === 'create' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Nouveau bon de commande</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">Créer un bon d&apos;achat fournisseur</p>
              </div>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">Fournisseur <span className="text-red-500">*</span></label>
                <select value={form.supplierId}
                  onChange={e => {
                    const s = suppliers.find(s => s.id === e.target.value);
                    setForm(f => ({ ...f, supplierId: e.target.value, supplierName: s?.name ?? '' }));
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]">
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">Notes</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
              </div>

              <div className="space-y-3 pt-2 border-t border-[#E5E7EB]">
                <h3 className="text-sm font-semibold text-[#111827]">Articles commandés</h3>

                {lines.map(line => {
                  const product = products.find(p => p.id === line.productId);
                  return (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <select value={line.productId} onChange={e => updateLine(line.id, 'productId', e.target.value)}
                          className="w-full px-2.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]">
                          <option value="">Sélectionner un produit</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" min="1" value={line.quantity || ''}
                          onChange={e => updateLine(line.id, 'quantity', Number(e.target.value))}
                          placeholder="Qté"
                          className="w-full px-2.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" min="0" value={line.unitPrice / 100 || ''}
                          onChange={e => updateLine(line.id, 'unitPrice', Number(e.target.value) * 100)}
                          placeholder="P.U. (FCFA)"
                          className="w-full px-2.5 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                      </div>
                      <div className="col-span-2 flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[#111827] truncate">{formatCFA(line.quantity * line.unitPrice)}</span>
                        <button onClick={() => removeLine(line.id)} className="p-1.5 text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-95">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {product && line.quantity < 1 && <p className="col-span-12 text-xs text-red-500">Quantité invalide</p>}
                    </div>
                  );
                })}

                <button onClick={addLine}
                  className="flex items-center gap-2 text-sm font-medium text-[#0D5C4A] hover:bg-[#F0FDF9] transition-colors p-2 rounded-lg active:scale-95">
                  <Plus className="w-4 h-4" /> Ajouter un produit
                </button>

                <div className="flex justify-between items-center pt-3 border-t border-[#E5E7EB]">
                  <span className="text-sm font-semibold text-[#374151]">Montant total</span>
                  <span className="text-lg font-bold text-[#111827]">{formatCFA(orderTotal)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all active:scale-95">Annuler</button>
                <button onClick={handleCreate} disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0D5C4A] rounded-lg hover:bg-[#0a4a3a] hover:shadow-md transition-all active:scale-95 disabled:opacity-60">
                  {isPending ? 'Création...' : 'Créer le bon'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'detail' && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">{selectedOrder.number}</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">Détail du bon de commande</p>
              </div>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
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
                      {[
                        { label: 'Fournisseur', value: selectedOrder.supplier_name },
                        { label: 'Date commande', value: formatDate(selectedOrder.date) },
                        { label: 'Livraison prévue', value: selectedOrder.expected_date ? formatDate(selectedOrder.expected_date) : '—' },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between text-sm">
                          <span className="text-[#6B7280]">{row.label}</span>
                          <span className="font-medium text-[#111827]">{row.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm border-t border-[#E5E7EB] pt-3">
                        <span className="text-[#6B7280] font-medium">Montant total</span>
                        <span className="font-bold text-[#111827] text-base">{formatCFA(selectedOrder.amount)}</span>
                      </div>
                    </div>

                    {selectedOrder.purchase_order_items && selectedOrder.purchase_order_items.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-[#111827]">Articles</h3>
                        <div className="divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-xl overflow-hidden">
                          {selectedOrder.purchase_order_items.map(item => (
                            <div key={item.id} className="flex justify-between items-center px-4 py-2.5 text-sm">
                              <div>
                                <p className="font-medium text-[#111827]">{item.product_name}</p>
                                <p className="text-xs text-[#9CA3AF]">{item.quantity} × {formatCFA(item.unit_price)}</p>
                              </div>
                              <span className="font-semibold text-[#111827]">{formatCFA(item.quantity * item.unit_price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(selectedOrder.status === 'en_attente' || selectedOrder.status === 'partielle') && (
                      <button onClick={() => { closeModal(); openReceive(selectedOrder); }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all active:scale-95">
                        <PackageCheck className="w-4 h-4" /> Réceptionner ce bon
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {modalMode === 'receive' && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-bold text-[#111827]">Réceptionner la commande</h2>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-[#6B7280]">
                Bon <span className="font-semibold text-[#111827]">{selectedOrder.number}</span> — {selectedOrder.supplier_name}
              </p>
              <p className="text-sm text-[#6B7280]">La livraison est-elle complète ou partielle ?</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleReceive(true)} disabled={isPending}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-60">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Partielle</span>
                  <span className="text-xs text-[#6B7280] text-center">Une partie reçue</span>
                </button>
                <button onClick={() => handleReceive(false)} disabled={isPending}
                  className="flex flex-col items-center gap-2 p-4 border-2 border-emerald-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all active:scale-95 disabled:opacity-60">
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
