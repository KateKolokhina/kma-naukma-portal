module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2016,
  },
  extends: ['plugin:prettier/recommended', 'eslint:recommended'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
  },
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:prettier/recommended',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: ['prettier', '@typescript-eslint'],
      rules: {
        'prettier/prettier': 'warn',
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/explicit-function-return-type': ['warn'],
      },
    },
  ],
};
