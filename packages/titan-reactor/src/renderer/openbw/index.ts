import createOpenBw from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";
import { readFileSync } from "fs";
import path from "path";
import { UnitStruct, SoundStruct, ImageStruct } from "../integration/structs";
import { Vector } from "../integration/buffer-view/vector.js";

const openBwFiles = new OpenBWFileList();
const wasmFileLocation = path.join(__static, "titan.wasm");

const callbacks = {
  beforeFrame: () => { },
  afterFrame: () => { },
};

export interface OpenBWWasm {
  _reset: () => void;
  _load_replay: (buffer: number, length: number) => void;
  _next_frame: () => number;
  _counts: (player: number, index: number) => number;
  _get_buffer: (index: number) => number;
  _replay_get_value: (index: number) => number;
  _replay_set_value: (index: number, value: number) => void;
  _get_fow_ptr: (visiblity: number, instant: boolean) => number;
  get_util_funcs: () => ({
    get_units_debug: () => UnitStruct[],
    get_sprites_debug: () => ImageStruct[],
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

export interface OpenBWAPI {
  wasm?: OpenBWWasm;
  callbacks: {
    beforeFrame: () => void;
    afterFrame: () => void;
  };
  call: {
    getFowSize: () => number;
    getFowPtr: (visibility: number, instant: boolean) => number;
    getTilesPtr: () => number;
    getTilesSize: () => number;
    getSoundObjects: () => SoundStruct[];
    getSpritesOnTileLineSize: () => number;
    getSpritesOnTileLineAddress: () => number;
    getUnitsAddr: () => number;
    getBulletsAddress: () => number,
    getBulletsDeletedCount: () => number,
    getBulletsDeletedAddress: () => number,
    resetGameSpeed: () => void;
    nextFrame: () => number;
    tryCatch: (callback: () => void) => void;
    loadReplay: (buffer: Buffer) => void;
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
    const tryCatch = (cb: Function) => {
      try {
        return cb();
      } catch (e) {
        if (typeof e === 'number') {
          throw new Error(_wasm.getExceptionMessage(e));
        } else {
          throw e;
        }
      }
    };

    const _nextFrame = () => _wasm._next_frame();

    openBw.call = {
      getFowSize: () => _wasm._counts(0, 10),
      getFowPtr: (visibility: number, instant: boolean) => _wasm._get_fow_ptr(visibility, instant),
      getTilesPtr: () => _wasm._get_buffer(0),
      getTilesSize: () => _wasm._counts(0, 0),
      getSoundObjects: () => _wasm.get_util_funcs().get_sounds(),
      getSpritesOnTileLineSize: () => _wasm._counts(0, 14),
      getSpritesOnTileLineAddress: () => _wasm._get_buffer(1),
      getUnitsAddr: () => _wasm._get_buffer(2),
      getBulletsAddress: () => _wasm._get_buffer(6),
      getBulletsDeletedCount: () => _wasm._counts(0, 18),
      getBulletsDeletedAddress: () => _wasm._get_buffer(7),
      nextFrame: () => tryCatch(_nextFrame),
      resetGameSpeed: () => _wasm._replay_set_value(0, 1),
      loadReplay: (buffer: Buffer) => {
        tryCatch(() => {
          const buf = _wasm.allocate(buffer, _wasm.ALLOC_NORMAL);
          _wasm._load_replay(buf, buffer.length);
          _wasm._free(buf);
        });
      },
      tryCatch,
      main: () => {
        try {
          _wasm.callMain();
        } catch (e) {
          throw new Error(_wasm.getExceptionMessage(e));
        }
      }
    };
    //@ts-ignore
    window.openBw = openBw;
    return true;
  }),
  call: {
    main: () => { },
    getFowSize: () => 0,
    getFowPtr: (visibility: number, instant: boolean) => 0,
    getTilesPtr: () => 0,
    getTilesSize: () => 0,
    getSoundObjects: () => [],
    getSpritesOnTileLineSize: () => 0,
    getSpritesOnTileLineAddress: () => 0,
    getBulletsAddress: () => 0,
    getBulletsDeletedCount: () => 0,
    getBulletsDeletedAddress: () => 0,
    resetGameSpeed: () => { },
    nextFrame: () => 0,
    tryCatch: () => { },
    loadReplay: (buffer: Buffer) => { },
    getUnitsAddr: () => 0,
  }
};

export { openBw, openBwFiles };
