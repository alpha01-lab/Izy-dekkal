'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { getProducts, createProductAction, updateProductAction, deleteProductAction } from '@/actions/products';
import { formatCFA } from '@/lib/utils';
import { Plus, Search, Edit, Trash2, Package, X } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  alert_threshold: number;
  purchase_price: number;
  sale_price: number;
  unit: string;
  active: boolean;
};

type ModalMode = null | 'add' | 'edit' | 'delete';

const CATEGORIES = ['Électronique', 'Alimentaire', 'Textile', 'Cosmétique', 'Divers'];

const statusConfig = {
  ok:      { label: 'En stock', className: 'bg-emerald-50 text-emerald-700' },
  alerte:  { label: 'Alerte',   className: 'bg-amber-50 text-amber-700' },
  rupture: { label: 'Rupture',  className: 'bg-red-50 text-red-700' },
};

function getStockStatus(qty: number, threshold: number) {
  if (qty === 0) return 'rupture';
  if (qty <= threshold) return 'alerte';
  return 'ok';
}

const emptyForm = {
  name: '', category: CATEGORIES[0], unit: 'pièce',
  quantity: '', alertThreshold: '', purchasePrice: '', salePrice: '',
};

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getProducts();
      setProducts(data ?? []);
    });
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter ? p.category === categoryFilter : true;
    const matchStatus = statusFilter ? getStockStatus(p.quantity, p.alert_threshold) === statusFilter : true;
    return matchSearch && matchCat && matchStatus;
  });

  const totalValue = products.reduce((acc, p) => acc + p.quantity * p.purchase_price, 0);
  const inStock   = products.filter(p => p.quantity > p.alert_threshold).length;
  const alerts    = products.filter(p => p.quantity > 0 && p.quantity <= p.alert_threshold).length;
  const ruptures  = products.filter(p => p.quantity === 0).length;

  const openAdd = () => { setForm(emptyForm); setFormError(''); setModalMode('add'); };
  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({
      name: p.name, category: p.category, unit: p.unit,
      quantity: String(p.quantity), alertThreshold: String(p.alert_threshold),
      purchasePrice: String(p.purchase_price / 100), salePrice: String(p.sale_price / 100),
    });
    setFormError('');
    setModalMode('edit');
  };
  const openDelete = (p: Product) => { setSelected(p); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.quantity || !form.purchasePrice || !form.salePrice) {
      setFormError('Nom, quantité et prix sont obligatoires.');
      return;
    }
    setFormError('');
    const formData = new FormData();
    formData.append('name', form.name.trim());
    formData.append('category', form.category);
    formData.append('unit', form.unit);
    formData.append('quantity', form.quantity);
    formData.append('alertThreshold', form.alertThreshold || '5');
    formData.append('purchasePrice', form.purchasePrice);
    formData.append('salePrice', form.salePrice);

    startTransition(async () => {
      let result;
      if (modalMode === 'add') result = await createProductAction(formData);
      else if (modalMode === 'edit' && selected) result = await updateProductAction(selected.id, formData);
      if (result?.error) { setFormError(result.error); toast.error(result.error); return; }
      const fresh = await getProducts();
      setProducts(fresh ?? []);
      toast.success(modalMode === 'add' ? 'Produit ajouté avec succès.' : 'Produit modifié avec succès.');
      closeModal();
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      await deleteProductAction(selected.id);
      setProducts(prev => prev.filter(p => p.id !== selected.id));
      toast.success('Produit supprimé.');
      closeModal();
    });
  };

  const f = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Gestion du Stock</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {products.length} produits · Valeur totale : <span className="font-semibold text-[#0D5C4A]">{formatCFA(totalValue)}</span>
          </p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-[#0a4a3a] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nouveau produit
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total produits', value: products.length, color: 'text-[#111827]' },
          { label: 'En stock',       value: inStock,         color: 'text-emerald-600' },
          { label: 'En alerte',      value: alerts,          color: 'text-amber-600' },
          { label: 'Rupture',        value: ruptures,        color: 'text-red-600' },
        ].map(card => (
          <div key={card.label} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm">
            <p className="text-xs text-[#6B7280] mb-1">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-[#E5E7EB]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#374151] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]">
            <option value="">Tous statuts</option>
            <option value="ok">En stock</option>
            <option value="alerte">En alerte</option>
            <option value="rupture">Rupture</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5">Produit</th>
                <th className="px-5 py-3.5">Catégorie</th>
                <th className="px-5 py-3.5 text-center">Qté</th>
                <th className="px-5 py-3.5 text-center">Seuil</th>
                <th className="px-5 py-3.5">Prix achat</th>
                <th className="px-5 py-3.5">Prix vente</th>
                <th className="px-5 py-3.5">Marge</th>
                <th className="px-5 py-3.5">Statut</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length > 0 ? filtered.map(product => {
                const margin = product.sale_price - product.purchase_price;
                const marginPct = product.purchase_price > 0 ? Math.round((margin / product.purchase_price) * 100) : 0;
                const status = getStockStatus(product.quantity, product.alert_threshold);
                const cfg = statusConfig[status];
                return (
                  <tr key={product.id} className="group hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] flex-shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827]">{product.name}</p>
                          <p className="text-xs text-[#9CA3AF]">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">{product.category}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-bold text-base ${status === 'rupture' ? 'text-red-600' : status === 'alerte' ? 'text-amber-600' : 'text-[#111827]'}`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-[#9CA3AF]">{product.alert_threshold}</td>
                    <td className="px-5 py-4 text-[#6B7280]">{formatCFA(product.purchase_price)}</td>
                    <td className="px-5 py-4 font-semibold text-[#111827]">{formatCFA(product.sale_price)}</td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-semibold ${marginPct >= 20 ? 'text-emerald-600' : 'text-[#6B7280]'}`}>
                        +{marginPct}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(product)} className="p-1.5 text-[#9CA3AF] hover:text-[#0D5C4A] hover:bg-[#F0FDF9] rounded-lg transition-colors" title="Modifier">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => openDelete(product)} className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
                      <Package className="w-8 h-8 opacity-30" />
                      <p className="text-sm">{isPending ? 'Chargement...' : 'Aucun produit trouvé'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">{filtered.length} produit(s) affiché(s)</div>
      </div>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">{modalMode === 'add' ? 'Nouveau produit' : 'Modifier le produit'}</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">{modalMode === 'edit' ? selected?.name : 'Ajouter un produit au stock'}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">Nom du produit <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={f('name')} placeholder="Ex: Samsung Galaxy A55"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Catégorie</label>
                  <select value={form.category} onChange={f('category')}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Unité</label>
                  <select value={form.unit} onChange={f('unit')}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]">
                    {['pièce', 'sac', 'carton', 'bidon', 'boite', 'flacon', 'tube', 'kg', 'litre'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Quantité <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={form.quantity} onChange={f('quantity')} placeholder="0"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Seuil d&apos;alerte</label>
                  <input type="number" min="0" value={form.alertThreshold} onChange={f('alertThreshold')} placeholder="5"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Prix achat (FCFA) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={form.purchasePrice} onChange={f('purchasePrice')} placeholder="0"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">Prix vente (FCFA) <span className="text-red-500">*</span></label>
                  <input type="number" min="0" value={form.salePrice} onChange={f('salePrice')} placeholder="0"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all active:scale-95">
                  Annuler
                </button>
                <button onClick={handleSubmit} disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0D5C4A] rounded-lg hover:bg-[#0a4a3a] hover:shadow-md transition-all active:scale-95 disabled:opacity-60">
                  {isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalMode === 'delete' && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[#111827]">Supprimer le produit</h3>
                  <p className="text-sm text-[#6B7280]">Cette action est irréversible.</p>
                </div>
              </div>
              <p className="text-sm text-[#6B7280] bg-[#F9FAFB] rounded-lg px-3 py-3 border border-[#E5E7EB]">
                Supprimer <span className="font-semibold text-[#111827]">{selected.name}</span> du stock ?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all active:scale-95">
                  Annuler
                </button>
                <button onClick={handleDelete} disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 hover:shadow-md transition-all active:scale-95 disabled:opacity-60">
                  {isPending ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
