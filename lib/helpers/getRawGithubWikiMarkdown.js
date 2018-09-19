module.exports = getRawGithubWikiMarkdown;

// Like https://github.com/lodash/lodash/wiki/Changelog ->
// https://raw.githubusercontent.com/wiki/lodash/lodash/Changelog.md
function getRawGithubWikiMarkdown(url) {
  const match = url.match(/^https?:\/\/w*\.?github.com\/([^/]+)\/([^/]+)\/wiki\/(.*)/i);

  if (match == null) {
    return null;
  }

  const [, owner, repo, path] = match;

  return `https://raw.githubusercontent.com/wiki/${owner}/${repo}/${path}.md`;
}
