import type { TerrainInfo } from "../common/types";
import type { CommandsStream, Replay } from "downgrade-replay";
import type { Scene } from "./render/Scene";
import type { MainMixer, Music, SoundChannels } from "./audio";
import type OpenBwWasmReader from "./integration/openbw-wasm/openbw-reader";
import type Janitor from "./utils/janitor";
import { strict as assert } from "assert";
import type Assets from "./assets/assets";
import type Chk from "bw-chk";

export interface World {
    readonly chk: Chk;
    readonly terrain: TerrainInfo;
    readonly scene: Scene;
    readonly assets: Assets;
    // readonly openBw: OpenBWWasmAPI;
    readonly janitor: Janitor;
}

export interface ReplayWorld extends World {
    readonly replay: Replay;
    // readonly fogOfWar: FogOfWar;
    // readonly creep: Creep;
    readonly audioMixer: MainMixer;
    readonly soundChannels: SoundChannels;
    readonly music: Music;
    readonly gameStateReader: OpenBwWasmReader;
    // readonly gameStatePosition: number;
    readonly commandsStream: CommandsStream;
}

let _world: any;
export function setWorld<T extends World>(world: T) {
    _world = world;
    return world;
}
export function getWorld<T extends World>(): T {
    assert(_world)
    return _world;
}