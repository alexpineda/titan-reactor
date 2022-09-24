import { Unit } from "@core/unit";
import { MouseTriggerDTO } from "@macros/mouse-trigger";
import CommandsStream from "@process-replay/commands/commands-stream";
import GameSurface from "@render/game-surface";
import { Janitor } from "three-janitor";
import { TypeEmitter } from "@utils/type-emitter";
import Chk from "bw-chk";
import { DeepPartial, OpenBW, SessionSettingsData } from "common/types";
import { BasePlayer, FogOfWar, FogOfWarEffect, ImageBase } from "..";
import { PluginsAndMacroSession } from "./create-plugins-and-macros-session";
import { SettingsSessionStore } from "./settings-session-store";

// do not put anything performance sensitive here as these are synchronous.
// image created/destroyed is already pushing it
export interface WorldEvents {
    "unit-created": Unit;
    "unit-killed": Unit;
    "unit-destroyed": Unit;
    "units-cleared": void;
    "image-destroyed": ImageBase;
    "image-created": ImageBase;
    "followed-units-changed": Unit[];
    "selected-units-changed": Unit[];
    "completed-upgrade": { owner: number, typeId: number, level: number };
    "completed-tech": { owner: number, typeId: number };
    "frame-reset": void;
    "settings-changed": { settings: SessionSettingsData, rhs: DeepPartial<SessionSettingsData> };
    "plugin-configuration-changed": { settings: SessionSettingsData, rhs: DeepPartial<SessionSettingsData> };
    "resize": GameSurface;
    "minimap-enter": void;
    "minimap-leave": void;
    "unit-selection-start": void;
    "unit-selection-move": void;
    "unit-selection-end": Unit[];
    "unit-selection-enabled": boolean;
    "scene-exit": string;
    "scene-enter": string;
    "dispose": void;

    "mouse-click": MouseTriggerDTO;

    //for plugins and macros
    "session-start": void;
    "session-end": void;
}

export type World = {
    map: Chk;
    players: BasePlayer[];
    commands: CommandsStream;
    fogOfWar: FogOfWar;
    fogOfWarEffect: FogOfWarEffect;
    openBW: OpenBW;
    plugins: PluginsAndMacroSession;
    settings: SettingsSessionStore;
    janitor: Janitor;
    events: TypeEmitter<WorldEvents>;
    reset(): void;
}