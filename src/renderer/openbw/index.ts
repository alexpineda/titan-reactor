import { readFileSync } from "fs";
import path from "path";
import { OpenBWAPI, OpenBWWasm, ReadFile } from "common/types";
import initializeWASM from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";

const wasmFileLocation = path.join(__static, "titan.wasm");

const createOpenBW = async () => {
  const callbacks = {
    beforeFrame: () => { },
    afterFrame: () => { },
  };

  const wasm = await initializeWASM({
    locateFile: (filename: string) => {
      if (filename === "titan.worker.js") {
        return path.join(__static, filename);
      }
    },
    wasmBinary: readFileSync(wasmFileLocation)
  }) as OpenBWWasm;

  const openBW = Object.create(wasm) as OpenBWAPI;

  const tryCatch = (cb: Function) => {
    try {
      return cb();
    } catch (e) {
      if (typeof e === 'number') {
        throw new Error(wasm.getExceptionMessage(e));
      } else {
        throw e;
      }
    }
  };

  openBW.getFowSize = () => wasm._counts(10);
  openBW.getFowPtr = (visibility: number, instant: boolean) => wasm._get_fow_ptr(visibility, instant);

  openBW.getTilesPtr = () => wasm._get_buffer(0);
  openBW.getTilesSize = () => wasm._counts(0);

  openBW.getSoundObjects = () => wasm.get_util_funcs().get_sounds();

  openBW.getSpritesOnTileLineSize = () => wasm._counts(14);
  openBW.getSpritesOnTileLineAddress = () => wasm._get_buffer(1);

  openBW.getUnitsAddr = () => wasm._get_buffer(2);

  openBW.getBulletsAddress = () => wasm._get_buffer(6);
  openBW.getBulletsDeletedCount = () => wasm._counts(18);
  openBW.getBulletsDeletedAddress = () => wasm._get_buffer(7);

  openBW.getLinkedSpritesAddress = () => wasm._get_buffer(10);
  openBW.getLinkedSpritesCount = () => wasm._counts(1);

  openBW.getSoundsAddress = () => wasm._get_buffer(11);
  openBW.getSoundsCount = () => wasm._counts(6);


  const _nextFrame = () => wasm._next_frame();
  openBW.nextFrame = (debug = false) => debug ? tryCatch(_nextFrame) : _nextFrame();

  openBW.setGameSpeed = (speed: number) => wasm._replay_set_value(0, speed);
  openBW.getGameSpeed = () => wasm._replay_get_value(0);

  openBW.setCurrentFrame = (frame: number) => wasm._replay_set_value(3, frame);
  openBW.getCurrentFrame = () => wasm._replay_get_value(3);

  openBW.isPaused = () => wasm._replay_get_value(1) === 1;
  openBW.setPaused = (paused: boolean) => wasm._replay_set_value(1, paused ? 1 : 0);

  openBW.loadReplay = (buffer: Buffer) => {
    tryCatch(() => {
      const buf = wasm.allocate(buffer, wasm.ALLOC_NORMAL);
      wasm._load_replay(buf, buffer.length);
      wasm._free(buf);
    });
  };
  openBW.tryCatch = tryCatch;

  openBW.start = async (readFile: ReadFile) => {
    if (openBW.running) return;

    const files = new OpenBWFileList(wasm, callbacks);
    await files.loadBuffers(readFile);
    tryCatch(() => wasm.callMain());
    openBW.running = true;
  }
  return openBW;
}

const openBws: Record<number, OpenBWAPI> = {};

const getOpenBW = async (instance = 0) => {
  if (openBws[instance]) return openBws[instance];

  const openBW = await createOpenBW();
  openBws[instance] = openBW;
  return openBW;
}

export { getOpenBW };
