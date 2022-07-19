import { NativePlugin } from "../plugins/plugin-system-native";
import { Vector2, Vector3 } from "three";
import CameraControls from "camera-controls";
import ProjectedCameraView from "renderer/camera/projected-camera-view";

export interface CameraModePlugin extends NativePlugin {
    isActiveCameraMode: boolean;
    minimap?: boolean;
    pointerLock?: boolean;
    unitSelection?: boolean;
    cameraShake?: boolean;
    rotateSprites?: boolean;
    unitScale?: number;
    maxSoundDistance?: number;
    soundMode: "classic" | "spatial";
    background?: "tiles" | "space";
    fogOfWar: number;
    orbit?: CameraControls;

    dispose: () => void;

    onEnterCameraMode: (prevData: any) => Promise<void>;

    onExitCameraMode?: (target: Vector3, position: Vector3) => void;

    onSetComposerPasses: (renderPass: any, fogOfWarEffect: any) => {
        passes?: any[];
        effects?: any[];
    };

    onCameraMouseUpdate?: (delta: number, elapsed: number, scrollY: number, screenDrag: Vector2, lookAt: Vector2, mouse: Vector3, clientX: number, clientY: number, clicked?: Vector3) => void;

    onCameraKeyboardUpdate?: (delta: number, elapsed: number, truck: Vector2) => void;

    onShouldHideUnit?: (unit: any) => boolean;

    onUpdateAudioMixerLocation: (delta: number, elapsed: number, target: Vector3, position: Vector3) => Vector3;

    onDrawMinimap?: (ctx: CanvasRenderingContext2D, view: ProjectedCameraView, target: Vector3, position: Vector3) => void;

    onMinimapDragUpdate?: (pos: Vector3, isDragStart: boolean, isDragging: boolean, mouseButton?: number) => void;

}

