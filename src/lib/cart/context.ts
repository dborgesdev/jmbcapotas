import { type CartItem } from "../whatsapp";
import { type Post } from "../wordpress/types";
import { createContext, useContext } from "react";
export const CartContext = createContext<{
  items: CartItem[];
  add: (p: Post) => void;
  update: (id: number, quantity: number) => void;
  notice: string;
  ready: boolean;
}>({ items: [], add: () => {}, update: () => {}, notice: "", ready: false });

export const useCart = () => useContext(CartContext);
