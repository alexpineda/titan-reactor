import { Controls } from "@utils/camera-utils";
import { MainMixer } from "../audio";
import { NativePlugin } from "../plugins/plugin-system-native";
import { Camera, PerspectiveCamera, Vector2, Vector3 } from "three";
import MinimapMouse from "./minimap-mouse";

export interface CameraModeInitialization {
    id: string;
    minimap?: boolean;
    pointerLock?: boolean;
    cameraShake?: boolean;
    unitScale?: number;
    camera: {

    };
}
export interface CameraModePlugin extends NativePlugin {
    minimap?: boolean;
    pip?: boolean;
    pointerLock?: boolean;
    boundByMap?: boolean;
    cameraShake?: boolean;
    unitScale?: number;
    soundMode: "classic" | "spatial";
    depthOfField?: boolean;
    dispose: () => void;

    onEnterCameraMode: (controls: Controls, prevData:any, minimapMouse: MinimapMouse, camera: PerspectiveCamera, mapWidth: number, mapHeight: number) => Promise<void>;
    
    onExitCameraMode?: () => void;

    onCameraMouseUpdate?: (delta: number, elapsed: number, scrollY: number, screenDrag: Vector2, lookAt: Vector2, clicked?: Vector3) => void;

    onCameraKeyboardUpdate?: (delta: number, elapsed: number, truck: Vector2) => void;

    onShouldHideUnit?: (unit: any) => boolean;

    onUpdateAudioMixerLocation: (delta: number, elapsed: number, audioMixer: MainMixer, camera: Camera, target: Vector3) => void;
}

