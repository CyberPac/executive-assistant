module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  overrides: [
    {
      files: ['src/**/*.ts'],
      excludedFiles: ['**/*.d.ts'],
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off'
      }
    },
    {
      files: ['src/**/*.d.ts'],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    'no-var': 'error',
    'no-case-declarations': 'error'
  },
  env: {
    node: true,
    es2022: true
  }
};