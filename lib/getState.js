module.exports = db => async function getState() {
  return { state: await db.model('State').findOne() };
};
