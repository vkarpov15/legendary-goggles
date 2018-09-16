const superagent = require('superagent');

module.exports = get;

function get(url, text) {
  const originalError = new Error();

  return superagent.get(url).then(res => text ? res.text : res.body).catch(error => {
    originalError.message = error.message;
    originalError.status = error.status;
    throw originalError;
  });
}
