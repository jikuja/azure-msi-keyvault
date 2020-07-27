module.exports = {
  extends: [
    'eslint:recommended'
  ],
  plugins: [
    'import'
  ],
  env: {
    node: true,
    es2017: true
  },
  parserOptions: {
    ecmaVersion: 2018
  }
}