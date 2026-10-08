import { createServerFn } from "@tanstack/react-start";
import { siteConfig } from "./site-config";
export const loadPublicConfig = createServerFn({ method: "GET" }).handler(() =>
  siteConfig(),
);
