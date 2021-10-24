export default (names, obj) => {
  const result = {};
  for (const name of names) {
    if (name in obj) {
      result[name] = obj[name];
    }
  }
  return result;
};
