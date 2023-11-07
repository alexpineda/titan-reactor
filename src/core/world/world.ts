import { Janitor } from "three-janitor";
import { TypeEmitter } from "@utils/type-emitter";
import Chk from "bw-chk";
import { OpenBW } from "@openbw/openbw";

import { FogOfWar, FogOfWarEffect, Players } from "..";
import { SettingsSessionStore } from "./settings-session-store";
import { WorldEvents } from "./world-events";
import type { CommandsStream } from "process-replay";

export interface World {
    map: Chk;
    players: Players;
    commands: CommandsStream;
    fogOfWar: FogOfWar;
    fogOfWarEffect: FogOfWarEffect;
    openBW: OpenBW;
    settings: SettingsSessionStore;
    janitor: Janitor;
    events: TypeEmitter<WorldEvents>;
    reset(): void;
}
