import createOpenBw from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";
import { readFileSync } from "fs";
import path from "path";
import { UnitStruct, SpriteStruct, SoundStruct, ImageStruct } from "../integration/structs";

const openBwFiles = new OpenBWFileList();
const wasmFileLocation = path.join(__static, "titan.wasm");

const callbacks = {
  beforeFrame: () => { },
  afterFrame: () => { },
};

export interface OpenBWWasm {
  _reset: () => void;
  _load_replay: (buffer: number, length: number) => void;
  _next_frame: () => void;
  _next_frame_exact: () => void;
  _counts: (player: number, index: number) => number;
  _get_buffer: (index: number) => number;
  _replay_get_value: (index: number) => number;
  _replay_set_value: (index: number, value: number) => void;
  _get_fow_ptr: (visiblity: number, instant: boolean) => number;
  get_util_funcs: () => ({
    get_units: (dirtyChecking: boolean) => UnitStruct[],
    get_sprites: () => number[],
    get_images: (spriteAddr: number) => number[],
    get_sounds: () => SoundStruct[],
    get_deleted_images: () => number[],
    get_deleted_sprites: () => number[],
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

export interface OpenBWAPI {
  wasm?: OpenBWWasm;
  callbacks: {
    beforeFrame: () => void;
    afterFrame: () => void;
  };
  call: {
    getFowSize: () => number;
    getFowPtr: (visibility: number, instant: boolean) => number;
    main: () => void;
  }
  loaded: Promise<boolean>;
};

const openBw: OpenBWAPI = {
  callbacks,
  loaded: createOpenBw({
    wasmBinary: readFileSync(wasmFileLocation),
  }).then((_wasm: OpenBWWasm) => {
    openBw.wasm = _wasm;
    openBwFiles.setup(_wasm, callbacks);
    openBw.call = {
      getFowSize: () => _wasm._counts(0, 10),
      getFowPtr: (visibility: number, instant: boolean) => _wasm._get_fow_ptr(visibility, instant),
      main: () => {
        try {
          _wasm.callMain();
        } catch (e) {
          throw new Error(_wasm.getExceptionMessage(e));
        }
      }
    };
    //@ts-ignore
    window.openBw = openBw.wasm;
    return true;
  }),
  call: {
    main: () => { },
    getFowSize: () => 0,
    getFowPtr: (visibility: number, instant: boolean) => 0
  }
};

export { openBw, openBwFiles };
