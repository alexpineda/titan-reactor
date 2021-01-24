import { FileLoader } from "three";
import { fsPromises } from "fs";

const loading = {};

FileLoader.prototype.load = function (url, onLoad, onProgress, onError) {
  if (loading[url] !== undefined) {
    loading[url].push({
      onLoad: onLoad,
      onProgress: onProgress,
      onError: onError,
    });

    return;
  }

  loading[url] = [];

  loading[url].push({
    onLoad: onLoad,
    onProgress: onProgress,
    onError: onError,
  });

  const callbacks = loading[url];

  delete loading[url];

  this.manager.itemStart(url);

  fsPromises
    .readFile(url)
    .then((buf) => {
      for (let i = 0, il = callbacks.length; i < il; i++) {
        const callback = callbacks[i];
        if (callback.onLoad) callback.onLoad(buf.buffer);
      }

      this.manager.itemEnd(url);
    })
    .catch((err) => {
      for (let i = 0, il = callbacks.length; i < il; i++) {
        const callback = callbacks[i];
        if (callback.onError) callback.onError(err);
      }

      this.manager.itemError(url);
      this.manager.itemEnd(url);
    });
};
