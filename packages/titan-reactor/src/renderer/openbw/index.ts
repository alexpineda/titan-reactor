import createOpenBw from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";
import { readFileSync } from "fs";
import path from "path";
import { UnitStruct } from "../integration/data-transfer/unit-struct.js";
import { SpriteStruct } from "../integration/data-transfer/sprite-struct.js";
import { SoundStruct } from "../integration/data-transfer/sound-struct.js";

const openBwFiles = new OpenBWFileList();
const wasmFileLocation = path.join(__static, "titan.wasm");

const callbacks = {
  beforeFrame: () => { },
  afterFrame: () => { },
};

export interface OpenBWWasmAPI {
  _reset: () => void;
  _load_replay: (buffer: number, length: number) => void;
  _next_frame: () => void;
  _next_frame_exact: () => void;
  _counts: (player: number, index: number) => number;
  _get_buffer: (index: number) => number;
  _replay_get_value: (index: number) => number;
  _replay_set_value: (index: number, value: number) => void;
  get_util_funcs: () => ({
    get_units: (dirtyChecking: boolean) => UnitStruct[],
    get_sprites: (dirtyChecking: boolean) => SpriteStruct[],
    get_sounds: () => SoundStruct[],
  })

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
  callMain: () => void;
}
const openBw: OpenBWWasmWrapper = {
  callbacks,
  loaded: createOpenBw({
    wasmBinary: readFileSync(wasmFileLocation),
  }).then((_api: OpenBWWasmAPI) => {
    openBw.api = _api;
    openBwFiles.setup(_api, callbacks);
    //@ts-ignore
    window.openBw = openBw.api;
    return true;
  }),
  callMain: () => {
    try {
      openBw.api?.callMain();
    } catch (e) {
      throw new Error(openBw.api?.getExceptionMessage(e));
    }
  },
};

export { openBw, openBwFiles };
