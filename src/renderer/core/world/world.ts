import CommandsStream from "@process-replay/commands/commands-stream";
import { Janitor } from "three-janitor";
import { TypeEmitter } from "@utils/type-emitter";
import Chk from "bw-chk";
import { OpenBW } from "@openbw/openbw";

import { BasePlayer, FogOfWar, FogOfWarEffect } from "..";
import { SettingsSessionStore } from "./settings-session-store";
import { WorldEvents } from "./world-events";

export interface World {
    map: Chk;
    players: BasePlayer[];
    commands: CommandsStream;
    fogOfWar: FogOfWar;
    fogOfWarEffect: FogOfWarEffect;
    openBW: OpenBW;
    settings: SettingsSessionStore;
    janitor: Janitor;
    events: TypeEmitter<WorldEvents>;
    reset(): void;
}
