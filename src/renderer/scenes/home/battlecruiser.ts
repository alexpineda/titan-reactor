import { loadGlb } from "@image/formats";
import { createSpline } from "@utils/linear-spline";
import { createParticles, ParticleSystem, ParticleSystemOptions } from "@utils/particles";
import { upgradeStandardMaterial } from "@utils/material-utils";
import { Camera, MathUtils, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Object3D, Texture, Vector3, Vector4 } from "three";

const BC_START_POS = new Vector3(-900, -250, -500);
const BC_END_POS = new Vector3(-320, -560, -500);
const BC_START_ROT = new Vector3(-Math.PI / 8, Math.PI, Math.PI / 5);
const BC_END_ROT = new Vector3(-Math.PI / 16, Math.PI, Math.PI / 8);

export const createBattleCruiser = () => {

    let battleCruiser: Object3D;
    let burners: ParticleSystem;

    return {
        async load(envmap: Texture, particle: Texture) {
            const { model } = await loadGlb(
                `${__static}/battlecruiser.glb`,
                envmap
            );
            battleCruiser = model;
            model.traverse((o: Object3D) => {
                if (o instanceof Mesh) {
                    o.material = upgradeStandardMaterial(o.material as MeshStandardMaterial);
                    (o.material as MeshPhysicalMaterial).emissiveIntensity = 0;
                    (o.material as MeshPhysicalMaterial).transmission = 0.9;
                    (o.material as MeshPhysicalMaterial).opacity = 0;
                    (o.material as MeshPhysicalMaterial).thickness = 0.5;
                }
            });

            model.scale.setScalar(50);

            model.rotation.x = BC_START_ROT.x;
            model.rotation.y = BC_START_ROT.y;
            model.rotation.z = BC_START_ROT.z;
            model.position.copy(BC_START_POS);

            burners = createParticles({
                count: 50,
                sortParticles: false,
                size: createSpline(
                    MathUtils.lerp,
                    [0, .15, .33, .45, .66, .8, 1],
                    [0, 1, 0, 1, 0, 1, 0],
                    5
                ),
                alpha: createSpline(
                    MathUtils.lerp,
                    [0, .15, .33, .45, .66, .8, 1],
                    [0, 1, 0, 1, 0, 1, 0],
                    0.2
                ),
                coordScale: .5,
                tex: particle,
                particleTemplate: (opts: ParticleSystemOptions) => {
                    const x = MathUtils.randFloatSpread(0.5) * opts.coordScale;
                    const y = MathUtils.randFloatSpread(0.5) * opts.coordScale
                    const z = MathUtils.randFloatSpread(0.5) * opts.coordScale;

                    const position = new Vector3(x, y, z);

                    const life = 0.5;
                    const size = 4;

                    return {
                        position,
                        size,
                        currentSize: size,
                        color: new Vector4(0.3, 0.3, 0.3, MathUtils.randFloat(0.5, 1)),
                        life,
                        maxLife: life,
                        angle: 0,
                        velocity: new Vector3(0, 0, -5000 * opts.coordScale),
                        frame: 0,
                        maxFrame: 64
                    };
                }
            });
            burners.points.rotation.y = Math.PI / 2;
            burners.points.position.set(0.6, 2.25, 1.5);
            model.add(burners.points);

            // const ball = new Mesh(new SphereGeometry(0.5, 10, 10), new ShaderMaterial());
            // ball.position.set(0, 2.25, 1.8);
            // ball.scale.set(1, 0.7, 0.5);
            // ball.material.transparent = true;
            // ball.material.needsUpdate = true;
            // window._ball = ball;
            // model.add(ball);
            return model;
        },
        update(delta: number, elapsed: number, cameraRotateSpeed: number, camera: Camera) {
            const bcv = Math.sin(elapsed / (cameraRotateSpeed * 8));
            battleCruiser.rotation.z = MathUtils.lerp(BC_START_ROT.z, BC_END_ROT.z, bcv);
            battleCruiser.rotation.x = MathUtils.lerp(BC_START_ROT.x, BC_END_ROT.x, bcv);
            battleCruiser.position.lerpVectors(BC_START_POS, BC_END_POS, bcv);
            burners.update(camera, delta);
        },
        get: () => battleCruiser,
        getParticles: () => burners
    }

}