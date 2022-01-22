module.exports = {
  entry: {
    merchant: './out/tsc/merchant.js',
    //search: './src/search.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname  + '/out/webpack',
  },
  mode: "development",
};