"use client";

import { mockInvoices } from "@/data/mock";
import { formatCFA } from "@/lib/utils";
import { InvoiceTable } from "@/components/factures/invoice-table";

const totalFacture = mockInvoices.reduce((a, i) => a + i.amount, 0);
const totalPayee   = mockInvoices.filter((i) => i.status === "payee").reduce((a, i) => a + i.amount, 0);
const totalImpayee = mockInvoices.filter((i) => i.status === "impayee").reduce((a, i) => a + i.amount, 0);

export default function FacturesPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Factures</h1>
        <p className="text-text-secondary">
          Gérez et suivez toutes vos factures clients.
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
          <p className="text-sm text-text-secondary mb-1">Total facturé</p>
          <p className="text-xl font-bold text-text-primary">{formatCFA(totalFacture)}</p>
          <p className="text-xs text-text-muted mt-1">{mockInvoices.length} factures</p>
        </div>
        <div className="bg-surface border border-emerald-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300">
          <p className="text-sm text-text-secondary mb-1">Encaissé</p>
          <p className="text-xl font-bold text-emerald-600">{formatCFA(totalPayee)}</p>
          <p className="text-xs text-text-muted mt-1">{mockInvoices.filter(i => i.status === "payee").length} factures payées</p>
        </div>
        <div className="bg-surface border border-red-200 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-red-300">
          <p className="text-sm text-text-secondary mb-1">Impayé</p>
          <p className="text-xl font-bold text-red-600">{formatCFA(totalImpayee)}</p>
          <p className="text-xs text-text-muted mt-1">{mockInvoices.filter(i => i.status === "impayee").length} factures impayées</p>
        </div>
      </div>

      {/* Tableau principal */}
      <InvoiceTable />
    </div>
  );
}
