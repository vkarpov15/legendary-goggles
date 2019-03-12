'use strict';

const marked = require('marked');

module.exports = function htmlifyChangelog(version, changelog) {
  if (changelog == null) {
    return '';
  }

  let lines = changelog.trim().split('\n');
  if (lines[0].includes(version)) {
    lines = lines.slice(1);
  }

  return marked(lines.join('\n'));
};
