"use client";

import { useState, type FormEvent, type ElementType, type InputHTMLAttributes } from "react";
import { User, Phone, Mail, MapPin, FileText, Loader2 } from "lucide-react";

type ClientFormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

type ClientFormProps = {
  initialData?: Partial<ClientFormData>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

type FieldProps = {
  id: keyof ClientFormData;
  label: string;
  icon: ElementType;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "value" | "onChange">;

function Field({ id, label, icon: Icon, required, value, error, onChange, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-secondary flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${
            error ? "border-red-400" : "border-border"
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function ClientForm({ initialData, onSubmit, onCancel, isLoading }: ClientFormProps) {
  const [form, setForm] = useState<ClientFormData>({
    name: initialData?.name ?? "",
    phone: initialData?.phone ?? "",
    email: initialData?.email ?? "",
    address: initialData?.address ?? "",
    notes: initialData?.notes ?? "",
  });
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});

  const validate = () => {
    const newErrors: Partial<ClientFormData> = {};
    if (!form.name.trim()) newErrors.name = "Le nom est obligatoire";
    if (!form.phone.trim()) {
      newErrors.phone = "Le téléphone est obligatoire";
    } else if (!/^\+?[0-9]{7,15}$/.test(form.phone.replace(/[\s\-().]/g, ""))) {
      newErrors.phone = "Format invalide (ex: +221 77 123 45 67)";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Adresse email invalide";
    }
    return newErrors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        id="name"
        label="Nom / Raison sociale"
        icon={User}
        required
        placeholder="ex: Mamadou Ndiaye"
        value={form.name}
        error={errors.name}
        onChange={(v) => setForm({ ...form, name: v })}
      />
      <Field
        id="phone"
        label="Téléphone"
        icon={Phone}
        required
        placeholder="+221 77 123 45 67"
        type="tel"
        value={form.phone}
        error={errors.phone}
        onChange={(v) => setForm({ ...form, phone: v })}
      />
      <Field
        id="email"
        label="Email"
        icon={Mail}
        placeholder="client@exemple.sn"
        type="email"
        value={form.email}
        error={errors.email}
        onChange={(v) => setForm({ ...form, email: v })}
      />
      <Field
        id="address"
        label="Adresse"
        icon={MapPin}
        placeholder="Dakar, Plateau"
        value={form.address}
        error={errors.address}
        onChange={(v) => setForm({ ...form, address: v })}
      />

      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-text-secondary flex items-center gap-1">
          <FileText className="w-4 h-4" /> Notes
        </label>
        <textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          placeholder="Informations complémentaires…"
          className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-background-subtle transition-all duration-200 active:scale-95"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-[#0D5C4A] hover:shadow-md transition-all duration-200 active:scale-95 flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Enregistrer
        </button>
      </div>
    </form>
  );
}
