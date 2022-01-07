import createOpenBw from "./titan.js";
import OpenBWFileList from "./openbw-filelist";
import { readFileSync } from "fs";
import path from "path";

const openBwFiles = new OpenBWFileList();
const wasmFileLocation = path.join(__static, "titan.wasm");

const callbacks = {
  beforeFrame: () => {},
  afterFrame: () => {},
};

export interface OpenBWWasmAPI {
  _reset: () => void;
  _load_replay: (buffer:number, length: number ) => void;
  _next_frame: () => void;
  _next_frame_exact: () => void;
  _counts: (player:number, index:number) => number;
  _get_buffer: (index:number) => number;
  _replay_get_value: (index:number) => number;

  callMain: () => void;
  HEAP8: Int8Array;
  HEAPU8: Uint8Array;
  HEAP16: Int16Array;
  HEAPU16: Uint16Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
  getExceptionMessage: (e: unknown) => string;
  allocate: (buffer: ArrayBuffer, flags: number) => number;
  _free: (buffer: number) => void;
  ALLOC_NORMAL: number;
}

interface OpenBWWasmWrapper {
  api?: OpenBWWasmAPI;
  callbacks: {
    beforeFrame: () => void;
    afterFrame: () => void;
  };
  loaded: Promise<boolean>;
  start: () => void;
}
const openBw: OpenBWWasmWrapper = {
  callbacks,
  loaded: createOpenBw({
    wasmBinary: readFileSync(wasmFileLocation),
  }).then((_api: OpenBWWasmAPI) => {
    openBw.api = _api;
    openBwFiles.init(_api, callbacks);
    return true;
  }),
  start: () => {
    try {
      openBw.api?.callMain();
    } catch (e) {
      throw new Error(openBw.api?.getExceptionMessage(e));
    }
  },
};

export { openBw, openBwFiles };
