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
      "@typescript-eslint/no-deprecated": "off", // Disabled - provideAnimations deprecation warning
      "@typescript-eslint/no-unnecessary-condition": "off", // Disabled - unnecessary conditionals
      "@typescript-eslint/prefer-nullish-coalescing": "off", // Disabled - prefer ?? over ||
      "@typescript-eslint/no-non-null-assertion": "off", // Disabled - no non-null assertion

      // Imports
      "no-restricted-imports": "off", // Disabled - CommonModule restriction

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
      "@angular-eslint/component-max-inline-declarations": "off", // Disabled - inline template lines limit
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
      "@angular-eslint/template/label-has-associated-control": "off", // Disabled - label control requirement
      "@angular-eslint/template/valid-aria": "error",
      "@angular-eslint/template/click-events-have-key-events": "off", // Disabled - click events need key events
      "@angular-eslint/template/mouse-events-have-key-events": "error",
      "@angular-eslint/template/no-autofocus": "warn",
      "@angular-eslint/template/no-positive-tabindex": "error",
      "@angular-eslint/template/role-has-required-aria": "error",
      "@angular-eslint/template/table-scope": "error",
      "@angular-eslint/template/interactive-supports-focus": "off", // Disabled - interactive elements need focus

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
      "@angular-eslint/template/prefer-at-else": "off", // Disabled - prefer @else over second @if
      "@angular-eslint/template/no-inline-styles": "off", // Disabled - no inline styles
      "@angular-eslint/template/attributes-order": "off", // Disabled - attributes order
      "@angular-eslint/template/prefer-template-literal": "off", // Disabled - prefer template literals
      "@angular-eslint/template/prefer-contextual-for-variables": "off", // Disabled - prefer contextual for variables
      "@angular-eslint/template/cyclomatic-complexity": "off", // Disabled - complexity limit exceeded
      "@angular-eslint/template/prefer-ngsrc": "off", // Disabled - prefer ngSrc
      "@angular-eslint/template/button-has-type": "off", // Disabled - button type requirement
      "@angular-eslint/template/no-any": "off", // Disabled - avoid $any
      "@angular-eslint/template/prefer-static-string-properties": "off", // Disabled - prefer static strings
    },
  },
]);
