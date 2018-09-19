const assert = require('assert');
const getRawGithubWikiMarkdown = require('../lib/helpers/getRawGithubWikiMarkdown');

describe('getRawGithubWikiMarkdown', function() {
  it('works for lodash', function() {
    assert.equal(getRawGithubWikiMarkdown('https://github.com/lodash/lodash/wiki/Changelog'),
      'https://raw.githubusercontent.com/wiki/lodash/lodash/Changelog.md');
  });
});
