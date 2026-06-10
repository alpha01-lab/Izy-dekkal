"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { Plus, Trash2, Save, Send, AlertCircle } from 'lucide-react';
import { getClients } from '@/actions/clients';
import { getProducts } from '@/actions/products';
import { createInvoiceAction } from '@/actions/invoices';
import { formatCFA } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Client = { id: string; name: string };
type Product = { id: string; name: string; sale_price: number; quantity: number; unit: string };

type InvoiceLine = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
};

export function InvoiceForm() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const [c, p] = await Promise.all([getClients(), getProducts()]);
      setClients(c ?? []);
      setProducts(p ?? []);
    });
  }, []);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }]);
  };

  const removeLine = (id: string) => setLines(lines.filter(l => l.id !== id));

  const updateLine = (id: string, field: keyof InvoiceLine, value: string | number) => {
    setLines(lines.map(line => {
      if (line.id !== id) return line;
      const newLine = { ...line, [field]: value };
      if (field === 'productId') {
        const product = products.find(p => p.id === value);
        if (product) {
          newLine.unitPrice = product.sale_price;
          newLine.productName = product.name;
          newLine.quantity = 1;
        }
      }
      newLine.total = (newLine.quantity * newLine.unitPrice) - newLine.discount;
      return newLine;
    }));
  };

  const subTotal = lines.reduce((acc, l) => acc + l.total, 0);
  const tax = Math.round(subTotal * 0.18);
  const totalTTC = subTotal + tax;

  const handleSave = (status: 'brouillon' | 'envoyee') => {
    setError('');
    const client = clients.find(c => c.id === clientId);
    if (!clientId || !client) { setError("Veuillez sélectionner un client."); return; }
    if (lines.length === 0 || lines.some(l => !l.productId)) { setError("Veuillez ajouter au moins un produit valide."); return; }
    if (status === 'envoyee') {
      for (const line of lines) {
        const product = products.find(p => p.id === line.productId);
        if (product && line.quantity > product.quantity) {
          setError(`Stock insuffisant pour ${product.name} (disponible : ${product.quantity}).`);
          return;
        }
      }
    }

    startTransition(async () => {
      const result = await createInvoiceAction({
        clientId,
        clientName: client.name,
        date,
        dueDate,
        amount: totalTTC,
        status,
        notes: '',
        items: lines.map(l => ({
          productId: l.productId,
          productName: l.productName,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discount: l.discount,
        })),
      });
      if (result?.error) { setError(result.error); return; }
      router.push('/factures');
    });
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Client</label>
          <select value={clientId} onChange={e => setClientId(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="">Sélectionner un client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Date d&apos;émission</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Date d&apos;échéance</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-text-primary border-b border-border pb-2">Lignes de la facture</h3>
        <div className="hidden md:grid grid-cols-12 gap-4 text-sm font-medium text-text-secondary px-2">
          <div className="col-span-4">Produit</div>
          <div className="col-span-2">Quantité</div>
          <div className="col-span-2">Prix Unitaire</div>
          <div className="col-span-2">Remise</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {lines.map(line => {
          const product = products.find(p => p.id === line.productId);
          const maxQty = product ? product.quantity : 0;
          return (
            <div key={line.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-background-subtle p-4 rounded-lg md:bg-transparent md:p-0 md:rounded-none">
              <div className="md:col-span-4 space-y-1">
                <label className="md:hidden text-xs text-text-secondary">Produit</label>
                <select value={line.productId} onChange={e => updateLine(line.id, 'productId', e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none">
                  <option value="">Sélectionner un produit</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                </select>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="md:hidden text-xs text-text-secondary">Quantité</label>
                <input type="number" min="1" max={maxQty > 0 ? maxQty : undefined} value={line.quantity || ''}
                  onChange={e => updateLine(line.id, 'quantity', Number(e.target.value))}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
                {product && line.quantity > maxQty && <p className="text-xs text-red-500 font-medium">Max dispo: {maxQty}</p>}
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="md:hidden text-xs text-text-secondary">Prix Unitaire (FCFA)</label>
                <input type="number" value={line.unitPrice / 100 || ''}
                  onChange={e => updateLine(line.id, 'unitPrice', Number(e.target.value) * 100)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="md:hidden text-xs text-text-secondary">Remise (FCFA)</label>
                <input type="number" value={line.discount / 100 || ''}
                  onChange={e => updateLine(line.id, 'discount', Number(e.target.value) * 100)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2 mt-2 md:mt-0">
                <label className="md:hidden text-xs text-text-secondary">Total</label>
                <span className="font-semibold text-text-primary">{formatCFA(line.total)}</span>
                <button onClick={() => removeLine(line.id)}
                  className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-95" title="Supprimer la ligne">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        <button onClick={addLine}
          className="flex items-center gap-2 text-sm font-medium text-primary hover:text-[#0D5C4A] transition-colors p-2 rounded-lg hover:bg-primary/5 active:scale-95 mt-4">
          <Plus className="w-4 h-4" /> Ajouter une ligne
        </button>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t border-border">
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 order-2 md:order-1">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm w-full">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
          <button onClick={() => handleSave('brouillon')} disabled={isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-[#0D5C4A] hover:shadow-md transition-all duration-200 active:scale-95 disabled:opacity-60">
            <Save className="w-4 h-4" /> {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button onClick={() => handleSave('envoyee')} disabled={isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-all duration-200 active:scale-95 disabled:opacity-60">
            <Send className="w-4 h-4" /> Valider & Envoyer
          </button>
        </div>

        <div className="w-full md:w-80 space-y-3 bg-background-subtle p-4 rounded-xl order-1 md:order-2 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Sous-total</span>
            <span className="font-medium text-text-primary">{formatCFA(subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">TVA (18%)</span>
            <span className="font-medium text-text-primary">{formatCFA(tax)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border mt-2">
            <span className="font-bold text-text-primary text-lg">Total TTC</span>
            <span className="font-bold text-primary text-lg">{formatCFA(totalTTC)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
