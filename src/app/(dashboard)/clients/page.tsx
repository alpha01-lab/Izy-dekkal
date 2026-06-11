"use client";

import { useState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import { getClients, createClientAction, updateClientAction, deleteClientAction } from "@/actions/clients";
import { ClientTable } from "@/components/clients/client-table";
import { ClientForm } from "@/components/clients/client-form";
import { Users, X } from "lucide-react";

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type FormMode = "add" | "edit" | null;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [modalMode, setModalMode] = useState<FormMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getClients();
      setClients(data ?? []);
    });
  }, []);

  const openAdd = () => { setSelectedClient(null); setModalMode("add"); };
  const openEdit = (client: Client) => { setSelectedClient(client); setModalMode("edit"); };
  const closeModal = () => { setModalMode(null); setSelectedClient(null); setError(null); };

  const handleSubmit = (data: Omit<Client, "id">) => {
    setError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));

    startTransition(async () => {
      let result;
      if (modalMode === "add") {
        result = await createClientAction(formData);
      } else if (modalMode === "edit" && selectedClient) {
        result = await updateClientAction(selectedClient.id, formData);
      }
      if (result?.error) { setError(result.error); toast.error(result.error); return; }
      const fresh = await getClients();
      setClients(fresh ?? []);
      toast.success(modalMode === "add" ? "Client ajouté avec succès." : "Client modifié avec succès.");
      closeModal();
    });
  };

  const handleDelete = (client: Client) => {
    if (!confirm(`Supprimer le client "${client.name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      const result = await deleteClientAction(client.id);
      if (result?.error) { setError(result.error); toast.error(result.error); return; }
      setClients(prev => prev.filter(c => c.id !== client.id));
      toast.success("Client supprimé.");
    });
  };

  const totalClients = clients.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Clients</h1>
          <p className="text-text-secondary mt-1">
            {totalClients} client{totalClients > 1 ? "s" : ""} enregistré{totalClients > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total clients</p>
            <p className="text-xl font-bold text-text-primary">{totalClients}</p>
          </div>
        </div>
      </div>

      {isPending && !modalMode && (
        <div className="text-sm text-text-secondary animate-pulse">Chargement...</div>
      )}

      <ClientTable clients={clients} onAdd={openAdd} onEdit={openEdit} onDelete={handleDelete} />

      {modalMode !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {modalMode === "add" ? "Ajouter un client" : "Modifier le client"}
                </h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  {modalMode === "add" ? "Remplissez les informations du nouveau client." : `Modification de ${selectedClient?.name}`}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 text-text-muted hover:text-text-primary hover:bg-background-subtle rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {error && <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <ClientForm
                initialData={selectedClient ?? undefined}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                isLoading={isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
