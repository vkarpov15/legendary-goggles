const assert = require('assert');
const parseChangelog = require('../lib/helpers/parseChangelog');

describe('parseChangelog()', function() {
  it('handles no date', function() {
    const changelog = [
      'Changelog',
      '======',
      '## 5.2.3',
      '',
      '* Fixed bug with AndroidManifest.xml syntax for real',
      '',
      '## 5.2.2',
      '',
      '* Fixed bug with AndroidManifest.xml syntax'
    ].join('\n');

    const parsed = parseChangelog(changelog);

    assert.deepEqual(Object.keys(parsed), ['5.2.3', '5.2.2']);
  });
});
