import * as THREE from "three";
import * as postprocessing from "postprocessing"
import cameraControls from "camera-controls"
import * as enums from "common/enums";
import Janitor from "@utils/janitor";
import { Layers } from "../render/layers";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { mix } from "./object-utils";
import "ses";
const STDLIB = {
    CSS2DObject
}

export const createCompartment = (env: {} = {}) => {

    const modules = { THREE, STDLIB, postprocessing, Janitor, Layers, enums, cameraControls }

    return new Compartment(mix(
        env,
        { console: harden(console) },
        Math,
        modules,
        { Image: harden(Image) },
    ));

}