import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import noHardcodedEmoji from "./eslint-rules/no-hardcoded-emoji.js";
import noHardcodedColors from "./eslint-rules/no-hardcoded-colors.js";

export default tseslint.config(
  {
    ignores: [
      "dist",
      ".output",
      ".vinxi",
      "node_modules",
      ".git",
      "build",
      "android",
      "*.mp4",
      "*.html",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "no-hardcoded-emoji": { rules: { "no-hardcoded-emoji": noHardcodedEmoji } },
      "no-hardcoded-colors": { rules: { "no-hardcoded-colors": noHardcodedColors } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-hardcoded-emoji/no-hardcoded-emoji": "error",
      "no-hardcoded-colors/no-hardcoded-colors": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: [
      "src/components/ui/**/*.tsx",
      "src/components/ceremony/**/*.tsx",
      "src/components/PostcardScreen.tsx",
      "src/components/screens.tsx",
      "src/components/state-performance-badges-view.tsx",
      "src/components/SuccessToast.tsx",
      "src/components/UnlockCelebration.tsx",
      "src/hooks/**/*.ts",
      "src/lib/**/*.ts",
      "src/routes/**/*.tsx",
      "tests/**/*.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-refresh/only-export-components": "off",
      "no-hardcoded-emoji/no-hardcoded-emoji": "off",
    },
  },
  eslintPluginPrettier,
);
