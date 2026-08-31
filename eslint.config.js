import stylistic from '@stylistic/eslint-plugin';
import google from 'eslint-config-google';
// apparently these two rules are borked in eslint 9+
for (const borkedRule of ['valid-jsdoc', 'require-jsdoc'])
  // eslint-disable-next-line security/detect-object-injection
  delete google.rules[borkedRule];
import eslint from '@eslint/js';
import {importX} from 'eslint-plugin-import-x';
import node from 'eslint-plugin-n';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier/recommended';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import unicorn from 'eslint-plugin-unicorn';
import {defineConfig, globalIgnores} from 'eslint/config';
// eslint-disable-next-line n/no-extraneous-import
import globals from 'globals';

export default defineConfig(
  eslint.configs.recommended,
  promise.configs['flat/recommended'],
  importX.flatConfigs.recommended,
  node.configs['flat/recommended'],
  security.configs.recommended,
  google,
  // eslint-disable-next-line import-x/no-named-as-default-member
  perfectionist.configs['recommended-natural'],
  stylistic.configs.customize({
    '@stylistic/brace-style': ['error', '1tbs', {allowSingleLine: true}],
    'curly-newline': ['error', {multiline: true}],
  }),
  unicorn.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
        nw: 'readonly',
      },
      parserOptions: {
        projectService: true,
      },
      sourceType: 'module',
    },
    plugins: {
      'import-x': importX,
      node,
      promise,
      security,
    },
    rules: {
      eqeqeq: ['error', 'smart'],
      'n/hashbang': 'off',
      'new-cap': ['off'],
      'no-debugger': ['warn'],
      'no-template-curly-in-string': ['warn'],
      'prefer-const': ['error'],
      'prefer-template': ['warn'],
      'unicorn/better-regex': 'warn',
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'vars-on-top': ['warn'],
    },
  },
  {
    files: ['test/**/*', '*.config.js'],
    rules: {
      'n/no-unpublished-import': 'off',
      'unicorn/catch-error-name': 'off',
    },
  },
  globalIgnores(['**/node_modules', '**/dist', '**/coverage']),
  prettier
);
