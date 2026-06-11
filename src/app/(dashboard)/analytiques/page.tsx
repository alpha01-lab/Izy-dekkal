import { BarChart3, TrendingUp, Users, FileText } from "lucide-react";
import { getInvoices } from "@/actions/invoices";
import { getClients } from "@/actions/clients";
import { getProducts } from "@/actions/products";
import { formatCFA } from "@/lib/utils";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { TopProductsChart } from "@/components/analytiques/top-products-chart";

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatTrend(current: number, previous: number) {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const pct = ((current - previous) / previous) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

export default async function AnalytiquesPage() {
  const [invoices, clients, products] = await Promise.all([
    getInvoices().catch(() => []),
    getClients().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const now = new Date();
  const currentMonthKey = monthKey(now);
  const prevMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const paidInvoices = invoices.filter(i => i.status === 'payee');
  const caCurrentMonth = paidInvoices.filter(i => i.date.startsWith(currentMonthKey)).reduce((s, i) => s + i.amount, 0);
  const caPrevMonth = paidInvoices.filter(i => i.date.startsWith(prevMonthKey)).reduce((s, i) => s + i.amount, 0);

  const newClientsThisMonth = clients.filter(c => c.created_at?.startsWith(currentMonthKey)).length;
  const invoicesThisMonth = invoices.filter(i => i.created_at?.startsWith(currentMonthKey)).length;

  const activeProducts = products.filter(p => p.sale_price > 0);
  const avgMargin = activeProducts.length > 0
    ? Math.round(activeProducts.reduce((s, p) => s + ((p.sale_price - p.purchase_price) / p.sale_price) * 100, 0) / activeProducts.length)
    : 0;

  const cards = [
    { label: "Chiffre d'affaires (mois)", value: formatCFA(caCurrentMonth), trend: formatTrend(caCurrentMonth, caPrevMonth), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Clients", value: String(clients.length), trend: `+${newClientsThisMonth} ce mois`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Factures", value: String(invoices.length), trend: `+${invoicesThisMonth} ce mois`, icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Marge moyenne", value: `${avgMargin}%`, trend: `${activeProducts.length} produits actifs`, icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
  ];

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString().split('T')[0];
    const total = paidInvoices
      .filter(inv => inv.date >= start && inv.date < end)
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { name: MONTHS_FR[d.getMonth()], total };
  });

  const productTotals = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.status === 'brouillon') continue;
    for (const item of inv.invoice_items ?? []) {
      const total = item.quantity * item.unit_price - item.discount;
      productTotals.set(item.product_name, (productTotals.get(item.product_name) ?? 0) + total);
    }
  }
  const topProducts = [...productTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, total]) => ({ name, total }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Analytiques</h1>
        <p className="text-text-secondary mt-1">Vue d&apos;ensemble de vos performances commerciales.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-surface border border-border rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-text-secondary">{card.label}</p>
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-xl font-bold text-text-primary">{card.value}</p>
            <p className="text-xs text-emerald-600 mt-1 font-medium">{card.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesChart data={chartData} />
        <TopProductsChart data={topProducts} />
      </div>
    </div>
  );
}
