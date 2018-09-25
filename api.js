const api = require('./lib/api');
const config = require('./.config');
const connect = require('./lib/mongoose');

run().catch(error => console.error(error.stack));

async function run() {
  const db = await connect(config.mongodb);
  await api(config, db);
}
