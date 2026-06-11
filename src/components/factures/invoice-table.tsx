"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getInvoices, updateInvoiceStatusAction } from "@/actions/invoices";
import { formatCFA, formatDate } from "@/lib/utils";
import { Plus, Search, FileText, Eye, Download, ChevronDown, Check } from "lucide-react";

type InvoiceStatus = "brouillon" | "envoyee" | "payee" | "impayee";

type Invoice = {
  id: string;
  number: string;
  client_name: string;
  date: string;
  due_date: string | null;
  amount: number;
  status: InvoiceStatus;
};

const statusConfig: Record<InvoiceStatus, { label: string; className: string; dotClass: string }> = {
  brouillon: { label: "Brouillon", className: "bg-gray-100 text-gray-600",     dotClass: "bg-gray-400" },
  envoyee:   { label: "Envoyée",   className: "bg-blue-50 text-blue-700",       dotClass: "bg-blue-500" },
  payee:     { label: "Payée",     className: "bg-emerald-50 text-emerald-700", dotClass: "bg-emerald-500" },
  impayee:   { label: "Impayée",   className: "bg-red-50 text-red-600",         dotClass: "bg-red-500" },
};

const allStatuses: InvoiceStatus[] = ["brouillon", "envoyee", "payee", "impayee"];

function StatusDropdown({ current, onChange, onClose }: { current: InvoiceStatus; onChange: (s: InvoiceStatus) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-44" onClick={e => e.stopPropagation()}>
      <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Changer le statut</p>
      {allStatuses.map(s => {
        const cfg = statusConfig[s];
        return (
          <button key={s} onClick={() => { onChange(s); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
              <span className={`font-medium ${current === s ? "text-gray-900" : "text-gray-600"}`}>{cfg.label}</span>
            </div>
            {current === s && <Check className="w-3.5 h-3.5 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

export function InvoiceTable() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getInvoices();
      setInvoices((data ?? []) as Invoice[]);
    });
  }, []);

  const handleStatusChange = (id: string, newStatus: InvoiceStatus) => {
    const previous = invoices.find(inv => inv.id === id)?.status;
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    startTransition(async () => {
      const result = await updateInvoiceStatusAction(id, newStatus);
      if (result?.error) {
        toast.error(result.error);
        if (previous) setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: previous } : inv));
        return;
      }
      toast.success(`Statut mis à jour : ${statusConfig[newStatus].label}`);
    });
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.number.toLowerCase().includes(search.toLowerCase()) || inv.client_name.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (statusFilter ? inv.status === statusFilter : true);
  });

  const totals = {
    all:       invoices.length,
    payee:     invoices.filter(i => i.status === "payee").length,
    envoyee:   invoices.filter(i => i.status === "envoyee").length,
    impayee:   invoices.filter(i => i.status === "impayee").length,
    brouillon: invoices.filter(i => i.status === "brouillon").length,
  };

  const tabs = [
    { key: "",          label: `Toutes (${totals.all})` },
    { key: "payee",     label: `Payées (${totals.payee})` },
    { key: "envoyee",   label: `Envoyées (${totals.envoyee})` },
    { key: "impayee",   label: `Impayées (${totals.impayee})` },
    { key: "brouillon", label: `Brouillons (${totals.brouillon})` },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${statusFilter === tab.key ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Numéro ou nom du client…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-transparent" />
        </div>
        <Link href="/factures/nouvelle"
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 whitespace-nowrap">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nouvelle facture
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-background-subtle text-text-secondary text-xs uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">N° Facture</th>
              <th className="px-5 py-3.5">Client</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Échéance</th>
              <th className="px-5 py-3.5">Montant TTC</th>
              <th className="px-5 py-3.5">Statut</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length > 0 ? filtered.map(inv => {
              const cfg = statusConfig[inv.status];
              const isOpen = openStatusId === inv.id;
              return (
                <tr key={inv.id} className="group hover:bg-background-subtle/50 transition-colors cursor-pointer" onClick={() => router.push(`/factures/${inv.id}`)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-text-muted flex-shrink-0" />
                      <span className="font-semibold text-text-primary">{inv.number}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-primary font-medium">{inv.client_name}</td>
                  <td className="px-5 py-4 text-text-secondary">{formatDate(inv.date)}</td>
                  <td className="px-5 py-4 text-text-secondary">{inv.due_date ? formatDate(inv.due_date) : '—'}</td>
                  <td className="px-5 py-4 font-bold text-text-primary">{formatCFA(inv.amount)}</td>
                  <td className="px-5 py-4">
                    <div className="relative inline-block">
                      <button onClick={e => { e.stopPropagation(); setOpenStatusId(isOpen ? null : inv.id); }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80 active:scale-95 ${cfg.className}`}
                        title="Cliquer pour changer le statut">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
                        {cfg.label}
                        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <StatusDropdown current={inv.status} onChange={s => handleStatusChange(inv.id, s)} onClose={() => setOpenStatusId(null)} />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/factures/${inv.id}`} onClick={e => e.stopPropagation()}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hover:scale-110 active:scale-95" title="Voir le détail">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={e => { e.stopPropagation(); router.push(`/factures/${inv.id}?pdf=1`); }}
                        className="p-1.5 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors hover:scale-110 active:scale-95" title="Télécharger PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-text-muted">
                    <FileText className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-medium">{isPending ? 'Chargement...' : 'Aucune facture trouvée'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
        {filtered.length} facture(s) affichée(s) sur {invoices.length}
      </div>
    </div>
  );
}
