const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

mongoose.set('toJSON', { virtuals: true });

mongoose.plugin(schema => { schema.options.versionKey = false; });

const schemas = {
  account: require('./account'),
  customer: require('./customer'),
  downloadStats: require('./downloadstats'),
  message: require('./message'),
  package: require('./package'),
  state: require('./state'),
  token: require('./token'),
  version: require('./version')
};

module.exports = connect;

async function connect(uri, options) {
  const conn = await mongoose.createConnection(uri,
    Object.assign({ useNewUrlParser: true }, options));

  const init = [];
  for (const name of Object.keys(schemas)) {
    const modelName = capitalize(name);
    conn.model(modelName, schemas[name], modelName);
    init.push(conn.model(modelName).init());
  }

  await Promise.all(init);

  return conn;
}

const capitalize = str => str.charAt(0).toUpperCase() + str.substr(1);
