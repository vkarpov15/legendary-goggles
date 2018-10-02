module.exports = {
  entry: {
    feed: './lib/lambda/feed.js',
    latestVersions: './lib/lambda/latestVersions.js',
    version: './lib/lambda/version.js'
  },
  target: 'node',
  output: {
    path: `${process.cwd()}/bin`,
    filename: '[name].js',
    libraryTarget: 'umd'
  },
  optimization: {
    minimizer: []
  }
};
