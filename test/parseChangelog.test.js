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

  it('handles lodash style', function() {
    const changelog = [
      'See the [v4.0.0 release notes](https://github.com/lodash/lodash/releases/tag/4.0.0) for an overview of [what’s new in 4.0.0](#v400).',
      'Use [lodash-migrate](https://www.npmjs.com/package/lodash-migrate), [lodash-codemods](https://www.npmjs.com/package/lodash-codemods), &',
      '[eslint-plugin-lodash](https://www.npmjs.com/package/eslint-plugin-lodash) to help migrate pre-4 lodash code to the latest release.',
      '',
      '## <sub>v4.17.11</sub>',
      '#### _Sep. 12, 2018_ — [Diff](https://github.com/lodash/lodash/compare/4.17.10...4.17.11) — [Docs](https://github.com/lodash/lodash/blob/4.17.11/doc/README.md)',
      '',
      '  * Ensured `_.merge` handles function properties consistently regardless of number of sources',
      '  * Ensured `Object.prototype` is not augmented by `_.merge`',
      '  * Ensured placeholder properties are set on `fp.convert()` results',
      '  * Avoided ReDoS issue in `_.words` implementation',
      '',
      '## <sub>v4.17.10</sub>',
      '#### _Apr. 24, 2018_ — [Diff](https://github.com/lodash/lodash/compare/4.17.5...4.17.10) — [Docs](https://github.com/lodash/lodash/blob/4.17.10/doc/README.md)',
      '',
      '  * Updated Lodash for better Node.js 10 support'
    ].join('\n');

    const parsed = parseChangelog(changelog);

    assert.deepEqual(Object.keys(parsed), ['4.17.11', '4.17.10']);
  });
});
