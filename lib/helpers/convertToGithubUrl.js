const assert = require('assert');

module.exports = convertToGithubUrl;

function convertToGithubUrl(repo) {
  assert.equal(repo.type, 'git');
  assert.ok(repo.url.includes('github.com'), repo.url);

  return 'https://github.com/' + repo.url.
    replace(/^.*github\.com\//i, '').
    replace(/\.git$/i, '');
}
