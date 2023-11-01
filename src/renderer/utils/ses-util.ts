import * as THREE from "three";
import * as postprocessing from "postprocessing";
import CameraControls from "camera-controls";
import * as enums from "common/enums";
import { Janitor } from "three-janitor";
import { mix } from "./object-utils";

export const createCompartment = ( userEnv: object = {} ) => {
    const userModules = {
        THREE,
        postprocessing,
        Janitor,
        enums,
        CameraControls,
        context: undefined,
    };

    mix( globalThis, userModules, userEnv );
    return {
        globalThis,
    };
};