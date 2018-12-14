module.exports = handleLicense;

function handleLicense(v) {
  if (v == null) {
    return v;
  }
  if (typeof v === 'object') {
    if (typeof v.type === 'string') {
      return v.type;
    }
    if (typeof v.name === 'string') {
      return v.name;
    }
  }
  return null;
}
