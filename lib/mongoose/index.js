const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);

const schemas = ['package', 'state', 'version'].
  reduce((cur, name) => Object.assign(cur, { [name]: require(`./${name}`) }), {});

module.exports = connect;

async function connect(uri) {
  const conn = await mongoose.createConnection(uri, { useNewUrlParser: true });

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
