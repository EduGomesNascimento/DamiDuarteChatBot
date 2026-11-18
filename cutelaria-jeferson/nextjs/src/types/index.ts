// ============================================================
// CUTELARIA JEFERSON - TypeScript Types
// ============================================================

export interface Product {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  category: ProductCategory;
  categoryName: string;
  badge?: string;
  badgeType?: 'red' | 'gold' | 'dark';
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  installments: number;
  stock: number;
  sku: string;
  image: string;       // sem fundo (catalog)
  imageFundo: string;  // com fundo (banners)
  images: string[];
  description: string;
  features: string[];
  specs: Record<string, string>;
  tags: string[];
  featured: boolean;
}

export type ProductCategory = 'facas' | 'kits' | 'acessorios';

export interface Category {
  id: ProductCategory | 'todos' | 'promocoes';
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  count: number;
}

// ---- CART ----
export interface CartItem {
  product: Product;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clear: () => void;
  totalQty: number;
  subtotal: number;
  savings: number;
}

// ---- ORDER ----
export type OrderStatus = 'pending' | 'approved' | 'in_process' | 'rejected' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit_card';
export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  user_id?: string;
  status: OrderStatus;
  subtotal: number;
  freight: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  mp_payment_id?: string;
  mp_preference_id?: string;
  pix_qr_code?: string;
  pix_qr_code_base64?: string;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ---- ADDRESSES ----
export interface Address {
  id: string;
  user_id: string;
  name: string; // "Casa", "Trabalho", etc
  recipient_name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
}

export interface ShippingOption {
  carrier: string; // "Correios", "Jadlog", etc
  name: string;    // "PAC", "SEDEX", "Jadlog"
  price: number;
  days: number;
  error?: string;
}

// ---- AUTH ----
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  created_at: string;
}

// ---- API RESPONSES ----
export interface ApiResponse<T = void> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaymentCreateResponse {
  orderId: string;
  method: 'pix' | 'checkout_pro';
  // PIX
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  pixExpiresAt?: string;
  // Checkout Pro (card)
  checkoutUrl?: string;
}

// ---- CHECKOUT FORM ----
export interface CheckoutFormData {
  // Personal
  name: string;
  email: string;
  cpf: string;
  phone: string;
  // Address
  cep: string;
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  // Payment
  paymentMethod: PaymentMethod;
}
