import { AlertTriangle, Package } from 'lucide-react';

type StockAlertItem = {
  id: string;
  name: string;
  category: string | null;
  quantity: number;
  alert_threshold: number;
};

export function StockAlerts({ items }: { items: StockAlertItem[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col h-[300px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-lg font-bold text-text-primary">Alertes Stock</h2>
        </div>
        <span className="text-xs font-medium bg-danger/10 text-danger px-2 py-1 rounded-full">
          {items.length} articles
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background-subtle gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded bg-white border border-border flex items-center justify-center text-text-muted shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold text-text-primary leading-tight mb-0.5 truncate"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {item.category ?? '—'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-danger">{item.quantity}</p>
                <p className="text-xs text-text-secondary hidden sm:block">
                  en stock (min {item.alert_threshold})
                </p>
                <p className="text-xs text-text-secondary sm:hidden">en stock</p>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-muted">
            <Package className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune alerte de stock</p>
          </div>
        )}
      </div>
    </div>
  );
}
