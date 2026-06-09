import { StatCard } from "@/components/dashboard/stat-card";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { StockAlerts } from "@/components/dashboard/stock-alerts";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { mockStats } from "@/data/mock";
import { formatCFA } from "@/lib/utils";
import { Package, TrendingUp, FileText, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-text-secondary mt-1">Bienvenue sur Dëkkal. Voici un aperçu de votre activité.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-surface border border-border text-sm rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>Ce mois-ci</option>
            <option>Mois dernier</option>
            <option>Cette année</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Valeur du Stock" 
          value={formatCFA(mockStats.totalStockValue)} 
          icon={Package} 
          trend={{ value: 2.5, isPositive: true }}
          highlight
        />
        <StatCard 
          title="Ventes du Mois" 
          value={formatCFA(mockStats.monthlySales)} 
          icon={TrendingUp} 
          trend={{ value: 12.4, isPositive: true }}
        />
        <StatCard 
          title="Montant Facturé" 
          value={formatCFA(mockStats.invoicedAmount)} 
          icon={FileText} 
        />
        <StatCard 
          title="En Attente" 
          value={formatCFA(mockStats.pendingAmount)} 
          icon={Clock} 
          trend={{ value: 5.2, isPositive: false }}
        />
      </div>

      {/* Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <StockAlerts />
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="mt-6">
        <RecentInvoices />
      </div>
    </div>
  );
}
