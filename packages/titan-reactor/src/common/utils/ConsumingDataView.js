export const ConsumingDataView = (dataView, offset = 0, endianness = true) => {
  let bytesConsumed = 0;
  return new Proxy(dataView, {
    get: (target, prop, receiver) => {
      if (typeof target[prop] === "function" && prop.substr(0, 3) === "get") {
        return () => {
          const len = prop.substr(-1) === "8" ? 1 : Number(prop.substr(-2)) / 8;
          const fn = target[prop];
          let result = fn.call(target, offset + bytesConsumed, endianness);
          bytesConsumed = bytesConsumed + len;
          return result;
        };
      } else if (prop === "bytesConsumed") {
        return bytesConsumed;
      } else {
        return Reflect.get(target, prop, receiver);
      }
    },
  });
};
export default ConsumingDataView;
