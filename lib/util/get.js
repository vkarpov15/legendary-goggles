const superagent = require('superagent');

module.exports = get;

const MAX_NUM_RETRIES = 3;

async function get(url, text) {
  const originalError = new Error();

  for (const i = 0; i < MAX_NUM_RETRIES; ++i) {
    let res;
    try {
      res = await superagent.get(url).then(res => text ? res.text : res.body);
    } catch (error) {
      originalError.message = error.message;
      originalError.status = error.status;
      continue;
    }

    return res;
  }

  throw originalError;
}
