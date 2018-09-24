const superagent = require('superagent');

module.exports = get;

const MAX_NUM_RETRIES = 5;

async function get(url, text) {
  const originalError = new Error();
  let delay = 500;

  for (let i = 0; i < MAX_NUM_RETRIES; ++i) {
    let res;
    try {
      res = await superagent.get(url).then(res => text ? res.text : res.body);
    } catch (error) {
      originalError.message = error.message;
      originalError.status = error.status;

      // Don't bother retrying on 404
      if (error.status === 404) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
      continue;
    }

    return res;
  }

  throw originalError;
}
