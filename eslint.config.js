import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const namingConvention = [
  { selector: "default", format: ["camelCase"] },
  { selector: "import", format: null },
  { selector: "variable", format: ["camelCase", "UPPER_CASE"] },
  { selector: "typeLike", format: ["PascalCase"] },
  { selector: "enumMember", format: ["UPPER_CASE"] },
  {
    selector: ["objectLiteralProperty", "typeProperty"],
    modifiers: ["requiresQuotes"],
    format: null,
  },
];

const snakeCaseAllowed = namingConvention.map((entry) =>
  entry.format === null
    ? entry
    : { ...entry, format: [...entry.format, "snake_case"] },
);

export default defineConfig(
  globalIgnores(["dist"]),
  {
    files: ["**/*.js"],
    extends: [js.configs.recommended],
  },
  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "no-restricted-exports": [
        "error",
        {
          restrictDefaultExports: {
            direct: true,
            named: true,
            defaultFrom: true,
            namedFrom: true,
            namespaceFrom: true,
          },
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-magic-numbers": "error",
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
    },
  },
  {
    files: ["src/tools/**/*.ts"],
    rules: {
      "@typescript-eslint/naming-convention": ["error", ...snakeCaseAllowed],
    },
  },
  eslintConfigPrettier,
);
