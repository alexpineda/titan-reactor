import filelist from "./list";
import * as log from "../ipc/log";

const filenameFromPath = function (str: string) {
  return (str.split("\\").pop() || "").split("/").pop();
};

interface Callbacks {
  beforeFrame: () => void;
  afterFrame: () => void;
}

// A wrapper around file buffers that openbw wasm needs
export default class OpenBWFileList {
  files: ArrayBuffer[] = [];

  private getFileIndex(filename: string) {
    return filelist.findIndex(
      (item) => filename.toLowerCase() === item.toLowerCase()
    );
  }

  getFileNameList() {
    return filelist;
  }

  init(openBw: any, callbacks: Callbacks) {
    openBw.setupCallbacks(
      (ptr: any) => {
        throw new Error(openBw.UTF8ToString(ptr));
      },
      callbacks.beforeFrame, // pre-mainloop
      callbacks.afterFrame, // post-mainloop,
      (index: number) => this.files[index].byteLength, // get file size
      (index: number) => this.files[index], // get file buffer
      () => {
        log.info("OpenBW loaded");
        this.clear(); // done loading
      },
      (ptr: any) => {
        const filename = filenameFromPath(openBw.UTF8ToString(ptr));
        if (filename === undefined) {
          throw new Error("Filename is undefined");
        }
        const index = this.getFileIndex(filename);
        console.log(filename, index);
        return index >= 0 ? index : 9999;
      }
    );
  }

  addBuffer(filename: string, buffer: ArrayBuffer) {
    const index = this.getFileIndex(filename);
    if (index === -1) {
      throw new Error(`File ${filename} not found`);
    }
    this.files[index] = buffer;
  }

  clear() {
    this.files = [];
  }
}
