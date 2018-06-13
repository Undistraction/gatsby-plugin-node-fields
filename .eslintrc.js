module.exports = {
  extends: ['eslint-config-airbnb-base', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    jest: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    l: true,
  },
  rules: {
    'func-names': ['error', 'never'],
    'no-param-reassign': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-confusing-arrow': 'off',
    quotes: [
      'error',
      'backtick',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'jsx-quotes': ['error', 'prefer-double'],
    'comma-dangle': ['error', 'always-multiline'],
    'valid-jsdoc': ['error'],
    'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
    'import/extensions': ['off', 'never'],
  },
};
