import { mockRecentInvoices } from '@/data/mock';
import { formatCFA, formatDate, cn } from '@/lib/utils';
import { MoreHorizontal } from 'lucide-react';

const statusConfig = {
  brouillon: { label: 'Brouillon', className: 'bg-border-light text-text-secondary' },
  envoyee: { label: 'Envoyée', className: 'bg-info/10 text-info' },
  payee: { label: 'Payée', className: 'bg-success/10 text-success' },
  impayee: { label: 'Impayée', className: 'bg-danger/10 text-danger' },
};

export function RecentInvoices() {
  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between group cursor-pointer">
        <h2 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">Dernières Factures</h2>
        <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline transition-all active:scale-95 group-hover:translate-x-1">
          Tout voir <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background-subtle text-text-secondary text-xs uppercase font-medium">
            <tr>
              <th className="px-6 py-4">N° Facture</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Montant</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mockRecentInvoices.map((invoice) => {
              const status = statusConfig[invoice.status as keyof typeof statusConfig];
              return (
                <tr key={invoice.id} className="hover:bg-background-subtle/50 transition-colors group/row">
                  <td className="px-6 py-4 font-medium text-text-primary">{invoice.number}</td>
                  <td className="px-6 py-4 text-text-secondary">{invoice.clientName}</td>
                  <td className="px-6 py-4 text-text-secondary">{formatDate(invoice.date)}</td>
                  <td className="px-6 py-4 font-bold text-text-primary">{formatCFA(invoice.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", status.className)}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110 active:scale-95 shadow-sm hover:shadow opacity-0 group-hover/row:opacity-100 focus:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
