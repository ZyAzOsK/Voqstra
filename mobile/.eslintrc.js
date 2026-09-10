module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    // Prefer explicit return types on functions — readable at a glance
    '@typescript-eslint/explicit-function-return-type': 'warn',
    // Unused vars are a sign of incomplete refactoring
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // React 17+ doesn't need the JSX import
    'react/react-in-jsx-scope': 'off',
  },
};
