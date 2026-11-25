import eslint from '@eslint/js';
import angular from 'angular-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['projects/**/*'] },
  {
    files: ['src/**/*.ts'],
    extends: [eslint.configs.recommended, ...angular.configs.tsRecommended, prettierRecommended],
    processor: angular.createProcessor(),
    languageOptions: { globals: { ...globals.browser, ...globals.jasmine } },
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/app/**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility, prettierRecommended],
  },
);
