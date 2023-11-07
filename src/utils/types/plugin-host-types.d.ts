import type { Janitor } from "three-janitor";
import type * as PostProcessing from "postprocessing";
import type CameraControls from "camera-controls";

declare global {
    const enums: any;
    const cameraControls: CameraControls;
    const THREE: typeof THREE;
    const Janitor: Janitor;
    const postprocessing: typeof PostProcessing;
}

export {};
