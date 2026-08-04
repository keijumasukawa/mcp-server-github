import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const namingConvention = [
  { selector: "default", format: ["camelCase"], leadingUnderscore: "allow" },
  { selector: "import", format: null },
  { selector: "variable", format: ["camelCase", "UPPER_CASE"] },
  {
    selector: ["objectLiteralProperty", "typeProperty"],
    format: ["camelCase", "UPPER_CASE"],
  },
  { selector: "typeLike", format: ["PascalCase"] },
  { selector: "enumMember", format: ["UPPER_CASE"] },
  {
    selector: ["objectLiteralProperty", "typeProperty"],
    modifiers: ["requiresQuotes"],
    format: null,
  },
];

const pascalCaseVariableAllowed = namingConvention.map((entry) =>
  entry.selector === "variable"
    ? { ...entry, format: [...entry.format, "PascalCase"] }
    : entry,
);

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
    files: ["src/**/*.ts", "*.config.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.config.ts"],
        },
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
      "@typescript-eslint/no-magic-numbers": [
        "error",
        { ignoreArrayIndexes: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
    },
  },
  {
    files: ["src/github/client.ts"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        ...pascalCaseVariableAllowed,
      ],
    },
  },
  {
    files: ["src/tools/**/*.ts"],
    rules: {
      "@typescript-eslint/naming-convention": ["error", ...snakeCaseAllowed],
    },
  },
  {
    files: ["*.config.ts"],
    rules: {
      "no-restricted-exports": "off",
    },
  },
  {
    files: ["__tests__/**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      "@typescript-eslint/no-magic-numbers": [
        "error",
        { ignoreArrayIndexes: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/naming-convention": ["error", ...snakeCaseAllowed],
    },
  },
  eslintConfigPrettier,
);
