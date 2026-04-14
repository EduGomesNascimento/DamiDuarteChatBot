'use client';

import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import type { Product, CartItem, CartState } from '@/types';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'cj_cart_v2';

type CartAction =
  | { type: 'ADD'; product: Product; qty: number }
  | { type: 'REMOVE'; id: number }
  | { type: 'UPDATE_QTY'; id: number; qty: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.items;
    case 'ADD': {
      const existing = state.find(i => i.product.id === action.product.id);
      if (existing) {
        return state.map(i =>
          i.product.id === action.product.id
            ? { ...i, qty: Math.min(i.qty + action.qty, action.product.stock) }
            : i
        );
      }
      return [...state, { product: action.product, qty: Math.min(action.qty, action.product.stock) }];
    }
    case 'REMOVE':
      return state.filter(i => i.product.id !== action.id);
    case 'UPDATE_QTY': {
      if (action.qty <= 0) return state.filter(i => i.product.id !== action.id);
      return state.map(i =>
        i.product.id === action.id
          ? { ...i, qty: Math.min(action.qty, i.product.stock) }
          : i
      );
    }
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

const CartContext = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', items: parsed });
        }
      }
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = useCallback((product: Product, qty = 1) => {
    dispatch({ type: 'ADD', product, qty });
    toast.success(`${product.shortName} adicionado ao carrinho!`, {
      icon: '🛒',
      style: { background: '#1a1a1a', color: '#f5f5f5', border: '1px solid #2a2a2a' },
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const updateQty = useCallback((id: number, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', id, qty });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  const savings = items.reduce((s, i) => {
    const orig = i.product.originalPrice ?? i.product.price;
    return s + (orig - i.product.price) * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, totalQty, subtotal, savings }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
