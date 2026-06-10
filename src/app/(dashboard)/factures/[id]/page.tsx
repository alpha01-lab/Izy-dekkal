"use client";

import { useState, use, useEffect, useTransition } from "react";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getInvoiceById, updateInvoiceStatusAction, deleteInvoiceAction } from "@/actions/invoices";
import { InvoicePreview } from "@/components/factures/invoice-preview";
import { ArrowLeft, Edit2, Trash2, Printer, ChevronRight, CheckCircle2, Send } from "lucide-react";

const STATUS_FLOW: Record<string, string> = {
  brouillon: "envoyee",
  envoyee: "payee",
  payee: "payee",
};

const statusLabels: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  impayee: "Impayée",
};

const statusColors: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600 border border-gray-300",
  envoyee:   "bg-blue-50 text-blue-700 border border-blue-300",
  payee:     "bg-emerald-50 text-emerald-700 border border-emerald-300",
  impayee:   "bg-red-50 text-red-700 border border-red-300",
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<ReturnType<typeof getInvoiceById> extends Promise<infer T> ? T : never | null>(null);
  const [status, setStatus] = useState('brouillon');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [notFoundError, setNotFoundError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getInvoiceById(id);
        setInvoice(data);
        setStatus(data.status);
      } catch {
        setNotFoundError(true);
      }
    });
  }, [id]);

  useEffect(() => {
    if (searchParams.get("pdf") === "1" && invoice) {
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams, invoice]);

  if (notFoundError) { notFound(); return null; }
  if (!invoice) return <div className="text-sm text-text-secondary animate-pulse p-6">Chargement...</div>;

  const nextStatus = STATUS_FLOW[status];
  const canProgress = status !== "payee" && status !== "impayee";

  const handleStatusChange = () => {
    if (!canProgress) return;
    const newStatus = nextStatus;
    setStatus(newStatus);
    startTransition(async () => {
      await updateInvoiceStatusAction(id, newStatus);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await deleteInvoiceAction(id);
      router.push("/factures");
    });
  };

  const clientForPreview = invoice.client_id ? { id: invoice.client_id, name: invoice.client_name } : undefined;
  const invoiceForPreview = {
    ...invoice,
    clientName: invoice.client_name,
    clientId: invoice.client_id ?? '',
    dueDate: invoice.due_date ?? '',
    status,
    items: Array.isArray(invoice.invoice_items) ? invoice.invoice_items.length : 0,
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/factures" className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hover:scale-110 active:scale-95">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
              <Link href="/factures" className="hover:text-primary transition-colors">Factures</Link>
              <ChevronRight className="w-3 h-3" />
              <span>{invoice.number}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">{invoice.number}</h1>
          </div>
        </div>
        <span className={`self-start sm:self-center px-3 py-1.5 rounded-full text-xs font-bold tracking-widest ${statusColors[status]}`}>
          {statusLabels[status]}
        </span>
      </div>

      <div className="no-print flex flex-wrap gap-3">
        {canProgress && (
          <button onClick={handleStatusChange} disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-[#0D5C4A] hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60">
            {nextStatus === "envoyee" ? <Send className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            Marquer comme {statusLabels[nextStatus]}
          </button>
        )}
        <Link href={`/factures/nouvelle?edit=${invoice.id}`}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-border text-text-secondary rounded-lg hover:bg-background-subtle hover:text-text-primary transition-all duration-200 hover:shadow-sm active:scale-95">
          <Edit2 className="w-4 h-4" /> Modifier
        </Link>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-border text-text-secondary rounded-lg hover:bg-background-subtle hover:text-text-primary transition-all duration-200 hover:shadow-sm active:scale-95">
          <Printer className="w-4 h-4" /> Imprimer / PDF
        </button>
        <button onClick={() => setShowDeleteDialog(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 hover:shadow-sm active:scale-95">
          <Trash2 className="w-4 h-4" /> Supprimer
        </button>
      </div>

      <InvoicePreview invoice={invoiceForPreview} client={clientForPreview} />

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteDialog(false)}>
          <div className="bg-surface rounded-xl shadow-xl border border-border p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">Supprimer la facture</h3>
                <p className="text-sm text-text-secondary">Cette action est irréversible.</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary bg-background-subtle rounded-lg p-3 border border-border">
              Vous êtes sur le point de supprimer la facture{" "}
              <span className="font-semibold text-text-primary">{invoice.number}</span>{" "}
              du client <span className="font-semibold text-text-primary">{invoice.client_name}</span>.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-background-subtle transition-all duration-200 active:scale-95">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 hover:shadow-md transition-all duration-200 active:scale-95 disabled:opacity-60">
                {isPending ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
