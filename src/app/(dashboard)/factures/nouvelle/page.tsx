import { InvoiceForm } from "@/components/factures/invoice-form";

export const metadata = {
  title: "Nouvelle Facture | Dëkkal",
};

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          Créer une Facture
        </h1>
        <p className="text-text-secondary">
          Générez une nouvelle facture en sélectionnant un client et des produits de votre stock.
        </p>
      </div>

      <InvoiceForm />
    </div>
  );
}
