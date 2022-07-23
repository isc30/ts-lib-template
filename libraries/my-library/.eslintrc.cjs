require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  extends: ['@common/eslint-config'],
  parserOptions: { tsconfigRootDir: __dirname },
}
