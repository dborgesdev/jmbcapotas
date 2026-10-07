import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  return {
    define: {
      "import.meta.env.WORDPRESS_API_URL": JSON.stringify(
        env.WORDPRESS_API_URL ||
          "https://painel.jmbcapotas.com.br/wp-json/wp/v2",
      ),
      "import.meta.env.PUBLIC_SITE_URL": JSON.stringify(
        env.PUBLIC_SITE_URL || "https://jmbcapotas.com.br",
      ),
    },
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tailwind(),
      tanstackStart(),
      react(),
    ],
  };
});
