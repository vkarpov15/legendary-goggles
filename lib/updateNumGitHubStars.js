const assert = require('assert');
const convertToGithubUrl = require('./helpers/convertToGithubUrl');
//const { get } = require('./util/get');
const logger = require('./logger');
const superagent = require('superagent');

module.exports = async function updateNumGitHubStars(pkg) {
  let githubUrl;

  try {
    githubUrl = convertToGithubUrl(pkg.repository).
      replace('github.com/', 'api.github.com/repos/');
  } catch (err) {
    console.log(`Skip ${pkg._id}`);

    pkg.github = null;
    await pkg.save();

    return null;
  }

  logger.debug(`Get ${githubUrl}`);

  const creds = '?client_id=051f55ff880f351abece&client_secret=1bd7a71e4dd8b509ffeefdea518f72d2d062d3b0';
  const res = await superagent.get(githubUrl + creds).catch(err => {
    if (err.status === 404) {
      return null;
    }
    throw err;
  });

  if (res == null) {
    logger.debug(`Not found: ${githubUrl}`);

    pkg.github = null;
    await pkg.save();

    return true;
  }

  pkg.github = { numStars: res.body['watchers_count'] };

  await pkg.save();

  return pkg;
};
