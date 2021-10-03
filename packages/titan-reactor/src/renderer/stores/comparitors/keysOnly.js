// check keys since shallow will verify same object
export default (a, b) => {
  if (!a || !b) return false;
  var keysA = Object.keys(a);

  if (keysA.length !== Object.keys(b).length) {
    return false;
  }

  for (var i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(a, keysA[i]) ||
      !Object.is(a[keysA[i]], b[keysA[i]])
    ) {
      return false;
    }
  }
  return true;
};
