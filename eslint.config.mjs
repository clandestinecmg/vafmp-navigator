// eslint.config.mjs — ESLint v9 flat config
import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
  // Ignore junk
  {
    ignores: [
      'dist',
      'build',
      'node_modules',
      'logs',
      'snapshot',
      '.expo',
      '.expo-shared',
      'ios/Pods/**',
      'android/**',
    ],
  },

  js.configs.recommended,
  ...ts.configs.recommended,

  // TypeScript / React Native source
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: ts.parser,
      parserOptions: { project: './tsconfig.json' },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // RN uses require(...) for images; allow it
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Plain JS (e.g., babel.config.js)
  {
    files: ['**/*.js'],
    languageOptions: {
      // Permit CommonJS-style globals used by Babel config
      globals: {
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },

  // Declaration files — relax strictness
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
