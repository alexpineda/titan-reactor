function isPromise(value) {
  return Boolean(value && typeof value.then === "function");
}

export const cache = (id, fn) => {
  if (fsCache[id]) {
    if (isPromise(fn)) {
      return new Promise((res) => res(fsCache[id]));
    } else {
      return fsCache[id];
    }
  }

  if (isPromise(fn)) {
  }
};
