type SpriteModelImageEffectEmissiveFrames = {
    type: "emissive:frames";
    frames: number[];
}

type SpriteModelImageEffectEmissiveOverlay = {
    type: "emissive:overlay-visible";
}

type SpriteModelImageEffectHideSprite = {
    type: "hide-sprite";
}

type SpriteModelImageEffectFlatOnGround = {
    type: "flat-on-ground";
}

type SpriteModelImageEffectRemapFrame = {
    type: "remap-frames";
    remap: (frame: number) => number;
}

type SpriteModelImageEffectFixedFrame = {
    type: "fixed-frame";
    frame: number
}

type SpriteModelImageEffectScale = {
    type: "scale";
    scale: number;
}

type SpriteModelImageEffectRotate = {
    type: "rotate";
    rotation: number;
}

type SpriteModelImageEffects = SpriteModelImageEffectEmissiveFrames | SpriteModelImageEffectEmissiveOverlay | SpriteModelImageEffectHideSprite | SpriteModelImageEffectFlatOnGround | SpriteModelImageEffectRemapFrame | SpriteModelImageEffectScale | SpriteModelImageEffectRotate | SpriteModelImageEffectFixedFrame;

type SpriteModelEffects<T> = {
    images: {
        [key: number]: T[];
    }
}

const remnants = [7, 16, 20, 24, 32, 37, 53, 57, 89, 124, 230, 241, 920, 946].map(id => ({ [id]: [{ type: "flat-on-ground" }] })).reduce((a, b) => ({ ...a, ...b }), {});

export const spriteModelEffects: SpriteModelEffects<SpriteModelImageEffects> = {
    images: {

        // egg
        21: [
            {
                type: "scale",
                scale: 0.65
            }
        ],

        // egg
        29: [
            {
                type: "scale",
                scale: 0.8
            }
        ],

        // zergling
        54: [
            {
                type: "scale",
                scale: 1.2
            }
        ],

        // infested/command center
        63: [
            {
                type: "scale",
                scale: 0.93
            }
        ],

        // arbiter engines
        132: [
            {
                type: "hide-sprite"
            }
        ],


        // battle cruiser engines
        220: [
            {
                type: "hide-sprite"
            }
        ],

        // dropship engines
        225: [
            {
                type: "hide-sprite"
            }
        ],

        // firebat
        226: [
            {
                type: "scale",
                scale: 0.9
            }
        ],

        // goliath base
        234: [
            {
                type: "scale",
                scale: 1.25
            }
        ],

        // goliath turret
        235: [
            {
                type: "emissive:frames",
                frames: [0]
            },
            {
                type: "scale",
                scale: 1.25
            }
        ],

        // marine + marine death (242)
        239: [
            {
                type: "emissive:frames",
                frames: [3]
            },
            {
                type: "scale",
                scale: 0.9
            }
        ],

        // scv
        247: [
            {
                type: "scale",
                scale: 0.95
            }
        ],

        // svg engines
        249: [
            {
                type: "fixed-frame",
                frame: 3
            }
        ],

        // tank base
        250: [
            {
                type: "scale",
                scale: 0.75
            }
        ],

        // tank turret
        251: [
            {
                // regular tank turret uses siege tank turret frame 1
                type: "remap-frames",
                //TODO: change to frameset system
                remap: (frame: number) => frame + 17
            },
            {
                type: "scale",
                scale: 0.75
            }
        ],

        // siege tank base
        253: [
            {
                type: "scale",
                scale: 0.75
            }
        ],

        // siege tank turret
        254: [
            {
                type: "scale",
                scale: 0.75
            },
            {
                type: "rotate",
                rotation: Math.PI,
            }
        ],

        // vulture
        256: [
            {
                type: "scale",
                scale: 0.75
            }
        ],

        // command center overlay
        276: [
            {
                // set emissive to main image (eg. 275) if this overlay is visible
                type: "emissive:overlay-visible",
            },
            {
                // never draw this image
                type: "hide-sprite"
            }
        ],

        // mineral type 3
        349: [
            {
                type: "scale",
                scale: 1.1
            }
        ],

        // lurker egg
        914: [
            {
                type: "scale",
                scale: 0.65
            }
        ],

        // valkryie engines
        941: [
            {
                type: "hide-sprite"
            }
        ],
        ...remnants
    }
}


// re-use gltf files
export const modelSetFileRefIds = new Map([

    // siege turret -> siege base
    [251, 254],

    // lurker egg -> egg,
    [914, 21]

]);