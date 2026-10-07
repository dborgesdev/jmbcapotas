import { SITE } from "../config";
import type { CartItem } from "../whatsapp";
import type { Post } from "../wordpress/types";

export const CART_STORAGE_KEY = "jmb-cart-v1";

export function readStoredItems(serialized: string | null): CartItem[] {
  const stored: unknown = JSON.parse(serialized || "[]");
  return Array.isArray(stored)
    ? stored.filter(
        (p): p is CartItem =>
          p &&
          Number.isInteger(p.productId) &&
          typeof p.name === "string" &&
          typeof p.publicUrl === "string" &&
          p.publicUrl.startsWith(`${SITE}/`) &&
          Number.isInteger(p.quantity) &&
          p.quantity > 0 &&
          p.quantity <= 99,
      )
    : [];
}

export function addProduct(items: CartItem[], product: Post): CartItem[] {
  return items.some((i) => i.productId === product.id)
    ? items.map((i) =>
        i.productId === product.id
          ? { ...i, quantity: Math.min(99, i.quantity + 1) }
          : i,
      )
    : [
        ...items,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          codigo: product.acf?.codigo_produto,
          image: product.images[0]?.url,
          quantity: 1,
          publicUrl: `${SITE}${product.url}`,
        },
      ];
}

export function updateQuantity(
  items: CartItem[],
  id: number,
  quantity: number,
): CartItem[] {
  return items
    .map((i) =>
      i.productId === id
        ? {
            ...i,
            quantity: Math.max(0, Math.min(99, Math.trunc(quantity) || 0)),
          }
        : i,
    )
    .filter((i) => i.quantity > 0);
}
