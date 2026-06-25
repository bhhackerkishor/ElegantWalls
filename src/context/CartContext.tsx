'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { CartItem, Product, ProductVariant } from '@/types';
import { cartItemKey } from '@/lib/utils';

interface CartContextValue {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  sessionId: string;
  addToCart: (product: Product, variant: ProductVariant, customImage?: string) => void;
  removeFromCart: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  logEvent: (eventType: string, details?: Record<string, unknown>) => void;
  syncCartToServer: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Use lazy initializers to read from localStorage immediately
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      if (saved) {
        try { return JSON.parse(saved); } catch { return []; }
      }
    }
    return [];
  });

  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('session_id');
      if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('session_id', sid);
      }
      return sid;
    }
    return '';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  const saveCart = useCallback((items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  }, []);

  const logEvent = useCallback(
    async (eventType: string, details: Record<string, unknown> = {}) => {
      if (!sessionId) return;
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, sessionId, details }),
        });
      } catch { /* ignore */ }
    },
    [sessionId]
  );

  // Sync session pageviews
  useEffect(() => {
    if (sessionId) {
      logEvent('pageview', { path: window.location.pathname });
    }
  }, [sessionId, logEvent]);

  const syncCartToServer = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token || cartItems.length === 0) return;
    try {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart: cartItems }),
      });
    } catch { /* ignore */ }
  }, [cartItems]);

  // Debounced server sync
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && cartItems.length > 0) {
      const timer = setTimeout(syncCartToServer, 1000);
      return () => clearTimeout(timer);
    }
  }, [cartItems, syncCartToServer]);

  const addToCart = useCallback(
    (product: Product, variant: ProductVariant, customImage?: string) => {
      const newItem: CartItem = {
        productId: product._id,
        sku: variant.sku,
        title: product.title,
        category: product.category,
        price: variant.price,
        quantity: 1,
        size: variant.size,
        frame: variant.frame,
        material: variant.material,
        orientation: variant.orientation,
        image: product.image,
        customImage,
      };

      const key = cartItemKey(newItem);
      const itemsCopy = [...cartItems];
      const idx = itemsCopy.findIndex((i) => cartItemKey(i) === key);

      if (idx > -1) {
        itemsCopy[idx].quantity += 1;
      } else {
        itemsCopy.push(newItem);
      }

      saveCart(itemsCopy);
      setIsCartOpen(true);
      logEvent('add_to_cart', {
        productId: product._id,
        sku: variant.sku,
        title: product.title,
        price: variant.price,
      });
    },
    [cartItems, saveCart, logEvent]
  );

  const removeFromCart = useCallback(
    (item: CartItem) => {
      const key = cartItemKey(item);
      saveCart(cartItems.filter((i) => cartItemKey(i) !== key));
      logEvent('remove_from_cart', { productId: item.productId, sku: item.sku });
    },
    [cartItems, saveCart, logEvent]
  );

  const updateQuantity = useCallback(
    (item: CartItem, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(item);
        return;
      }
      const key = cartItemKey(item);
      saveCart(cartItems.map((i) => (cartItemKey(i) === key ? { ...i, quantity } : i)));
    },
    [cartItems, saveCart, removeFromCart]
  );

  const clearCart = useCallback(() => saveCart([]), [saveCart]);

  const cartTotal = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        sessionId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        logEvent,
        syncCartToServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}