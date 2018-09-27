module.exports = {
  entry: {
    latestVersions: './lib/lambda/latestVersions.js',
    version: './lib/lambda/version.js'
  },
  target: 'node',
  output: {
    path: `${process.cwd()}/bin`,
    filename: '[name].js',
    libraryTarget: 'umd'
  }
};
