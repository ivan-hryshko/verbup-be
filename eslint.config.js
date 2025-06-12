const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const importPlugin = require('eslint-plugin-import');

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: ['dist', 'node_modules', 'eslint.config.js', 'jest.config.js'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Airbnb style rules
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.spec.ts',
            '**/*.config.ts',
            '**/jest.setup.ts',
          ],
        },
      ],
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
        },
      ],
      // verbup
      // TODO: check later why it not work
      "object-curly-newline": [
        "error",
        {
          "ObjectExpression": { "multiline": true, "minProperties": 3 },
        }
      ],

      // Node best practices
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',

      // Prettier integration
      'prettier/prettier': 'error',
    },
    settings: {
      'import/resolver': {
        typescript: {
          // always try to resolve types under `<root>@types` directory even it doesn't contain source code
          alwaysTryTypes: true,
          project: './tsconfig.json', // path to your tsconfig file
        },
      },
    },
  },

  // Turn off conflicting rules with Prettier
  prettierConfig,
];
