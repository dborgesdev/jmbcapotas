import { useState, useEffect, type ReactNode } from "react";
import { CartContext } from "../../lib/cart/context";
import {
  CART_STORAGE_KEY,
  readStoredItems,
  addProduct,
  updateQuantity,
} from "../../lib/cart/state";
import { type CartItem } from "../../lib/whatsapp";
import { type Post } from "../../lib/wordpress/types";
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      setItems(readStoredItems(localStorage.getItem(CART_STORAGE_KEY)));
    } catch {
      /* Storage unavailable: cart remains usable in memory. */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* Memory fallback. */
      }
    }
  }, [items, ready]);
  const add = (p: Post) => {
    setItems((old) => addProduct(old, p));
    setNotice(`${p.name} adicionado ao carrinho.`);
  };
  const update = (id: number, quantity: number) =>
    setItems((old) => updateQuantity(old, id, quantity));
  return (
    <CartContext.Provider value={{ items, add, update, notice, ready }}>
      {children}
      <div className="sr-only" role="status" aria-live="polite">
        {notice}
      </div>
    </CartContext.Provider>
  );
}
