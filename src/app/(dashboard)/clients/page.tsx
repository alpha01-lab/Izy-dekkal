"use client";

import { useState } from "react";
import { mockClients } from "@/data/mock";
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
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [modalMode, setModalMode] = useState<FormMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openAdd = () => {
    setSelectedClient(null);
    setModalMode("add");
  };

  const openEdit = (client: Client) => {
    setSelectedClient(client);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedClient(null);
  };

  const handleSubmit = (data: Omit<Client, "id">) => {
    setIsLoading(true);
    // Simulation délai réseau
    setTimeout(() => {
      if (modalMode === "add") {
        const newClient: Client = { ...data, id: `c_${Date.now()}` };
        setClients((prev) => [newClient, ...prev]);
      } else if (modalMode === "edit" && selectedClient) {
        setClients((prev) =>
          prev.map((c) => (c.id === selectedClient.id ? { ...c, ...data } : c))
        );
      }
      setIsLoading(false);
      closeModal();
    }, 600);
  };

  const handleDelete = (client: Client) => {
    if (confirm(`Supprimer le client "${client.name}" ? Cette action est irréversible.`)) {
      setClients((prev) => prev.filter((c) => c.id !== client.id));
    }
  };

  const totalClients = clients.length;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Clients</h1>
          <p className="text-text-secondary mt-1">
            {totalClients} client{totalClients > 1 ? "s" : ""} enregistré{totalClients > 1 ? "s" : ""}
          </p>
        </div>
        {/* Stat rapide */}
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

      {/* Tableau */}
      <ClientTable
        clients={clients}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      {/* Modal (Dialog) Ajouter / Modifier */}
      {modalMode !== null && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-surface rounded-xl shadow-xl border border-border w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {modalMode === "add" ? "Ajouter un client" : "Modifier le client"}
                </h2>
                <p className="text-sm text-text-secondary mt-0.5">
                  {modalMode === "add"
                    ? "Remplissez les informations du nouveau client."
                    : `Modification de ${selectedClient?.name}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-text-muted hover:text-text-primary hover:bg-background-subtle rounded-lg transition-colors hover:scale-110 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps modal */}
            <div className="p-6">
              <ClientForm
                initialData={selectedClient ?? undefined}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
