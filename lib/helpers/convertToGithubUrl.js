const assert = require('assert');

module.exports = convertToGithubUrl;

function convertToGithubUrl(repo) {
  assert.equal(repo.type, 'git');
  assert.ok(repo.url.includes('github.com'), repo.url);

  let url = 'https://github.com/' + repo.url.
    replace(/^.*github\.com\//i, '').
    replace(/\.git$/i, '');

  const match = url.match(/^.*github.com\/[^\/]+\/[^\/]+(.*)/);
  if (match != null) {
    url = url.substr(0, url.length - match[1].length);
  }

  return url;
}
