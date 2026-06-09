import { BarChart3, FileText, Download, TrendingUp } from "lucide-react";
import { formatCFA } from "@/lib/utils";
import { mockSalesChartData, mockInvoices } from "@/data/mock";

const totalCA = mockInvoices.filter(i => i.status === "payee").reduce((a, i) => a + i.amount, 0);
const bestMonth = mockSalesChartData.reduce((a, b) => (b.total > a.total ? b : a), mockSalesChartData[0]);

const rapports = [
  { label: "Rapport mensuel — Juin 2026", date: "09/06/2026", size: "Prêt à générer" },
  { label: "Rapport mensuel — Mai 2026",  date: "01/06/2026", size: "Prêt à générer" },
  { label: "Rapport trimestriel T2 2026", date: "01/06/2026", size: "Prêt à générer" },
];

export default function RapportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Rapports</h1>
        <p className="text-text-secondary mt-1">Synthèses et exports de vos données commerciales.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-secondary mb-1">CA total encaissé</p>
          <p className="text-xl font-bold text-text-primary">{formatCFA(totalCA)}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-secondary mb-1">Meilleur mois</p>
          <p className="text-xl font-bold text-primary">{bestMonth.name}</p>
          <p className="text-xs text-text-muted mt-1">{formatCFA(bestMonth.total * 100)}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-secondary mb-1">Factures payées</p>
          <p className="text-xl font-bold text-emerald-600">{mockInvoices.filter(i => i.status === "payee").length}</p>
          <p className="text-xs text-text-muted mt-1">sur {mockInvoices.length} factures</p>
        </div>
      </div>

      {/* Évolution mensuelle */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-text-primary mb-4">Évolution mensuelle des ventes</h2>
        <div className="flex items-end gap-3 h-40">
          {mockSalesChartData.map(d => {
            const max = Math.max(...mockSalesChartData.map(x => x.total));
            const pct = Math.round((d.total / max) * 100);
            return (
              <div key={d.name} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-text-muted">{formatCFA(d.total * 100).replace(' FCFA', '')}</span>
                <div className="w-full bg-primary rounded-t-md transition-all duration-500" style={{ height: `${pct}%` }} />
                <span className="text-xs text-text-secondary font-medium">{d.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rapports téléchargeables */}
      <div className="bg-surface border border-border rounded-xl shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Rapports disponibles</h2>
        </div>
        <div className="divide-y divide-border">
          {rapports.map(r => (
            <div key={r.label} className="flex items-center justify-between px-5 py-4 hover:bg-background-subtle/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{r.label}</p>
                  <p className="text-xs text-text-secondary">{r.date} · {r.size}</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-all active:scale-95 opacity-0 group-hover:opacity-100">
                <Download className="w-3.5 h-3.5" /> Télécharger
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Rapports personnalisés</h3>
          <p className="text-sm text-text-secondary mt-0.5">Filtres avancés par période, catégorie et client disponibles prochainement.</p>
        </div>
        <span className="ml-auto px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full whitespace-nowrap">Bientôt</span>
      </div>
    </div>
  );
}
