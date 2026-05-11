import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import functional from 'eslint-plugin-functional'
import importX from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['dist/', 'src-tauri/', 'node_modules/'],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        projectService: {
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      functional,
      'import-x': importX,
      'react-hooks': reactHooks,
    },
    rules: {
      // TypeScript strict rules
      ...tseslint.configs['strict-type-checked'].rules,

      // No explicit any
      '@typescript-eslint/no-explicit-any': 'error',

      // No default exports
      'import-x/no-default-export': 'error',

      // Immutability
      'functional/immutable-data': ['error', {
        ignoreClasses: true,
        ignoreImmediateMutation: true,
        ignoreAccessorPattern: ['**.current', '**.innerHTML'],
      }],
      'functional/no-let': 'error',
      'functional/prefer-readonly-type': 'off',

      // General
      'no-param-reassign': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',

      // React hooks (works with Preact)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Disable rules that conflict with empty stubs during scaffolding
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Layer boundary: schema/ cannot import from core/, store/, shell/, viewport/, ui/
  {
    files: ['src/schema/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/core/**', '**/store/**', '**/shell/**', '**/viewport/**', '**/ui/**'],
          message: 'schema/ cannot import from upper layers.',
        }],
      }],
    },
  },

  // Layer boundary: core/ cannot import from store/, shell/, viewport/, ui/
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/store/**', '**/shell/**', '**/viewport/**', '**/ui/**'],
          message: 'core/ cannot import from store/, shell/, viewport/, or ui/.',
        }],
      }],
    },
  },

  // Layer boundary: store/ cannot import from viewport/, ui/
  {
    files: ['src/store/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/viewport/**', '**/ui/**'],
          message: 'store/ cannot import from viewport/ or ui/.',
        }],
      }],
    },
  },

  // Layer boundary: viewport/ cannot import from ui/
  {
    files: ['src/viewport/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['**/ui/**'],
          message: 'viewport/ cannot import from ui/.',
        }],
      }],
    },
  },

  // Shell and viewport are the impure layers — allow mutable data patterns
  {
    files: ['src/shell/**/*.ts', 'src/viewport/**/*.ts'],
    rules: {
      'functional/immutable-data': 'off',
      'functional/no-let': 'off',
    },
  },
]
