import type CameraControls from "camera-controls";
import type CameraShake from "../camera/camera-shake";
import type { CameraKeys } from "./camera-keys";
import type { CameraMouse } from "./camera-mouse";

export enum CameraMode {
    Default,
    Battle,
    Overview,
    Split,
    FPS
}

export enum RegularCameraMode {
    Default,
    ShowDeadUnits
}

export type Controls = {
    cameraMode: CameraMode;
    standard: CameraControls;
    mouse: CameraMouse;
    keys: CameraKeys;
    cameraShake: CameraShake;
    dispose: () => void;
}