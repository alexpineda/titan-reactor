import { Float32BufferAttribute, MathUtils, Points, PointsMaterial, BufferGeometry, Vector3, Vector4, Texture } from "three";
import { createSpline } from "@utils/linear-spline";
import { createParticles, ParticleSystem, ParticleSystemOptions } from "@utils/particles";
import random from "random";

export const distantStars = () => {
    const vertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = MathUtils.randFloatSpread(5000);
        const y = MathUtils.randFloatSpread(5000);
        const z = MathUtils.randFloatSpread(5000);

        if (Math.abs(x) < 250 && Math.abs(z) < 250 && Math.abs(y) < 250) {
            continue;
        }

        vertices.push(x, y, z);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute(
        "position",
        new Float32BufferAttribute(vertices, 3)
    );
    const material = new PointsMaterial({ color: 0x888888, sizeAttenuation: false, size: 1.5 });
    material.depthWrite = false;

    return new Points(geometry, material);
}

export const createStarField = () => {
    let stars: ParticleSystem;

    return {
        size: 0.01,
        load() {
            stars = createParticles({
                count: 1,
                sizeAttenuation: false,
                size: _ => this.size,
                alpha: createSpline(
                    MathUtils.lerp,
                    [0, 0.1, 0.2, 0.3, 1],
                    [0, 1, 1, 0, 0],
                ),
                coordScale: 1,
                sortParticles: false,
                particleTemplate: (opts: ParticleSystemOptions) => {
                    const x = MathUtils.randFloatSpread(20) * opts.coordScale;
                    const y = MathUtils.randFloatSpread(20) * opts.coordScale;
                    const z = MathUtils.randFloatSpread(100) * opts.coordScale;

                    const position = new Vector3(x, y, z);

                    const life = 1;
                    const size = 1;

                    return {
                        position,
                        size,
                        currentSize: size,
                        color: new Vector4(1, 0.6, 0.4, MathUtils.randFloat(0.5, 1)),
                        life,
                        maxLife: life,
                        angle: 0,
                        velocity: new Vector3(0, 0, -100000 * opts.coordScale),
                    };
                },
            });
        },
        get opts() {
            return stars.opts;
        },
        update(azimuth: number, ...args: Parameters<ParticleSystem["update"]>) {
            this.size = (MathUtils.pingpong(azimuth, Math.PI / 2) / (Math.PI / 2)) * 0.01
            stars.update(...args);
        },
        get object() {
            return stars.object;
        }
    }
}


export const createBattleLights = () => {
    let stars: ParticleSystem;
    const dist = random.normal(0, 1);

    return {
        load(tex: Texture) {
            stars = createParticles({
                count: 5,
                sizeAttenuation: true,
                size: createSpline(
                    MathUtils.lerp,
                    [0, .15, .33, .45, .66, .8, 1],
                    [0, 1, 0, 1, 0, 1, 0],
                    2
                ),
                alpha: createSpline(
                    MathUtils.lerp,
                    [0, .15, .33, .45, .66, .8, 1],
                    [0, 1, 0, 1, 0, 1, 0]
                ),
                spriteMap: {
                    tex,
                    width: 8,
                    height: 8,
                    frameCount: 64
                },
                coordScale: 5,
                sortParticles: false,
                particleTemplate: (opts: ParticleSystemOptions) => {
                    const x = MathUtils.randFloatSpread(10) * opts.coordScale * dist();
                    const y = MathUtils.randFloatSpread(10) * opts.coordScale * dist();;
                    const z = MathUtils.randFloatSpread(10) * opts.coordScale * dist();;

                    const position = new Vector3(x, y, z);

                    const life = MathUtils.randInt(1, 10);
                    const s = MathUtils.randFloat(0.1, 1);
                    const size = Math.pow(s, 5);

                    return {
                        position,
                        size,
                        currentSize: size,
                        color: new Vector4(1, MathUtils.lerp(0.6, 1, size / 2), MathUtils.lerp(0.4, 1, size / 2), MathUtils.randFloat(0.5, 1)),
                        life,
                        maxLife: life,
                        angle: 0,
                        velocity: new Vector3(0, 0, 0),
                        frame: 0,
                        maxFrame: 64,
                    };
                },
            });
            stars.object.position.set(-130, -130, 200);
        },
        get opts() {
            return stars.opts;
        },
        update(...args: Parameters<ParticleSystem["update"]>) {
            stars.update(...args);
        },
        get object() {
            return stars.object;
        }
    }
}