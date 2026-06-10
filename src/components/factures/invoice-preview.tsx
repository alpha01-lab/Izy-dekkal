"use client";

import { useState, useEffect } from "react";
import { formatCFA, formatDate } from "@/lib/utils";
import { getSettings } from "@/actions/settings";
import { Building2, Phone, Mail, MapPin } from "lucide-react";

type InvoicePreviewProps = {
  invoice: {
    id: string;
    number: string;
    clientName: string;
    clientId: string;
    date: string;
    dueDate: string;
    amount: number;
    status: string;
    items: number;
  };
  client?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  };
};

const statusConfig = {
  brouillon: { label: "BROUILLON",  className: "bg-gray-100 text-gray-600 border border-gray-300" },
  envoyee:   { label: "ENVOYÉE",    className: "bg-blue-50 text-blue-700 border border-blue-300" },
  payee:     { label: "PAYÉE",      className: "bg-emerald-50 text-emerald-700 border border-emerald-300" },
  impayee:   { label: "IMPAYÉE",    className: "bg-red-50 text-red-700 border border-red-300" },
};

function generateMockLines(count: number, totalAmount: number) {
  const unitPrice = Math.round(totalAmount / 1.18 / count);
  return Array.from({ length: count }, (_, i) => ({
    id: `line_${i}`,
    description: `Article ${String.fromCharCode(65 + i)}`,
    quantity: 1 + i % 2,
    unitPrice,
    discount: 0,
    total: unitPrice * (1 + i % 2),
  }));
}

type ShopSettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

export function InvoicePreview({ invoice, client }: InvoicePreviewProps) {
  const [shop, setShop] = useState<ShopSettings | null>(null);

  useEffect(() => {
    getSettings().then((s) => {
      if (s) {
        setShop({
          name: s.name ?? '',
          address: s.address ?? '',
          phone: s.phone ?? '',
          email: s.email ?? '',
        });
      }
    });
  }, []);

  const cfg = statusConfig[invoice.status as keyof typeof statusConfig] ?? statusConfig.brouillon;
  const subTotal = Math.round(invoice.amount / 1.18);
  const tax = invoice.amount - subTotal;
  const mockLines = generateMockLines(invoice.items, invoice.amount);

  return (
    <div
      id="invoice-preview"
      data-invoice-preview
      className="bg-surface rounded-xl shadow-sm border border-border p-8 print:shadow-none print:border-none print:rounded-none"
    >
      {/* En-tête facture */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 mb-10">
        {/* Info boutique */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">
              {shop?.name || '—'}
            </h2>
          </div>
          {shop?.address && (
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {shop.address}
            </div>
          )}
          {shop?.phone && (
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {shop.phone}
            </div>
          )}
          {shop?.email && (
            <div className="flex items-center gap-1.5 text-sm text-text-secondary">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              {shop.email}
            </div>
          )}
        </div>

        {/* Numéro & statut */}
        <div className="text-left sm:text-right space-y-2">
          <div className="flex sm:justify-end">
            <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest ${cfg.className}`}>
              {cfg.label}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {invoice.number}
          </h1>
          <div className="text-sm text-text-secondary space-y-0.5">
            <p>
              Date d&apos;émission :{' '}
              <span className="font-medium text-text-primary">{formatDate(invoice.date)}</span>
            </p>
            <p>
              Date d&apos;échéance :{' '}
              <span className="font-medium text-text-primary">
                {invoice.dueDate ? formatDate(invoice.dueDate) : '—'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Séparateur */}
      <div className="border-t border-border mb-8" />

      {/* Info client */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-2">
          Facturé à
        </p>
        <div className="bg-background-subtle rounded-xl p-4 border border-border">
          <p className="font-bold text-text-primary text-lg">
            {client?.name ?? invoice.clientName}
          </p>
          {client?.address && (
            <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              {client.address}
            </p>
          )}
          {client?.phone && (
            <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              {client.phone}
            </p>
          )}
          {client?.email && (
            <p className="text-sm text-text-secondary flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              {client.email}
            </p>
          )}
        </div>
      </div>

      {/* Tableau des lignes */}
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-background-subtle text-text-secondary text-xs uppercase font-medium">
              <th className="px-4 py-3 text-left rounded-l-lg">Description</th>
              <th className="px-4 py-3 text-center">Qté</th>
              <th className="px-4 py-3 text-right">P.U. HT</th>
              <th className="px-4 py-3 text-right">Remise</th>
              <th className="px-4 py-3 text-right rounded-r-lg">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockLines.map((line) => (
              <tr key={line.id} className="hover:bg-background-subtle/50 transition-colors">
                <td className="px-4 py-3.5 font-medium text-text-primary">{line.description}</td>
                <td className="px-4 py-3.5 text-center text-text-secondary">{line.quantity}</td>
                <td className="px-4 py-3.5 text-right text-text-secondary">
                  {formatCFA(line.unitPrice)}
                </td>
                <td className="px-4 py-3.5 text-right text-text-secondary">
                  {line.discount > 0 ? formatCFA(line.discount) : "—"}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-text-primary">
                  {formatCFA(line.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Sous-total HT</span>
            <span className="font-medium text-text-primary">{formatCFA(subTotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">TVA (18%)</span>
            <span className="font-medium text-text-primary">{formatCFA(tax)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t-2 border-primary/20">
            <span className="font-bold text-text-primary text-lg">Total TTC</span>
            <span className="font-bold text-primary text-lg">{formatCFA(invoice.amount)}</span>
          </div>
        </div>
      </div>

      {/* Note de bas de page */}
      {shop && (
        <div className="mt-10 pt-6 border-t border-border text-center text-xs text-text-muted">
          <p>
            Merci pour votre confiance — {shop.name}
            {shop.email ? ` · ${shop.email}` : ''}
            {shop.phone ? ` · ${shop.phone}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}
