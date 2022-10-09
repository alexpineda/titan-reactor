import { Unit } from "@core/unit";
import { MouseTriggerDTO } from "@macros/mouse-trigger";
import GameSurface from "@render/game-surface";
import { DeepPartial, SessionSettingsData } from "common/types";
import { ImageBase } from "..";

export const worldEventsList: (keyof WorldEvents)[] = [

    "unit-created",
    "unit-killed",
    "unit-destroyed",
    "followed-units-changed",
    "selected-units-changed",
    "completed-upgrade",
    "completed-tech",
    "frame-reset",
    "minimap-enter",
    "minimap-leave",
    "image-destroyed",
    "image-updated",
    "image-created",
    "units-cleared",
    "settings-changed",
    "plugin-configuration-changed",
    "resize",
    "box-selection-start",
    "box-selection-move",
    "box-selection-end",
    "box-selection-enabled",

    "scene-controller-exit",
    "scene-controller-enter",

    "world-start",
    "world-end",
    "dispose",

    "mouse-click",

];

// do not put anything performance sensitive here as these are synchronous.
// image created/destroyed is already pushing it
export interface WorldEvents {

    "unit-created": Unit;
    "unit-killed": Unit;
    "unit-destroyed": Unit;
    "followed-units-changed": Unit[];
    "selected-units-changed": Unit[];
    "completed-upgrade": { owner: number, typeId: number, level: number };
    "completed-tech": { owner: number, typeId: number };
    "frame-reset": void;
    "minimap-enter": void;
    "minimap-leave": void;

    "image-destroyed": ImageBase;
    "image-updated": ImageBase;
    "image-created": ImageBase;
    "units-cleared": void;

    "settings-changed": { settings: SessionSettingsData, rhs: DeepPartial<SessionSettingsData> };
    "plugin-configuration-changed": { settings: SessionSettingsData, rhs: DeepPartial<SessionSettingsData> };
    "resize": GameSurface;

    "box-selection-start": void;
    "box-selection-move": void;
    "box-selection-end": Unit[];
    "box-selection-enabled": boolean;

    "scene-controller-exit": string;
    "scene-controller-enter": string;

    "world-start": void;
    "world-end": void;

    "dispose": void;

    "mouse-click": MouseTriggerDTO;

}