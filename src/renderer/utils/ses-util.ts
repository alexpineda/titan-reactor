import "ses";
import * as THREE from "three";
import * as postprocessing from "postprocessing";
import cameraControls from "camera-controls";
import * as enums from "common/enums";
import { Janitor } from "three-janitor";
import { mix } from "./object-utils";

export const createCompartment = ( userEnv: object = {} ) => {
    const userModules = {
        THREE,
        postprocessing,
        Janitor,
        enums,
        cameraControls,
        context: undefined,
    };
    const systemModules = {
        console: harden( console ),
    };

    const compartment = new Compartment( mix( {}, userEnv, userModules, systemModules ) );

    compartment.globalThis.Math = Math;

    return compartment;
};

export const lockdown_ = () => {
    if ( process.env.NODE_ENV === "development" ) {
        window.harden = ( x ) => x;

        // @ts-expect-error
        window.Compartment = function Compartment( env: object ) {
            const globalThis: Record<string, any> = env;
            globalThis.Function = ( code: string ) => {
                const vars = `
                    const {${Object.keys( env ).join( "," )}} = this;
                    globalThis = this;
                `;
                // eslint-disable-next-line @typescript-eslint/no-implied-eval
                const fn = Function( vars + code );

                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return fn.bind( globalThis );
            };
            return {
                evaluate( code: string ) {
                    const vars = `const {${Object.keys( env ).join(
                        ","
                    )}} = env; this=globalThis;\n`;
                    eval( vars + code );
                },
                globalThis,
            };
        };
    } else {
        lockdown( {
            localeTaming: "unsafe",
            consoleTaming: "unsafe",
            errorTaming: "unsafe",
            errorTrapping: "none",
            mathTaming: "unsafe",
        } );
    }
};
