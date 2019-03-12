'use strict';

const Archetype = require('archetype');

const UnsubscribeParams = new Archetype({
  email: {
    $type: 'string',
    $required: true
  }
}).compile('UnsubscribeParams');

module.exports = ({ db }) => async function unsubscribe(params) {
  const { email } = new UnsubscribeParams(params);

  await db.collection('Account').updateMany({}, {
    $pull: {
      emails: email
    }
  });

  return { unsubscribed: email, success: true };
}
