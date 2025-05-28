module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'prettier/prettier': 'warn',
    'no-await-in-loop': 'warn',
    'arrow-body-style': ['warn', 'as-needed'],
    '@typescript-eslint/ban-types': 'warn',
    'max-params': 'warn',
    '@typescript-eslint/naming-convention': 'warn',
    'unused-imports/no-unused-imports': 'warn',
  },
};
