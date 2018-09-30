const assert = require('assert');
const convertToGithubUrl = require('../lib/helpers/convertToGithubUrl');

describe('convertToGithubUrl', function() {
  it('strips trailing', function() {
    const obj = {
      type: 'git',
      url: 'https://github.com/yahoo/navi/tree/master/packages/app'
    };
    assert.equal(convertToGithubUrl(obj), 'https://github.com/yahoo/navi');
  });
});
