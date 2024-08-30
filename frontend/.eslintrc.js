module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: ['react-app', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    'prettier/prettier': [
      'off',
      {
        endOfLine: 'auto',
      },
    ],
    eqeqeq: 'error',
    'no-empty-pattern': 'off',
    'jsx-a11y/alt-text': 'error',
    'array-callback-return': 'error',
    'jsx-a11y/anchor-is-valid': 'error',
    'jsx-a11y/iframe-has-title': 'error',
    'react/jsx-no-target-blank': 'error',
    'jsx-a11y/img-redundant-alt': 'error',
    'react-hooks/exhaustive-deps': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-use-before-define': 'off', // Not Recommended on TypeScript https://palantir.github.io/tslint/rules/no-use-before-declare/
    '@typescript-eslint/no-useless-constructor': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/consistent-type-assertions': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-console': 1,
  },
};
