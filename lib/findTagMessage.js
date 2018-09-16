const convertToGithubUrl = require('./helpers/convertToGithubUrl');
const get = require('./util/get');

const root = 'https://api.github.com';

module.exports = findTagMessage;

async function findTagMessage(pkg, version) {
  let url;
  try {
    url = convertToGithubUrl(pkg.repository);
  } catch (error) {
    return null;
  }

  const [owner, repo] = url.substr('https://github.com/'.length).split('/');

  const tags = await get(`${root}/repos/${owner}/${repo}/tags`).
    catch(() => null);
  if (tags == null) {
    return null;
  }

  for (const tag of tags) {
    if (new RegExp('^v?' + version + '$', 'i').test(tag.name)) {
      const commitUrl = tag.commit.url;
      const commit = await get(commitUrl);

      return commit.commit.message;
    }
  }

  return null;
}
