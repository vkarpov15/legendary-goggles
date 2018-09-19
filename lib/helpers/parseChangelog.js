'use strict';

const marked = require('marked');
const cheerio = require('cheerio');

module.exports = parseChangelog;

function parseChangelog(md) {
  const lines = md.split('\n');
  const releases = {};

  let curRelease = null;
  for (const line of lines) {
    const compiled = cheerio.load(marked(line)).text().trim();
    if (!compiled) {
      continue;
    }

    // Start out with the uncompiled markdown and look for anything that starts
    // with some number of `#` and space, followed by a version number
    const match = line.match(/^[#\s[\]]*v?(\d+\.\d+\.\d+)/) ||
      // Fall back to checking the rendered markdown because lodash adds a
      // `<sub>` around their version numbers
      compiled.match(/v?(\d+\.\d+\.\d+)$/i);
    if (match != null) {
      curRelease = match[1];
    }
    if (curRelease == null) {
      continue;
    }
    releases[curRelease] = releases[curRelease] || '';
    releases[curRelease] += line + '\n';
  }

  return releases;
}
