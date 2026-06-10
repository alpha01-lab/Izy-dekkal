import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { getProducts } from "@/actions/products";
import { getInvoices } from "@/actions/invoices";
import { formatCFA } from "@/lib/utils";
import { Package, TrendingUp, FileText, Clock } from "lucide-react";

export default async function DashboardPage() {
  const [products, invoices] = await Promise.all([getProducts(), getInvoices()]);

  const allProducts = products ?? [];
  const allInvoices = invoices ?? [];

  const totalStockValue = allProducts.reduce(
    (sum, p) => sum + p.quantity * p.purchase_price,
    0
  );

  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toISOString()
    .split("T")[0];

  const thisMonthInvoices = allInvoices.filter(
    (inv) => inv.date >= monthStart && inv.date < monthEnd
  );
  const monthlySales = thisMonthInvoices
    .filter((inv) => inv.status === "payee")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const invoicedAmount = thisMonthInvoices.reduce(
    (sum, inv) => sum + inv.amount,
    0
  );
  const pendingAmount = allInvoices
    .filter((inv) => inv.status === "envoyee" || inv.status === "impayee")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const stockAlerts = allProducts.filter(
    (p) => p.quantity <= p.alert_threshold
  );

  const recentInvoices = [...allInvoices]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const salesChartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const start = `${y}-${m}-01`;
    const end = new Date(y, d.getMonth() + 1, 1).toISOString().split('T')[0];
    const total = allInvoices
      .filter((inv) => inv.status === 'payee' && inv.date >= start && inv.date < end)
      .reduce((sum, inv) => sum + inv.amount, 0);
    return { name: MONTHS_FR[d.getMonth()], total };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Bienvenue sur Dëkkal. Voici un aperçu de votre activité.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Valeur du Stock"
          value={formatCFA(totalStockValue)}
          icon={Package}
          highlight
        />
        <StatCard
          title="Ventes du Mois"
          value={formatCFA(monthlySales)}
          icon={TrendingUp}
        />
        <StatCard
          title="Montant Facturé"
          value={formatCFA(invoicedAmount)}
          icon={FileText}
        />
        <StatCard
          title="En Attente"
          value={formatCFA(pendingAmount)}
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesChartData} />
        </div>
        <div className="lg:col-span-1">
          <StockAlerts items={stockAlerts} />
        </div>
      </div>

      <div className="mt-6">
        <RecentInvoices invoices={recentInvoices} />
      </div>
    </div>
  );
}
