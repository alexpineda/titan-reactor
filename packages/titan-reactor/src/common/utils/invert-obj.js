export default (obj) =>
  Object.entries(obj).reduce((memo, [key, val]) => {
    return {
      ...memo,
      [val]: key,
    };
  }, {});
