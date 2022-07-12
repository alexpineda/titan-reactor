import createOpenBw from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";
import { readFileSync } from "fs";
import path from "path";
import { OpenBWAPI, OpenBWWasm } from "../../common/types";
export * from "./openbw-game-read-head";

const openBwFiles = new OpenBWFileList();
const wasmFileLocation = path.join(__static, "titan.wasm");

const callbacks = {
  beforeFrame: () => { },
  afterFrame: () => { },
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
      getFowSize: () => _wasm._counts(10),
      getFowPtr: (visibility: number, instant: boolean) => _wasm._get_fow_ptr(visibility, instant),
      getTilesPtr: () => _wasm._get_buffer(0),
      getTilesSize: () => _wasm._counts(0),
      getSoundObjects: () => _wasm.get_util_funcs().get_sounds(),
      getSpritesOnTileLineSize: () => _wasm._counts(14),
      getSpritesOnTileLineAddress: () => _wasm._get_buffer(1),
      getUnitsAddr: () => _wasm._get_buffer(2),
      getBulletsAddress: () => _wasm._get_buffer(6),
      getBulletsDeletedCount: () => _wasm._counts(18),
      getBulletsDeletedAddress: () => _wasm._get_buffer(7),
      getLinkedSpritesAddress: () => _wasm._get_buffer(10),
      getLinkedSpritesCount: () => _wasm._counts(1),

      nextFrame: () => tryCatch(_nextFrame),
      setGameSpeed: (speed: number) => _wasm._replay_set_value(0, speed),
      getGameSpeed: () => _wasm._replay_get_value(0),
      setCurrentFrame: (frame: number) => _wasm._replay_set_value(3, frame),
      getCurrentFrame: () => _wasm._replay_get_value(3),
      isPaused: () => _wasm._replay_get_value(1) === 1,
      setPaused: (paused: boolean) => _wasm._replay_set_value(1, paused ? 1 : 0),
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
  })
};

const getOpenBW = () => {
  return openBw;
}

export { openBw, openBwFiles, getOpenBW };
