import { loadGlb } from "@image/formats";
import { createSpline } from "@utils/linear-spline";
import { createParticles, ParticleSystemOptions } from "@utils/particles";
import { upgradeStandardMaterial } from "@utils/material-utils";
import { ParticleSystem } from "@utils/particles";
import { Camera, Group, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, PointLight, Texture, Vector3, Vector4 } from "three";
import { playWraithComms } from "./wraith-noise";

export type Wraith = Object3D & {
    init: () => void;
    update: (delta: number, elapsed: number) => void;
    dispose: () => void;
};

const wraithRed = 0xff0000;
const wraithBlue = 0x0033ff;

let _lastWraithSoundPlayed = true;
let _wraithPlaySpot = Math.PI / 2 + (Math.PI / 3) * Math.random();

const createWraith = (og: Object3D, originalPosition: Vector3, particles: ParticleSystem, i: number) => {
    let _swerveRate = 1000;
    let _nextSwerveRate = 1000;
    let _nextSwerveAngle = Math.PI / 3.5;

    let [wx, wy, wz] = [
        MathUtils.randInt(1000, 4000),
        MathUtils.randInt(1000, 4000),
        MathUtils.randInt(1000, 4000),
    ];

    const wraith = og.clone(true) as Wraith;

    const burnerLight = new PointLight(0xff5500, 20, 1.5, 10);
    burnerLight.position.set(0, 0.1, -0.3);
    wraith.add(burnerLight);

    const rightBlinker = new PointLight(i ? wraithRed : wraithBlue, 2, 1, 7);
    rightBlinker.position.set(-0.2, -0.2, -0.05);
    wraith.add(rightBlinker);

    const leftBlinker = new PointLight(i ? wraithRed : wraithBlue, 2, 1, 7);
    leftBlinker.position.set(0.2, -0.2, -0.05);
    wraith.add(leftBlinker);

    let _a = 0;
    let _b = 0;
    let _interval0: NodeJS.Timeout;
    let _interval1: NodeJS.Timeout;

    particles.object.position.set(0, 0, -0.2);
    wraith.add(particles.object.clone());

    return Object.assign(wraith, {
        init() {
            this.position.copy(originalPosition);

            _a = 0;
            _interval0 = setInterval(() => {
                rightBlinker.intensity = _a % 3 === 0 ? 1 : 0;
                _a++;
            }, 1000 + Math.random() * 1000);

            _b = 0;
            _interval1 = setInterval(() => {
                leftBlinker.intensity = _b % 4 === 0 ? 1 : 0;
                _b++;
            }, 1000 + Math.random() * 1000);
        },
        update(delta: number, elapsed: number) {
            _swerveRate = MathUtils.damp(_swerveRate, _nextSwerveRate, 0.001, delta);
            if (Math.abs(_swerveRate - _nextSwerveRate) < 1) {
                _nextSwerveRate = Math.random() * 5000 + 10000;
            }
            this.rotation.z = MathUtils.damp(
                this.rotation.z,
                Math.sin(elapsed / _swerveRate) * _nextSwerveAngle,
                0.001,
                delta
            );
            this.position.x = originalPosition.x + Math.sin(elapsed / wx) * 0.3;
            this.position.y = originalPosition.y + Math.sin(elapsed / wy) * 0.3;
            this.position.z = originalPosition.z + Math.sin(elapsed / wz) * 0.3;
        },
        dispose() {
            clearInterval(_interval0);
            clearInterval(_interval1);
        },
    } as Wraith);
};


export const createWraiths = () => {

    const wraiths: Wraith[] = [];
    const wraithGroup = new Group;
    let burners: ParticleSystem;



    return {
        async load(envmap: Texture, particle: Texture) {

            const { model } = await loadGlb(`${__static}/wraith.glb`, envmap);

            model.traverse((o: Object3D) => {
                if (o instanceof Mesh) {
                    o.material = upgradeStandardMaterial(o.material as MeshStandardMaterial);
                    (o.material as MeshPhysicalMaterial).emissiveIntensity = 0;
                    (o.material as MeshPhysicalMaterial).transmission = 0.9;
                    (o.material as MeshPhysicalMaterial).opacity = 0;
                    (o.material as MeshPhysicalMaterial).thickness = 0.5;
                }
            });

            burners = createParticles({
                count: 5000,
                sizeAttenuation: true,
                size: createSpline(
                    MathUtils.lerp,
                    [0, .07, .2, 0.5, 1],
                    [0, 1.5, .1, .1, 0],
                    0.03
                ),
                sortParticles: false,
                coordScale: 0.04,
                alpha: createSpline(
                    MathUtils.lerp,
                    [0, .1, 0.3, 1],
                    [0, 1, 0.1, 0]
                ),
                spriteMap: {
                    tex: particle,
                    width: 8,
                    height: 8,
                    frameCount: 64
                },
                particleTemplate: (opts: ParticleSystemOptions) => {
                    const x = MathUtils.randFloatSpread(0.5) * opts.coordScale;
                    const y = MathUtils.randFloatSpread(0.5) * opts.coordScale
                    const z = MathUtils.randFloatSpread(0.5) * opts.coordScale;

                    const position = new Vector3(x, y, z);

                    const life = MathUtils.randFloat(0.05, 0.6);
                    const size = MathUtils.randFloat(0.8, 1) * 4.0;

                    return {
                        position,
                        size,
                        currentSize: size,
                        color: new Vector4(1, 0.5, 0.1, MathUtils.randFloat(0.5, 1)),
                        life,
                        maxLife: life,
                        angle: 0,
                        velocity: new Vector3(0, 0, -35000 * opts.coordScale),
                        frame: 0,
                        maxFrame: 64
                    };
                }
            });

            const w1 = createWraith(model, new Vector3(0, 0, 0), burners, 0);
            const w2 = createWraith(model, new Vector3(4, 0.2, 0), burners, 1);
            const w3 = createWraith(model, new Vector3(-2, -0.1, -1.2), burners, 2);

            wraiths.push(w1, w2, w3);
            wraithGroup.add(w1, w2, w3);

        },
        init() {
            for (const wraith of wraiths) {
                wraith.init();
            }
        },
        update(delta: number, elapsed: number, camera: Camera, normalizedAzimuthAngle: number, rear: number) {
            for (const wraith of wraiths) {
                wraith.update(delta, elapsed);
            }
            burners.update(camera, delta);

            if (normalizedAzimuthAngle > _wraithPlaySpot) {
                if (!_lastWraithSoundPlayed) {
                    playWraithComms(rear);
                }
                _lastWraithSoundPlayed = true;
            } else {
                _wraithPlaySpot = Math.PI / 2 + (Math.PI / 3) * Math.random();
                _lastWraithSoundPlayed = false;
            }

        },
        dispose() {
            for (const wraith of wraiths) {
                wraith.dispose();
            }
        },
        get object() {
            return wraithGroup;
        },
        get particles() {
            return burners;
        }
    }
}