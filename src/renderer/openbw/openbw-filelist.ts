
import fs from "fs";
import { findFiles } from "common/utils/casclib";

import * as log from "@ipc/log";
import settingsStore from "@stores/settings-store";

import filepaths from "./extra/filepaths";
import filelist from "./extra/list";
interface Callbacks {
  beforeFrame: () => void;
  afterFrame: () => void;
}

// A wrapper around file buffers that openbw wasm needs
export default class OpenBWFileList {
  private buffers: Int8Array[] = [];
  private index: Record<string, number> = {};
  unused: number[] = [];
  private _cleared = false;

  normalize(path: string) {
    return path.toLowerCase().replace(/\//g, "\\");
  }

  constructor(openBw: any, callbacks: Callbacks) {
    openBw.setupCallbacks({
      js_fatal_error: (ptr: any) => {
        throw new Error(openBw.UTF8ToString(ptr));
      },
      js_pre_main_loop: callbacks.beforeFrame, // pre-mainloop
      js_post_main_loop: callbacks.afterFrame, // post-mainloop,
      js_file_size: (index: number) => {
        return this.buffers[index].byteLength; // get file size: ;
      },
      js_read_data: (index: number, dst: number, offset: number, size: number) => { // get file buffer
        var data = this.buffers[index];
        for (var i2 = 0; i2 != size; ++i2) {
          openBw.HEAP8[dst + i2] = data[offset + i2];
        }
      },
      js_load_done: () => {
        this.clear(); // done loading, openbw has its own memory now
        log.verbose("@openbw-filelist: complete");
        log.verbose(`@openbw-filelist: ${this.unused.length} unused assets`);
      },
      js_file_index: (ptr: any) => {
        const filepath = openBw.UTF8ToString(ptr);
        if (filepath === undefined) {
          throw new Error("Filename is undefined");
        }
        const index = this.index[this.normalize(filepath)];
        this.unused.splice(this.unused.indexOf(index), 1);
        return index >= 0 ? index : 9999;
      }
    });
  }

  async loadBuffers(readFile: (filename: string) => Promise<Buffer | Uint8Array>) {
    if (this._cleared) {
      throw new Error("File list already cleared");
    }

    for (const filepath of filepaths) {
      const buffer = await readFile(filepath);

      let int8 = new Int8Array();

      if (settingsStore().isCascStorage) {
        //FIXME: why is casclib returning unit8array?
        int8 = Int8Array.from(buffer.subarray(0, buffer.byteLength / 8))
      }
      else {

        int8 = new Int8Array(
          buffer.buffer,
          buffer.byteOffset,
          buffer.length
        )

      }

      this.buffers.push(int8);
      this.index[this.normalize(filepath)] = this.buffers.length - 1;
      this.unused.push(this.buffers.length - 1);
    }

  }

  // utility
  async dumpFileList() {
    const paths: string[] = [];
    for (const filename of filelist) {
      const _paths = (await findFiles(filename)).filter((n: string) => !n.includes("Carbot"));
      paths.push(..._paths);
    }
    fs.writeFileSync("filelist.json", ["export default", JSON.stringify(paths)].join(" "));
  }

  clear() {
    this.buffers = [];
    this._cleared = true;
  }
}
