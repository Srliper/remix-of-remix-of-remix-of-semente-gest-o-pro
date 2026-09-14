export type Role = "admin" | "collaborator";
export type StoreLocation = "retiro" | "sao_miguel" | "ambas";
export type Store = "retiro" | "sao_miguel";
export type ProductStatus = "disponivel" | "vendido" | "reservado";
export type SaleType = "balcao" | "delivery";
export type PaymentMethod = "dinheiro" | "pix" | "credito" | "debito";
export type SaleSource = "interno" | "app_cliente";
export type OrderStatus =
  | "pendente"
  | "confirmado"
  | "em_preparo"
  | "entregue"
  | "cancelado";
export type SaleStatus = "concluida" | "cancelada" | OrderStatus;

export interface Profile {
  id: string;
  name: string;
  email: string;
  store_location: StoreLocation;
  position: string;
  is_active: boolean;
  created_at: string;
  role?: Role;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  is_active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  store_location: Store;
  /** Only available to the admin. Null for collaborators. */
  cost_price: number | null;
  sell_price: number;
  stock_qty: number;
  status: ProductStatus;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_sell_price: number;
  unit_cost_price: number | null;
  subtotal: number;
}

export interface Sale {
  id: string;
  user_id: string | null;
  user_name: string;
  store_location: Store;
  sale_type: SaleType;
  customer_name: string | null;
  customer_address: string | null;
  customer_phone: string | null;
  subtotal: number;
  discount: number;
  total_amount: number;
  total_cost: number | null;
  total_profit: number | null;
  payment_method: PaymentMethod;
  status: SaleStatus;
  source: SaleSource;
  notes: string | null;
  created_at: string;
  items: SaleItem[];
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_preparo: "Em preparo",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const ORDER_FLOW: OrderStatus[] = [
  "pendente",
  "confirmado",
  "em_preparo",
  "entregue",
];

export interface CompanySettings {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
}

export const STORE_LABEL: Record<StoreLocation, string> = {
  retiro: "Retiro",
  sao_miguel: "S. M. Arcanjo",
  ambas: "Ambas as unidades",
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  credito: "Cartão Crédito",
  debito: "Cartão Débito",
};

export const STATUS_LABEL: Record<ProductStatus, string> = {
  disponivel: "Disponível",
  vendido: "Vendido",
  reservado: "Reservado",
};

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
