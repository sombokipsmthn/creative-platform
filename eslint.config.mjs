import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-location-assign-relative-destination": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-empty-object-type": "error",
      "@typescript-eslint/no-require-imports": "error",
      "react-hooks/set-state-in-effect": "error",
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".agents/**",
    "clerk-nextjs/**",
    ".claude/worktrees/**",
    "**/*.bak",
    "**/*.bak2",
    "**/*.bak3",
    "**/*.before",
  ]),
  // Allow CommonJS scripts to use require()
  {
    files: ["scripts/**/*.cjs", "*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;