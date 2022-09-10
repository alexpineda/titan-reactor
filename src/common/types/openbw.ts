import { ReadFile } from "common/types";
import type OpenBWFileList from "../../renderer/openbw/openbw-filelist";
import { SoundStruct } from "./structs";

export interface OpenBWWasm {
    _reset: () => void;
    _load_replay: (buffer: number, length: number) => void;
    _load_map: (buffer: number, length: number) => void;
    _upload_height_map: (buffer: number, length: number, width: number, height: number) => void;
    _load_replay_with_height_map: (replayBuffer: number, replayLength: number, buffer: number, length: number, width: number, height: number) => void;
    _next_frame: () => number;
    _next_no_replay: () => number;
    _create_unit: (unitId: number, playerId: number, x: number, y: number) => number;
    _counts: (index: number) => number;
    _get_buffer: (index: number) => number;
    _replay_get_value: (index: number) => number;
    _replay_set_value: (index: number, value: number) => void;
    _get_fow_ptr: (visiblity: number, instant: boolean) => number;
    get_util_funcs: () => ({
        get_sounds: () => SoundStruct[],
        dump_unit: (unitAddr: number) => {
            id: number;
            resourceAmount?: number;
            remainingTrainTime?: number;
            upgrade?: {
                id: number;
                level: number;
                time: number;
            };
            research?: {
                id: number;
                time: number;
            };
            loaded?: number[];
            buildQueue?: number[];
        },
        kill_unit: (unitId: number) => number;
        remove_unit: (unitId: number) => number;
        issue_command: (unitId: number, command: number, targetId: number, x: number, y: number, extra: number) => boolean;

    });
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

export interface OpenBW extends OpenBWWasm {
    running: boolean;
    files: OpenBWFileList;

    callbacks: {
        beforeFrame: () => void;
        afterFrame: () => void;
    };

    unitGenerationSize: number;

    isSandboxMode: () => boolean;
    setSandboxMode: (mode: boolean) => void;

    getFowSize: () => number;
    getFowPtr: (visibility: number, instant: boolean) => number;

    getTilesPtr: () => number;
    getTilesSize: () => number;

    getSoundObjects: () => SoundStruct[];

    getLastError: () => number;
    getLastErrorMessage: () => string | null;


    getSpritesOnTileLineSize: () => number;
    getSpritesOnTileLineAddress: () => number;

    getPlayersAddress: () => number;

    getUnitsAddr: () => number;

    getBulletsAddress: () => number,
    getBulletsDeletedCount: () => number,
    getBulletsDeletedAddress: () => number,

    getSoundsAddress: () => number,
    getSoundsCount: () => number,

    setGameSpeed: (speed: number) => void;
    getGameSpeed: () => number;

    setCurrentFrame: (frame: number) => void;
    getCurrentFrame: () => number;

    getIScriptProgramDataSize: () => number;
    getIScriptProgramDataAddress: () => number;

    isPaused: () => boolean;
    setPaused: (paused: boolean) => void;

    isReplay: () => boolean;
    nextFrame: () => number;
    nextFrameNoAdvance: () => number;
    tryCatch: (callback: () => void) => void;
    loadReplay: (buffer: Buffer) => void;
    loadMap: (buffer: Buffer) => void;
    start: (readFile: ReadFile) => Promise<void>;

    uploadHeightMap: (data: Uint8ClampedArray, width: number, height: number) => void;
    loadReplayWithHeightMap: (replayBuffer: Buffer, data: Uint8ClampedArray, width: number, height: number) => void;

    setUnitLimits: (unitLimits: number) => void;

};