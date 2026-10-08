import { createContext, useContext } from "react";
import type { SiteConfig } from "../wordpress/site-config";
import { whatsapp, type WhatsAppContext } from "../whatsapp";
export const PublicConfigContext = createContext<{
  config: SiteConfig;
  context?: WhatsAppContext;
}>({ config: {} });
export function useSiteConfig() {
  return useContext(PublicConfigContext).config;
}
export function useWhatsApp() {
  const { config, context } = useContext(PublicConfigContext);
  return (message?: string) => whatsapp(message, config.whatsapp, context);
}
