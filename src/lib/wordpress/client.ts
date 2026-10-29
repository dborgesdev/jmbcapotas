import { API } from "../config";
const cache = new Map<string, { expires: number; value: unknown }>();
const pending = new Map<string, Promise<unknown>>();
// Opt-in diagnostics for the measurement harness; no logging in production.
export type RestEvent = { path: string; source: "http" | "cache" | "pending" };
let observer: ((event: RestEvent) => void) | undefined;
export function observeRest(callback?: (event: RestEvent) => void) {
  observer = callback;
}
export class CmsError extends Error {
  constructor(
    public status: number,
    public code?: string,
  ) {
    super(
      "Não foi possível carregar o conteúdo. Tente novamente em instantes.",
    );
  }
}
export async function request<T>(
  path: string,
): Promise<{ data: T; total: number; pages: number }> {
  const existing = cache.get(path);
  if (existing && existing.expires > Date.now()) {
    observer?.({ path, source: "cache" });
    return existing.value as { data: T; total: number; pages: number };
  }
  if (pending.has(path)) {
    observer?.({ path, source: "pending" });
    return pending.get(path) as Promise<{
      data: T;
      total: number;
      pages: number;
    }>;
  }
  const promise = (async () => {
    observer?.({ path, source: "http" });
    const response = await fetch(`${API}/${path}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        code?: string;
      };
      throw new CmsError(response.status, error.code);
    }
    const value = {
      data: (await response.json()) as T,
      total: Number(response.headers.get("x-wp-total") || 0),
      pages: Number(response.headers.get("x-wp-totalpages") || 0),
    };
    if (cache.size > 500) cache.clear();
    cache.set(path, { expires: Date.now() + 60000, value });
    return value;
  })();
  pending.set(path, promise);
  try {
    return await promise;
  } finally {
    pending.delete(path);
  }
}
export async function all<T>(endpoint: string, query = ""): Promise<T[]> {
  const first = await request<T[]>(`${endpoint}?per_page=100${query}`);
  const items = [...first.data];
  for (let page = 2; page <= first.pages; page++)
    items.push(
      ...(await request<T[]>(`${endpoint}?per_page=100&page=${page}${query}`))
        .data,
    );
  return items;
}
