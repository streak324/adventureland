module.exports = {
  entry: {
    merchant: './out/tsc/merchant.js',
    warrior: './out/tsc/warrior.js',
    mage: './out/tsc/mage.js',
    priest: './out/tsc/priest.js',
  },
  output: {
    filename: '[name].js',
    path: __dirname  + '/out/webpack',
	library: 'exports',
  },
  mode: "production",
};