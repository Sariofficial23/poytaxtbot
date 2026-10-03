import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'dk_cart';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(load); // { [productId]: qty }

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const value = useMemo(() => {
    const setQty = (id, qty) =>
      setCart((c) => {
        const next = { ...c };
        if (qty <= 0) delete next[id];
        else next[id] = Math.min(99, qty);
        return next;
      });
    return {
      cart,
      qty: (id) => cart[id] || 0,
      add: (id) => setQty(id, (cart[id] || 0) + 1),
      remove: (id) => setQty(id, (cart[id] || 0) - 1),
      setQty,
      clear: () => setCart({}),
      count: Object.values(cart).reduce((s, q) => s + q, 0),
    };
  }, [cart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
