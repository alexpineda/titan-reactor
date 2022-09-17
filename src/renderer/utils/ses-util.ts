import "ses";
import * as THREE from "three";
import * as postprocessing from "postprocessing"
import cameraControls from "camera-controls"
import * as enums from "common/enums";
import Janitor from "@utils/janitor";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import { mix } from "./object-utils";
const STDLIB = {
    CSS2DObject
}

// declare global {
//     interface Window {
//         harden<T>(obj: T): T;
//         lockdown(): void;
//         Compartment: any;
//     }
// }

export const createCompartment = (env: {} = {}) => {

    const modules = { THREE, STDLIB, postprocessing, Janitor, enums, cameraControls }

    const compartment = new Compartment(mix(
        env,
        { console: window.harden(console) },
        modules,
        { Image: window.harden(Image) },
    ));
    compartment.globalThis.Math = Math;
    return compartment;

}

export const lockdown_ = () => {

    if (process.env.NODE_ENV === "development") {
        window.harden = (x) => x;

        // @ts-ignore
        window.Compartment = function Compartment(env: {}) {
            // const windowCopy = {...window};
            // delete windowCopy.require;
            const globalThis: Record<string, any> = {};
            globalThis["Function"] = (code: string) => {
                const vars = `const {${Object.keys(env).join(",")}} = arguments[0];\n`;
                const fn = Function(vars + code);

                return fn.bind(globalThis, env);
            };
            return {
                evaluate(code: string) {
                    const vars = `const {${Object.keys(env).join(
                        ","
                    )}} = env; this=globalThis;\n`;
                    eval(vars + code);
                },
                globalThis,
            };
        };
    } else {
        // lockdown({
        //     localeTaming: "unsafe",
        //     consoleTaming: "unsafe",
        //     errorTaming: "unsafe",
        //     errorTrapping: "none",
        //     mathTaming: "unsafe",
        // });
    }
}