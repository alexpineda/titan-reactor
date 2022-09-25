import "ses";
import * as THREE from "three";
import * as postprocessing from "postprocessing"
import cameraControls from "camera-controls"
import * as enums from "common/enums";
import { Janitor } from "three-janitor";
import { mix } from "./object-utils";

// declare global {
//     interface Window {
//         harden<T>(obj: T): T;
//         lockdown(): void;
//         Compartment: any;
//     }
// }

export const createCompartment = (env: object = {}) => {

    const modules = { THREE, postprocessing, Janitor, enums, cameraControls }

    const compartment = new Compartment(mix(
        env,
        { console: harden(console) },
        modules,
        { Image: harden(Image) },
    ));

    compartment.globalThis.Math = Math;

    return compartment;

}

export const lockdown_ = () => {

    if (process.env.NODE_ENV === "development") {
        window.harden = (x) => x;

        // @ts-ignore
        window.Compartment = function Compartment(env: object) {
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
        lockdown({
            localeTaming: "unsafe",
            consoleTaming: "unsafe",
            errorTaming: "unsafe",
            errorTrapping: "none",
            mathTaming: "unsafe",
        });
    }
}