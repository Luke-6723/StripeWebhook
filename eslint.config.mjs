import tseslint from "typescript-eslint";
import js from "@eslint/js";
import node from "eslint-plugin-node";

export default [
  {
    ignores: ["lib/generated/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
        ecmaVersion: "latest",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      node,
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2, { SwitchCase: 1 }],
      "@typescript-eslint/no-unused-vars": ["warn"],
      "no-console": "off",
      "node/no-unsupported-features/es-syntax": "off", // using ESModules
    },
  },
];
