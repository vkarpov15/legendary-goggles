module.exports = toKeyValueArray;

function toKeyValueArray(obj) {
  if (obj == null) {
    return [];
  }
  return Object.keys(obj).
    reduce((cur, key) => cur.concat([[key, obj[key]]]), []);
}
