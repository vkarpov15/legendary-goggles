const superagent = require('superagent');

module.exports = getChangelog;

async function getChangelog(url) {
  const allowed = ['History.md', 'HISTORY.md', 'CHANGELOG.md'];

  const originalUrl = url;

  url = url.replace('github.com', 'raw.githubusercontent.com');

  for (const file of allowed) {
    const md = await superagent.get(`${url}/master/${file}`).
      then(res => res.text).
      catch(() => null);
    if (md != null) {
      return { changelog: md, url: `${originalUrl}/blob/master/${file}` };
    }
  }

  return null;
}
