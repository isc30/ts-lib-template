// Documentation for this file: https://prettier.io/docs/en/configuration.html
module.exports = {
  pluginSearchDirs: ['./common/autoinstallers/rush-prettier/node_modules'],
  plugins: ['./common/autoinstallers/rush-prettier/node_modules/@trivago/prettier-plugin-sort-imports'],
  // We use a larger print width because Prettier's word-wrapping seems to be tuned
  // for plain JavaScript without type annotations
  printWidth: 110,
  // Use .gitattributes to manage newlines
  endOfLine: 'auto',
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  importOrder: ['^@data/(.*)$', '^@core-ui/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
