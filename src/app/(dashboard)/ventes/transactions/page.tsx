import { ArrowLeftRight, TrendingUp } from "lucide-react";
import { formatCFA, formatDate } from "@/lib/utils";
import { getInvoices } from "@/actions/invoices";

export default async function TransactionsPage() {
  const allInvoices = await getInvoices().catch(() => []) ?? [];

  const transactions = allInvoices
    .filter(inv => inv.status === "payee")
    .map(inv => ({
      id: inv.id,
      date: inv.date,
      label: `Paiement — ${inv.number}`,
      client: inv.client_name,
      amount: inv.amount,
    }));

  const total = transactions.reduce((a, t) => a + t.amount, 0);

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0];
  const monthTotal = transactions
    .filter(t => t.date >= monthStart && t.date < monthEnd)
    .reduce((a, t) => a + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Transactions</h1>
        <p className="text-text-secondary mt-1">Historique des encaissements et mouvements financiers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-emerald-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-secondary mb-1">Total encaissé</p>
          <p className="text-xl font-bold text-emerald-600">{formatCFA(total)}</p>
          <p className="text-xs text-text-muted mt-1">{transactions.length} transactions</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-secondary mb-1">Ce mois</p>
          <p className="text-xl font-bold text-text-primary">{formatCFA(monthTotal)}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-secondary mb-1">Moyenne / transaction</p>
          <p className="text-xl font-bold text-text-primary">
            {formatCFA(transactions.length ? Math.round(total / transactions.length) : 0)}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Historique</h2>
        </div>
        <div className="divide-y divide-border">
          {transactions.length > 0 ? transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-4 hover:bg-background-subtle/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{tx.label}</p>
                  <p className="text-xs text-text-secondary">{tx.client} · {formatDate(tx.date)}</p>
                </div>
              </div>
              <span className="font-bold text-emerald-600">+{formatCFA(tx.amount)}</span>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
              <ArrowLeftRight className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aucune transaction enregistrée</p>
            </div>
          )}
        </div>
        {transactions.length > 0 && (
          <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
            {transactions.length} transaction(s) affichée(s)
          </div>
        )}
      </div>
    </div>
  );
}
