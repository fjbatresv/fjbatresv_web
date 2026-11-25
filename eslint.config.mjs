import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)), recommendedConfig: js.configs.recommended, allConfig: js.configs.all });

export default compat.config(
  {
    root: true,
    ignorePatterns: ['projects/**/*'],
    env: { browser: true, es2022: true, jasmine: true },
    overrides: [
      {
        files: ['*.ts'],
        parserOptions: { project: ['tsconfig.json'], createDefaultProgram: false },
        extends: [
          'plugin:@angular-eslint/recommended',
          'plugin:@angular-eslint/template/process-inline-templates',
          'eslint:recommended',
          'plugin:prettier/recommended',
        ],
        rules: {
          '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'app', style: 'camelCase' }],
          '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'app', style: 'kebab-case' }],
          'no-unused-vars': 'off',
        },
      },
      { files: ['*.html'], extends: ['plugin:@angular-eslint/template/recommended'] },
    ],
  },
);
