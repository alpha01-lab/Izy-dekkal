"use client";

import { useState } from "react";
import { User, Phone, Mail, MapPin, Edit2, Trash2, Plus, Search } from "lucide-react";

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type ClientTableProps = {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onAdd: () => void;
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-primary/10 text-primary",
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
];

export function ClientTable({ clients, onEdit, onDelete, onAdd }: ClientTableProps) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm">
      {/* Barre outils */}
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border">
        <div className="relative w-full sm:max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            id="clients-search"
            type="text"
            placeholder="Rechercher un client…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-transparent"
          />
        </div>
        <button
          id="add-client-btn"
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#0D5C4A] hover:bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Ajouter un client
        </button>
      </div>

      {/* Tableau desktop */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="w-full text-sm text-left">
          <thead className="bg-background-subtle text-text-secondary text-xs uppercase font-medium">
            <tr>
              <th className="px-5 py-3.5">Client</th>
              <th className="px-5 py-3.5">Téléphone</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Adresse</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length > 0 ? (
              filtered.map((client, idx) => (
                <tr key={client.id} className="group hover:bg-background-subtle/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                        {getInitials(client.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-text-primary truncate">{client.name}</p>
                        {client.notes && (
                          <p className="text-xs text-text-muted truncate max-w-[180px]">{client.notes}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
                      {client.phone}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-text-secondary">
                    {client.email ? (
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
                        <span className="truncate max-w-[180px]">{client.email}</span>
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-text-secondary">
                    {client.address ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-text-muted" />
                        <span className="truncate max-w-[160px]">{client.address}</span>
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(client)}
                        className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hover:scale-110 active:scale-95"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(client)}
                        className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors hover:scale-110 active:scale-95"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-text-muted">
                    <User className="w-10 h-10 opacity-30" />
                    <p className="text-sm font-medium">Aucun client trouvé</p>
                    <p className="text-xs">Ajoutez votre premier client pour commencer.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cartes mobile */}
      <div className="sm:hidden divide-y divide-border">
        {filtered.map((client, idx) => (
          <div key={client.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                  {getInitials(client.name)}
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{client.name}</p>
                  <p className="text-xs text-text-muted">{client.phone}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(client)} className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors active:scale-95">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(client)} className="p-2 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors active:scale-95">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {client.email && (
              <p className="text-sm text-text-secondary flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-text-muted" />{client.email}
              </p>
            )}
            {client.address && (
              <p className="text-sm text-text-secondary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />{client.address}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pied */}
      <div className="px-5 py-3 border-t border-border text-xs text-text-muted">
        {filtered.length} client(s) affiché(s) sur {clients.length}
      </div>
    </div>
  );
}
