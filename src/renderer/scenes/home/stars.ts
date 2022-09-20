import { Float32BufferAttribute, MathUtils, Points, PointsMaterial, BufferGeometry, Vector3, Texture, PerspectiveCamera, Color } from "three";
import { createSpline } from "@utils/linear-spline";
import { createParticles, defaultUpdate, ParticleSystem } from "@utils/particles";
import random from "random";
import { quadrants } from "@utils/quadrants";

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

    const stars = new Points(geometry, material);
    stars.name = "distant-stars";

    return stars;
}

export const createStarField = () => {
    let stars: ParticleSystem;

    const quadrant = quadrants(3, -Math.PI / 2);
    const blast = quadrants(80);

    return {
        scale: 0.01,
        alpha: 1,
        load() {
            stars = createParticles({
                id: "stars",
                count: 10,
                sizeAttenuation: false,
                sortParticles: false,
                update: defaultUpdate({
                    size: 1,
                    alpha: createSpline(
                        MathUtils.lerp,
                        [0, 0.1, 0.2, 0.3, 1],
                        [0, 1, 1, 0, 0],
                        this.alpha
                    ),
                    velocity: new Vector3(0, 0, -200000),
                }),
                emit: () => {
                    const x = MathUtils.randFloatSpread(5);
                    const y = MathUtils.randFloatSpread(5);
                    const z = 100;

                    const position = new Vector3(x, y, z);

                    return {
                        position,
                        scale: this.scale,
                        color: new Color(1, 0.6, 0.4),
                        maxLife: 1,
                    };
                },
            });
        },
        get opts() {
            return stars.opts;
        },
        update(azimuth: number, ...args: Parameters<ParticleSystem["update"]>) {
            if (quadrant.entered(0, azimuth)) {
                this.alpha = 0.5;
            } else if (quadrant.entered(1, azimuth)) {
                this.alpha = 1;
            }
            if (blast.entered(39, azimuth)) {
                stars.opts.count = 20;
            }
            if (blast.entered(41, azimuth)) {
                stars.opts.count = 1;
            }

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
                id: "battle-lights",
                count: 9,
                sizeAttenuation: true,
                update: defaultUpdate({
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
                    velocity: new Vector3(0, 0, 0),
                }),
                spriteMap: {
                    tex,
                    width: 8,
                    height: 8,
                    frameCount: 64,
                    loop: 1,
                },
                coordScale: 5,
                sortParticles: false,
                emit: () => {
                    const x = MathUtils.randFloatSpread(50) * dist();
                    const y = MathUtils.randFloatSpread(50) * dist();;
                    const z = MathUtils.randFloatSpread(50) * dist();;

                    const position = new Vector3(x, y, z);

                    const life = MathUtils.randInt(1, 10);
                    const s = MathUtils.randFloat(0.1, 1);
                    const scale = Math.pow(s, 5);

                    return {
                        position,
                        scale,
                        color: new Color(1, MathUtils.lerp(0.6, 1, scale / 2), MathUtils.lerp(0.4, 1, scale / 2)),
                        maxLife: life,
                    };
                },
            });
            stars.object.position.copy(this.battleStartPosition);
        },
        get opts() {
            return stars.opts;
        },
        battleStartPosition: new Vector3(-130, -100, 170),
        battleEndPosition: new Vector3(-130, -130, 200),
        startAngle: Math.PI / 3,
        endAngle: Math.PI,
        update(camera: PerspectiveCamera, delta: number, azimuth: number) {
            const r = MathUtils.smoothstep(azimuth, this.startAngle, this.endAngle);
            this.opts.count = Math.floor(MathUtils.pingpong(r * 24, 6)) + 3;
            stars.object.position.lerpVectors(this.battleStartPosition, this.battleEndPosition, r);
            stars.update(camera, delta);
        },
        get object() {
            return stars.object;
        }
    }
}