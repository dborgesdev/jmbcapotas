import tseslint from "typescript-eslint";
export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "artifacts/**",
      "node_modules/**",
      "src/routeTree.gen.ts",
      ".wrangler/**",
      ".tanstack/**",
    ],
  },
  ...tseslint.configs.recommended,
);
