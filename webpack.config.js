module.exports = {
  entry: ['./lib/lambda/latestVersions.js'],
  target: 'node',
  output: {
    path: `${process.cwd()}/bin`,
    filename: 'lambda-latest-versions.js',
    libraryTarget: 'umd'
  }
};
