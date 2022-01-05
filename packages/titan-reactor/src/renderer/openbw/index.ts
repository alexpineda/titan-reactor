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
  callMain: () => void;
  _next_frame: () => void;
  _next_frame_exact: () => void;
  getExceptionMessage: (e: unknown) => string;
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
