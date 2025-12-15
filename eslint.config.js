// @ts-check
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsAll,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      // TypeScript strictness
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/strict-boolean-expressions": "off",

      // Imports
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@angular/common"],
              importNames: ["CommonModule"],
              message:
                "Use the component or directive directly e.g. `import {NgFor} from '@angular/common`'.",
            },
          ],
        },
      ],

      // Angular component rules
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@angular-eslint/prefer-standalone": "error",
      "@angular-eslint/prefer-on-push-component-change-detection": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-host-metadata-property": "off",
      "@angular-eslint/prefer-output-readonly": "error",
      "@angular-eslint/relative-url-prefix": "error",
      "@angular-eslint/use-component-view-encapsulation": "error",
      "@angular-eslint/no-async-lifecycle-method": "error",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateAll,
    ],
    rules: {
      // Template accessibility
      "@angular-eslint/template/alt-text": "error",
      "@angular-eslint/template/elements-content": "error",
      "@angular-eslint/template/label-has-associated-control": "error",
      "@angular-eslint/template/valid-aria": "error",
      "@angular-eslint/template/click-events-have-key-events": "error",
      "@angular-eslint/template/mouse-events-have-key-events": "error",
      "@angular-eslint/template/no-autofocus": "warn",
      "@angular-eslint/template/no-positive-tabindex": "error",
      "@angular-eslint/template/role-has-required-aria": "error",
      "@angular-eslint/template/table-scope": "error",

      // Template best practices
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/use-track-by-function": "error",
      "@angular-eslint/template/no-call-expression": "warn",
      "@angular-eslint/template/conditional-complexity": ["error", { maxComplexity: 3 }],
      "@angular-eslint/template/cyclomatic-complexity": ["error", { maxComplexity: 10 }],
      "@angular-eslint/template/no-duplicate-attributes": "error",
      "@angular-eslint/template/no-interpolation-in-attributes": "error",
      "@angular-eslint/template/prefer-self-closing-tags": "error",
      "@angular-eslint/template/i18n": "off",
    },
  },
]);
