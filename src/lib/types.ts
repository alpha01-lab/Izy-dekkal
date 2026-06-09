export type Product = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  alertThreshold: number;
  purchasePrice: number;
  salePrice: number;
  unit: string;
  active: boolean;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

export type InvoiceItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};
