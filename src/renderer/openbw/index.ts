import { readFileSync } from "fs";
import path from "path";
import { OpenBW, OpenBWWasm, ReadFile } from "common/types";
import initializeWASM from "./titan.wasm.js";
import OpenBWFileList from "./openbw-filelist";
import { Timer } from "@utils/timer";

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

  const openBW = Object.create(wasm) as OpenBW;

  const tryCatch = (cb: () => any) => {
    try {
      return cb();
    } catch (e) {
      if (typeof e === "number") {
        throw new Error(wasm.getExceptionMessage(e));
      } else {
        throw e;
      }
    }
  };

  openBW.unitGenerationSize = 3;

  openBW.generateFrame = () => wasm._generate_frame();
  
  openBW.getFowSize = () => wasm._counts(10);
  openBW.getFowPtr = () => wasm._get_buffer(16);
  openBW.setPlayerVisibility = (visibility: number) => wasm._set_player_visibility(visibility);

  openBW.getCreepSize = () => wasm._counts(2);
  openBW.getCreepPtr = () => wasm._get_buffer(14);

  openBW.getCreepEdgesSize = () => wasm._counts(3);
  openBW.getCreepEdgesPtr = () => wasm._get_buffer(15);

  openBW.getTilesPtr = () => wasm._get_buffer(0);
  openBW.getTilesSize = () => wasm._counts(0);

  openBW.getSoundObjects = () => wasm.get_util_funcs().get_sounds();

  openBW.getSpritesOnTileLineSize = () => wasm._counts(14);
  openBW.getSpritesOnTileLineAddress = () => wasm._get_buffer(1);

  openBW.getUnitsAddr = () => wasm._get_buffer(2);

  openBW.getBulletsAddress = () => wasm._get_buffer(6);
  openBW.getBulletsDeletedCount = () => wasm._counts(18);
  openBW.getBulletsDeletedAddress = () => wasm._get_buffer(7);

  openBW.getSoundsAddress = () => wasm._get_buffer(11);
  openBW.getSoundsCount = () => wasm._counts(6);

  openBW.getIScriptProgramDataSize = () => {
    return wasm._counts(12);
  }

  openBW.getIScriptProgramDataAddress = () => {
    return wasm._get_buffer(12);
  }

  let _isReplay = true, _isSandBox = false;
  const timer = new Timer

  openBW.nextFrame = () => {
    if (_isSandBox) {
      timer.update();
      if (timer.getElapsed() > 42) {
        timer.resetElapsed();
        return wasm._next_no_replay();
      }
      return wasm._replay_get_value(2);
    }
    return wasm._next_frame();
  }

  openBW.nextFrameNoAdvance = () => {
    return wasm._next_no_replay();
  }

  openBW.isReplay = () => _isReplay;

  openBW.setSandboxMode = (sandbox: boolean) => {
    if (!_isReplay) {
      return;
    }
    return _isSandBox = sandbox;
  }

  openBW.isSandboxMode = () => _isSandBox;

  openBW.setGameSpeed = (speed: number) => wasm._replay_set_value(0, speed);
  openBW.getGameSpeed = () => wasm._replay_get_value(0);

  openBW.setCurrentFrame = (frame: number) => wasm._replay_set_value(3, frame);
  openBW.getCurrentFrame = () => wasm._replay_get_value(3);

  openBW.isPaused = () => wasm._replay_get_value(1) === 1;
  openBW.setPaused = (paused: boolean) => wasm._replay_set_value(1, paused ? 1 : 0);

  openBW.getPlayersAddress = () => wasm._get_buffer(10);

  openBW.setUnitLimits = (unitLimits: number) => {
    openBW.unitGenerationSize = unitLimits === 1700 ? 5 : 3;
  }

  openBW.loadReplay = (buffer: Buffer) => {

    _isReplay = true;
    _isSandBox = false;

    tryCatch(() => {
      const buf = wasm.allocate(buffer, wasm.ALLOC_NORMAL);
      wasm._load_replay(buf, buffer.length);
      wasm._free(buf);
      _isReplay = true;
    });
  };

  openBW.loadMap = (buffer: Buffer) => {

    _isReplay = false;
    _isSandBox = true;

    tryCatch(() => {
      const buf = wasm.allocate(buffer, wasm.ALLOC_NORMAL);
      wasm._load_map(buf, buffer.length);
      wasm._free(buf);
      _isReplay = false;
    });
  };

  openBW.loadReplayWithHeightMap = (buffer: Buffer, data: Uint8ClampedArray, width: number, height: number) => {

    _isReplay = true;
    _isSandBox = false;

    tryCatch(() => {
      const replayBuf = wasm.allocate(buffer, wasm.ALLOC_NORMAL);
      const heightMapBuf = wasm.allocate(data, wasm.ALLOC_NORMAL);
      wasm._load_replay_with_height_map(replayBuf, buffer.length, heightMapBuf, data.length, width, height);
      wasm._free(replayBuf);
      wasm._free(heightMapBuf);
    });
  }

  openBW.uploadHeightMap = (data: Uint8ClampedArray, width: number, height: number) => {
    tryCatch(() => {
      const heightMapBuf = wasm.allocate(data, wasm.ALLOC_NORMAL);
      wasm._upload_height_map(heightMapBuf, data.length, width, height);
      wasm._free(heightMapBuf);
    });
  }

  openBW.tryCatch = tryCatch;

  openBW.start = async (readFile: ReadFile) => {
    if (openBW.running) return;

    const files = new OpenBWFileList(wasm, callbacks);
    await files.loadBuffers(readFile);
    tryCatch(() => wasm.callMain());
    openBW.running = true;
  }

  openBW.getLastError = () => {
    return wasm._counts(0);
  }

  openBW.getLastErrorMessage = () => {
    switch (openBW.getLastError()) {
      case 60:
        return "Terrain displaces unit";
      case 61:
        return "Cannot create more units";
      case 62:
        return "Unable to create unit";
    }
    return null;
  }



  return openBW;
}

const openBws: Record<number, OpenBW> = {};

const getOpenBW = async (instance = 0) => {
  if (openBws[instance]) return openBws[instance];

  const openBW = await createOpenBW();

  openBws[instance] = openBW;
  return openBW;
}

export { getOpenBW };
