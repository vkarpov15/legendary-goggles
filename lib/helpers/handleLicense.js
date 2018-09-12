module.exports = handleLicense;

function handleLicense(v) {
  if (v == null) {
    return v;
  }
  if (typeof v === 'object' && typeof v.type === 'string') {
    return v.type;
  }
  return v;
}
