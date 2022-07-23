module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@jambit/typed-redux-saga'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'standard-with-typescript',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      arrowFunctions: true,
    },
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['**/dist/**'],
      },
    ],
    'no-void': [
      2,
      {
        allowAsStatement: true,
      },
    ],
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    jest: {
      version: 26,
    },
  },
  overrides: [
    {
      plugins: ['jest', '@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'standard-with-typescript',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'prettier',
      ],
      files: ['**/*.test.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-restricted-imports': [
          'error',
          {
            patterns: ['**/dist/**'],
          },
        ],
        'no-void': [
          2,
          {
            allowAsStatement: true,
          },
        ],
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' },
        ],
        '@typescript-eslint/unbound-method': 'off',
        '@jambit/typed-redux-saga/use-typed-effects': 'error',
        '@jambit/typed-redux-saga/delegate-effects': 'error',
        'jest/unbound-method': 'error',
        'jest/expect-expect': [
          'error',
          {
            assertFunctionNames: ['expect', 'expectSaga'],
          },
        ],
      },
      env: {
        jest: true,
        'jest/globals': true,
      },
    },
    {
      files: ['src/**/*'],
      env: {
        browser: true,
        worker: true,
        node: true,
        es2020: true,
      },
    },
  ],
}
