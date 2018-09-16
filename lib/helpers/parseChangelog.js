'use strict';

const marked = require('marked');
const cheerio = require('cheerio');

module.exports = parseChangelog;

function parseChangelog(md) {
  const lines = md.split('\n');
  const releases = {};

  let curRelease = null;
  for (const line of lines) {
    if (!cheerio.load(marked(line)).text().trim()) {
      continue;
    }

    const match = line.match(/^[#\s[\]]*(\d+\.\d+\.\d+)/);
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
