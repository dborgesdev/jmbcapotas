import { createServerFn } from "@tanstack/react-start";
import { resolveRoute } from "../site/resolve-route";
import type { Search } from "../site/types";
export const loadSite = createServerFn({ method: "GET" })
  .validator((input: { path: string; search: Search }) => input)
  .handler(({ data }) => resolveRoute(data));
