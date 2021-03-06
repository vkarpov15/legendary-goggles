const convertToGithubUrl = require('./helpers/convertToGithubUrl');
const parseChangelog = require('./helpers/parseChangelog');
const getRawGithubWikiMarkdown = require('./helpers/getRawGithubWikiMarkdown');
const { get } = require('./util/get');

module.exports = async function getParsedChangelog(pkg) {
  const { repository } = pkg;

  let githubUrl;
  try {
    githubUrl = convertToGithubUrl(repository);
  } catch (error) {
    return { changelog: null, url: null, githubUrl: null };
  }
  const changelogInfo = await getChangelog(githubUrl);

  if (changelogInfo == null) {
    return { changelog: null, url: null, githubUrl };
  }

  const { changelog, url } = changelogInfo;
  const parsed = parseChangelog(changelog);
  return { changelog: parsed, url, githubUrl };
};

async function getChangelog(url) {
  const allowed = ['History.md', 'HISTORY.md', 'CHANGELOG.md'];

  const originalUrl = url;

  url = url.replace('github.com', 'raw.githubusercontent.com');

  for (const file of allowed) {
    const md = await get(`${url}/master/${file}`, true).
      catch(() => null);
    if (md != null) {
      return { changelog: md, url: `${originalUrl}/blob/master/${file}` };
    }
  }

  const wikiAllowed = ['Changelog'];
  for (const file of wikiAllowed) {
    const _url = getRawGithubWikiMarkdown(`${originalUrl}/wiki/${file}`);
    const md = await get(_url, true).catch(() => null);
    if (md != null) {
      return { changelog: md, url: `${originalUrl}/blob/master/${file}` };
    }
  }

  return null;
}
