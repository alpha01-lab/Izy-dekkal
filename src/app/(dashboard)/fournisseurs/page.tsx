'use client';

import { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import { getSuppliers, createSupplierAction, updateSupplierAction, deleteSupplierAction } from '@/actions/suppliers';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, MapPin, X } from 'lucide-react';

type Supplier = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type ModalMode = null | 'add' | 'edit' | 'delete';

const emptyForm = { name: '', phone: '', email: '', address: '', notes: '' };

export default function FournisseursPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getSuppliers();
      setSuppliers(data ?? []);
    });
  }, []);

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  );

  const openAdd = () => { setForm(emptyForm); setFormError(''); setModalMode('add'); };
  const openEdit = (s: Supplier) => { setSelected(s); setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address, notes: s.notes }); setFormError(''); setModalMode('edit'); };
  const openDelete = (s: Supplier) => { setSelected(s); setModalMode('delete'); };
  const closeModal = () => { setModalMode(null); setSelected(null); setFormError(''); };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Le nom et le téléphone sont obligatoires.');
      return;
    }
    setFormError('');
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));

    startTransition(async () => {
      let result;
      if (modalMode === 'add') result = await createSupplierAction(formData);
      else if (modalMode === 'edit' && selected) result = await updateSupplierAction(selected.id, formData);
      if (result?.error) { setFormError(result.error); toast.error(result.error); return; }
      const fresh = await getSuppliers();
      setSuppliers(fresh ?? []);
      toast.success(modalMode === 'add' ? 'Fournisseur ajouté avec succès.' : 'Fournisseur modifié avec succès.');
      closeModal();
    });
  };

  const handleDelete = () => {
    if (!selected) return;
    startTransition(async () => {
      await deleteSupplierAction(selected.id);
      setSuppliers(prev => prev.filter(s => s.id !== selected.id));
      toast.success('Fournisseur supprimé.');
      closeModal();
    });
  };

  const f = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Fournisseurs</h1>
          <p className="text-sm text-text-secondary mt-1">{suppliers.length} fournisseurs enregistrés</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-[#0a4a3a] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nouveau fournisseur
        </button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input type="text" placeholder="Nom ou téléphone..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F9FAFB] text-[#6B7280] text-xs uppercase font-medium">
              <tr>
                <th className="px-5 py-3.5">Fournisseur</th>
                <th className="px-5 py-3.5">Téléphone</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Adresse</th>
                <th className="px-5 py-3.5">Notes</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.length > 0 ? filtered.map(supplier => (
                <tr key={supplier.id} className="group hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Truck className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="font-semibold text-[#111827]">{supplier.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-[#6B7280]"><Phone className="w-3.5 h-3.5" />{supplier.phone}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-[#6B7280]"><Mail className="w-3.5 h-3.5" />{supplier.email || '—'}</div></td>
                  <td className="px-5 py-4"><div className="flex items-center gap-1.5 text-[#6B7280]"><MapPin className="w-3.5 h-3.5" />{supplier.address}</div></td>
                  <td className="px-5 py-4 text-[#9CA3AF] text-xs max-w-[180px] truncate">{supplier.notes || '—'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(supplier)} className="p-1.5 text-[#9CA3AF] hover:text-[#0D5C4A] hover:bg-[#F0FDF9] rounded-lg transition-colors hover:scale-110 active:scale-95" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDelete(supplier)} className="p-1.5 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:scale-110 active:scale-95" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-[#9CA3AF] text-sm">
                    {isPending ? 'Chargement...' : 'Aucun fournisseur trouvé'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#F3F4F6] text-xs text-[#9CA3AF]">{filtered.length} fournisseur(s) affiché(s)</div>
      </div>

      {(modalMode === 'add' || modalMode === 'edit') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl border border-[#E5E7EB] w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">{modalMode === 'add' ? 'Nouveau fournisseur' : 'Modifier le fournisseur'}</h2>
                <p className="text-sm text-[#6B7280] mt-0.5">{modalMode === 'edit' ? selected?.name : 'Remplissez les informations'}</p>
              </div>
              <button onClick={closeModal} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
              {([
                { key: 'name' as const, label: 'Nom / Raison sociale', required: true, placeholder: 'Ex: SONAC Alimentaire' },
                { key: 'phone' as const, label: 'Téléphone', required: true, placeholder: '+221 33 123 45 67' },
                { key: 'email' as const, label: 'Email', placeholder: 'contact@fournisseur.sn' },
                { key: 'address' as const, label: 'Adresse', placeholder: 'Dakar, Zone Industrielle' },
              ]).map(field => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-sm font-medium text-[#374151]">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                  <input type="text" value={form[field.key]} onChange={f(field.key)} placeholder={field.placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]" />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#374151]">Notes</label>
                <textarea rows={2} value={form.notes} onChange={f('notes')} placeholder="Conditions de paiement, délais, etc."
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] resize-none" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[#E5E7EB]">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all active:scale-95">Annuler</button>
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
                  <h3 className="font-bold text-[#111827]">Supprimer le fournisseur</h3>
                  <p className="text-sm text-[#6B7280]">Cette action est irréversible.</p>
                </div>
              </div>
              <p className="text-sm text-[#6B7280] bg-[#F9FAFB] rounded-lg px-3 py-3 border border-[#E5E7EB]">
                Supprimer <span className="font-semibold text-[#111827]">{selected.name}</span> ?
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-all active:scale-95">Annuler</button>
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
