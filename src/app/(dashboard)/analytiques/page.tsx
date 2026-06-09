import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";

const cards = [
  { label: "Chiffre d'affaires", value: "4 500 000 FCFA", trend: "+12.4%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Nouveaux clients", value: "8", trend: "+2 ce mois", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Commandes", value: "23", trend: "+5 ce mois", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Marge moyenne", value: "38%", trend: "+3 pts", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
];

export default function AnalytiquesPage() {
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

      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[320px]">
        <div className="w-16 h-16 rounded-2xl bg-background-subtle flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-text-muted" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-text-primary">Graphiques détaillés</h3>
          <p className="text-sm text-text-secondary mt-1 max-w-xs">
            Les graphiques avancés (évolution CA, top produits, performance clients) seront disponibles prochainement.
          </p>
        </div>
        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">Bientôt disponible</span>
      </div>
    </div>
  );
}
