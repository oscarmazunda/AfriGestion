
export enum AppView {
  DASHBOARD = 'dashboard',
  POS = 'pos',
  DAILY_SALES = 'daily_sales',
  STOCK = 'stock',
  CONTACTS = 'contacts',
  ACCOUNTING = 'accounting',
  SETTINGS = 'settings',
  AUTH = 'auth'
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff';
}

export interface Product {
  id: string;
  reference: string; // Nouveau champ pour le code-barres ou référence courte
  name: string;
  category: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'mobile_money' | 'card';
  customerId?: string;
  userId: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface Revenue {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  type: 'customer' | 'supplier';
  balance: number;
}

export interface BusinessConfig {
  name: string;
  address: string;
  phone: string;
  currency: string;
  logoUrl?: string;
  receiptHeader: string;
}

export interface AppState {
  view: AppView;
  user: User | null;
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  revenues: Revenue[];
  contacts: Contact[];
  config: BusinessConfig;
}
