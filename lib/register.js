module.exports = db => async function register(data) {
  const Customer = db.model('Customer');

  const customer = new Customer(data);

  await customer.save();

  return { customer };
};
