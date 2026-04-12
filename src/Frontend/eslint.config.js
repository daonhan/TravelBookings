import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/bookings/*'],
              message: 'Cross-feature imports are not allowed. Use shared modules instead.',
            },
            {
              group: ['@/features/events/*'],
              message: 'Cross-feature imports are not allowed. Use shared modules instead.',
            },
            {
              group: ['@/features/payments/*'],
              message: 'Cross-feature imports are not allowed. Use shared modules instead.',
            },
            {
              group: ['@/features/reports/*'],
              message: 'Cross-feature imports are not allowed. Use shared modules instead.',
            },
            {
              group: ['@/features/notifications/*'],
              message: 'Cross-feature imports are not allowed. Use shared modules instead.',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.*'],
  },
);
