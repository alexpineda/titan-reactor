import { mixer } from "@audio/main-mixer";
import { renderComposer } from "@render";
import { loadGlb, Surface } from "@image";
import loadEnvironmentMap from "@image/environment/env-map";
import {
    BlendFunction,
    BloomEffect,
    ChromaticAberrationEffect,
    EffectPass,
    GlitchEffect,
    GodRaysEffect,
    KernelSize,
    RenderPass,
    SMAAEffect,
    ToneMappingEffect,
    VignetteEffect,
} from "postprocessing";
import {
    updatePostProcessingCamera,
} from "@utils/renderer-utils";

import {
    DirectionalLight,
    Euler,
    InstancedMesh,
    MathUtils,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    PointLight,
    Quaternion,
    Scene,
    SphereBufferGeometry,
    Vector2,
    Vector3,
} from "three";
import CameraControls from "camera-controls";
import * as THREE from "three";
import Janitor from "@utils/janitor";
import gameStore from "@stores/game-store";
import { Filter } from "@audio/filter";
import { upgradeStandardMaterial } from "@utils/material-utils";
import range from "common/utils/range";

CameraControls.install({ THREE: THREE });

const camera = new PerspectiveCamera(110, 1, 0.1, 100000);
const introSurface = new Surface();
const controls = new CameraControls(camera, introSurface.canvas);
controls.maxPolarAngle = Infinity;
controls.minPolarAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;
controls.minAzimuthAngle = -Infinity;

const CAMERA_ROTATE_SPEED = 10000;
let _cameraRotateSpeed = CAMERA_ROTATE_SPEED / 4;
let _destCameraSpeed = CAMERA_ROTATE_SPEED;

const chromaticAberrationEffect = new ChromaticAberrationEffect();
const glitchMax = new Vector2(0.05, 0.08);

const glitchEffect = new GlitchEffect({
    chromaticAberrationOffset: chromaticAberrationEffect.offset,
    columns: 0,
    delay: new Vector2(1.5, 3.5),
    strength: (new Vector2()).copy(glitchMax),
    duration: new Vector2(6, 10),
    blendFunction: BlendFunction.OVERLAY,
});

introSurface.canvas.style.position = "absolute";

let _lastElapsed = 0;

const BC_START_POS = new Vector3(-900, -250, -500)
const BC_END_POS = new Vector3(-320, -560, -500)
const BC_START_ROT = new Vector3(-Math.PI / 8, Math.PI, Math.PI / 5);
const BC_END_ROT = new Vector3(-Math.PI / 16, Math.PI, Math.PI / 8);

type Wraith = Object3D & { init: () => void, update: (delta: number, elapsed: number) => void, dispose: () => void };
const _wraiths: Wraith[] = [];
let _battleCruiser: Object3D;
let _asteroidInstances: InstancedMesh;
window.wraiths = _wraiths;

const createWraith = (og: Object3D, originalPosition: Vector3) => {
    let _swerveRate = 1000;
    let _nextSwerveRate = 1000;
    let _nextSwerveAngle = Math.PI / 3.5;

    let [wx, wy, wz] = [MathUtils.randInt(1000, 4000), MathUtils.randInt(1000, 4000), MathUtils.randInt(1000, 4000)];

    const wraith = og.clone(true) as Wraith;;

    const burnerLight = new PointLight(0xff0000, 5, 2, 10);
    burnerLight.position.set(0, 0.1, -0.4);
    wraith.add(burnerLight);

    const rightBlinker = new PointLight(0xe57600, 1, 1, 7);
    rightBlinker.position.set(-0.2, -0.2, -0.05);
    wraith.add(rightBlinker);

    const leftBlinker = new PointLight(0x00d6e5, 1, 1, 7);
    leftBlinker.position.set(0.2, -0.2, -0.05);
    wraith.add(leftBlinker);

    let _a = 0;
    let _b = 0;
    let _interval0: NodeJS.Timeout;
    let _interval1: NodeJS.Timeout;


    return Object.assign(wraith, {
        init() {
            this.position.copy(originalPosition);

            _a = 0;
            _interval0 = setInterval(() => {
                rightBlinker.intensity = _a % 6 === 0 ? 1 : 0;
                _a++;
            }, 1000 + Math.random() * 1000);

            _b = 0;
            _interval1 = setInterval(() => {
                leftBlinker.intensity = _b % 7 === 0 ? 1 : 0;
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
        }
    } as Wraith);
};

let _polarAngleRange = 0;
let _minPolarAngle = 0;
let _polarAngle = 0;

let _lastWraithSoundPlayed = true;
let _wraithPlaySpot = Math.PI / 2 + (Math.PI / 3 * Math.random());

const _wraithSounds = ["tphrdy00.wav", "tphwht00.wav", "tphwht01.wav", "tphwht02.wav", "tphwht03.wav", "tphyes00.wav", "tphyes01.wav", "tphyes02.wav", "tphyes03.wav", "tphpss00.wav", "tphpss01.wav", "tphpss02.wav", "tphpss03.wav", "tphpss04.wav", "tphpss05.wav", "tphpss06.wav"].map(s => `casc:sound\\terran\\phoenix\\${s}`);

const INTRO_LOOP = async (elapsed: number) => {
    const delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    // spaceships
    for (const wraith of _wraiths) {
        wraith.update(delta, elapsed);
    }

    const bcv = Math.sin(elapsed / (CAMERA_ROTATE_SPEED * 8));
    _battleCruiser.rotation.z = (MathUtils.lerp(BC_START_ROT.z, BC_END_ROT.z, bcv));
    _battleCruiser.rotation.x = (MathUtils.lerp(BC_START_ROT.x, BC_END_ROT.x, bcv));
    _battleCruiser.position.lerpVectors(BC_START_POS, BC_END_POS, bcv)

    // camera rotation
    _cameraRotateSpeed = MathUtils.damp(_cameraRotateSpeed, _destCameraSpeed, 0.00001, delta);
    controls.rotate(Math.PI / _cameraRotateSpeed, 0);
    _polarAngle = MathUtils.damp(_polarAngle, _minPolarAngle + Math.sin(delta / 1000) * _polarAngleRange, 0.001, delta);
    controls.rotatePolarTo(_polarAngle);
    controls.update(delta / 1000);

    // noise + glitch effects
    const normalizedAzimuthAngle = THREE.MathUtils.euclideanModulo(controls.azimuthAngle, 360 * THREE.MathUtils.DEG2RAD);
    const rear = normalizedAzimuthAngle < Math.PI ? normalizedAzimuthAngle / Math.PI : 2 - normalizedAzimuthAngle / Math.PI;
    _noiseInstance.value = rear;

    if (normalizedAzimuthAngle > Math.PI * 4 / 3 && normalizedAzimuthAngle < Math.PI * 2) {
        _destCameraSpeed = CAMERA_ROTATE_SPEED / 4;
    } else {
        _destCameraSpeed = CAMERA_ROTATE_SPEED;
    }

    if (normalizedAzimuthAngle > _wraithPlaySpot) {

        if (!_lastWraithSoundPlayed) {
            (async () => {
                const sound = mixer.context.createBufferSource();
                sound.buffer = await mixer.loadAudioBuffer(
                    _wraithSounds[MathUtils.randInt(0, _wraithSounds.length - 1)]
                );
                sound.detune.value = -200 * rear;

                const filter = new Filter("bandpass", 40);
                filter.changeQ(3);
                filter.changeGain(2)

                const janitor = new Janitor(mixer.connect(
                    sound,
                    filter.node,
                    mixer.createGain(2),
                    mixer.intro
                ));
                sound.start();
                sound.onended = () => janitor.mopUp();
            })()
        }
        _lastWraithSoundPlayed = true;
    } else {
        _wraithPlaySpot = Math.PI / 2 + (Math.PI / 3 * Math.random());
        _lastWraithSoundPlayed = false;
    }

    const g = MathUtils.smoothstep(Math.pow(rear, 2.5), 0.25, 1)
    glitchEffect.minStrength = glitchMax.x * g;
    glitchEffect.maxStrength = glitchMax.y * g;

    // render
    renderComposer.render(delta);
    renderComposer.renderBuffer();
};

const _sceneResizeHandler = () => {
    introSurface.setDimensions(
        window.innerWidth,
        window.innerHeight,
        devicePixelRatio
    );
    renderComposer.targetSurface = introSurface;
    camera.aspect = introSurface.width / introSurface.height;
    camera.updateProjectionMatrix();
};


export const preloadIntro = async () => {
    const envmap = await loadEnvironmentMap(`${__static}/envmap.hdr`)
    const { model: wraith } = await loadGlb(
        `${__static}/wraith.glb`, envmap
    );

    const { model: battlecruiser } = await loadGlb(
        `${__static}/battlecruiser.glb`, envmap
    );

    const { model: asteroid } = await loadGlb(
        `${__static}/asteroid.glb`, envmap
    );

    window.bc = _battleCruiser = battlecruiser;

    battlecruiser.traverse((o: Object3D) => {
        if (o instanceof Mesh) {
            o.material = upgradeStandardMaterial(o.material as MeshStandardMaterial);
            // o.material.emissive = new Color(0);
            (o.material as MeshPhysicalMaterial).emissiveIntensity = 0;
            (o.material as MeshPhysicalMaterial).transmission = 0.9;
            (o.material as MeshPhysicalMaterial).opacity = 0;
            (o.material as MeshPhysicalMaterial).thickness = 0.5;
        }
    });

    asteroid.traverse((o: Object3D) => {
        if (o instanceof Mesh) {
            o.material = upgradeStandardMaterial(o.material as MeshStandardMaterial);
            // o.material.emissive = new Color(0);
            (o.material as MeshPhysicalMaterial).emissiveIntensity = 0;
            (o.material as MeshPhysicalMaterial).transmission = 0.9;
            (o.material as MeshPhysicalMaterial).opacity = 0;
            (o.material as MeshPhysicalMaterial).thickness = 0.5;
        }
    });

    _asteroidInstances = new InstancedMesh((asteroid.children[0] as Mesh).geometry, (asteroid.children[0] as Mesh).material, 20);

    range(0, 5).forEach((i: number) => {
        const pos = new Vector3(MathUtils.randInt(60, 80), MathUtils.randInt(0, 30), MathUtils.randInt(-50, -100));
        const m = new Matrix4();
        const q = new Quaternion;

        q.setFromEuler(new Euler(MathUtils.randInt(0, 360), MathUtils.randInt(0, 360), MathUtils.randInt(0, 360)));
        const s = Math.random() + 0.5;

        m.compose(pos, q, new Vector3(1, 1, 1).setScalar(Math.min(5, s * s * s)));
        _asteroidInstances.setMatrixAt(i, m);
    });

    wraith.traverse((o: Object3D) => {
        if (o instanceof Mesh) {
            o.material = upgradeStandardMaterial(o.material as MeshStandardMaterial);
            // o.material.emissive = new Color(0);
            (o.material as MeshPhysicalMaterial).emissiveIntensity = 0;
            (o.material as MeshPhysicalMaterial).transmission = 0.9;
            (o.material as MeshPhysicalMaterial).opacity = 0;
            (o.material as MeshPhysicalMaterial).thickness = 0.5;
        }
    });

    const w1 = createWraith(wraith, new Vector3(0, 0, 0));
    const w2 = createWraith(wraith, new Vector3(4, 0.2, 0));
    const w3 = createWraith(wraith, new Vector3(-2, -0.1, -1.2));

    _wraiths.push(w1, w2, w3);
    for (const wraith of _wraiths) {
        wraith.init();
    }
}

let mouse = new Vector3;
const _mousemove = (ev: MouseEvent) => {
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (ev.clientY / window.innerHeight) * 2 - 1;
}

export const createWraithNoise = () => {
    const { source: highNoise, gain: highGain } = mixer.noise();
    const { source: noise, gain } = mixer.noise();

    const lopassFilter = new Filter("lowpass", 10);
    noise.detune.value = -800;
    gain.gain.value = 0.5;

    highNoise.detune.value = -400;
    highGain.gain.value = 0;

    const highpassFilter = new Filter("highpass", 10);
    highpassFilter.changeDetune(8000);

    const janitor = new Janitor(mixer.connect(highGain, gain, lopassFilter.node, highpassFilter.node, mixer.createDistortion(50), mixer.createGain(0.5), mixer.intro));
    gain.connect(highGain.gain);

    let _isPlaying = false;
    return {
        get isPlaying() {
            return _isPlaying;
        },
        start() {
            _isPlaying = true;
            noise.start();
            highNoise.start();
        },
        set value(val: number) {
            const h = MathUtils.lerp(0.75, 1, val)

            gain.gain.value = 0.5 * h;
            lopassFilter.changeFrequency(h * 60 + 10);

            const r = (1 - Math.pow(val, 4));
            const t = (1 - Math.pow(val, 8));
            highpassFilter.changeFrequency(r * 10);
            highpassFilter.changeDetune(MathUtils.lerp(-4000, 8000, t))
        },
        dispose() {
            if (_isPlaying) {
                noise.stop();
                highNoise.stop();
            }

            janitor.mopUp();
        }
    }
}
export type WraithNoise = ReturnType<typeof createWraithNoise>;

let _noiseInstance: WraithNoise;

export const getSurface = () => introSurface;

export async function createWraithScene() {
    const janitor = new Janitor;

    _noiseInstance = janitor.add(createWraithNoise());
    _noiseInstance.start();
    janitor.add(_noiseInstance);

    janitor.addEventListener(window, "resize", _sceneResizeHandler, { passive: true });
    janitor.addEventListener(window, "mousemove", _mousemove, { passive: true });

    _sceneResizeHandler();

    const scene = new Scene();
    scene.background = gameStore().assets!.skyBox;
    const slight = new DirectionalLight(0xffffff, 5);

    for (const wraith of _wraiths) {
        scene.add(wraith);
        janitor.add(wraith);
    }

    _battleCruiser.scale.setScalar(50);
    _battleCruiser.rotation.x = BC_START_ROT.x;
    _battleCruiser.rotation.y = BC_START_ROT.y;
    _battleCruiser.rotation.z = BC_START_ROT.z;
    _battleCruiser.position.copy(BC_START_POS);

    {
        const vertices = [];
        for (let i = 0; i < 10000; i++) {

            const x = THREE.MathUtils.randFloatSpread(1000);
            const y = THREE.MathUtils.randFloatSpread(1000);
            const z = THREE.MathUtils.randFloatSpread(1000);

            if (Math.abs(x) < 100 || Math.abs(z) < 100) {
                continue;
            }

            vertices.push(x, y, z);

        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial({ color: 0x888888 });
        material.depthWrite = false;
        const stars = new THREE.Points(geometry, material);
        scene.add(stars);
    }
    scene.add(_asteroidInstances);
    scene.add(_battleCruiser);
    scene.add(slight);

    introSurface.setDimensions(
        window.innerWidth,
        window.innerHeight,
        devicePixelRatio
    );
    renderComposer.targetSurface = introSurface;
    renderComposer.getWebGLRenderer().shadowMap.autoUpdate = true;

    camera.aspect = introSurface.width / introSurface.height;
    camera.updateProjectionMatrix();

    controls.setLookAt(-3.15, 1.1, -0.7, 0, 0, 0, false);
    controls.zoomTo(1.75, false);
    controls.mouseButtons.left = 0;
    controls.mouseButtons.right = 0;
    controls.mouseButtons.middle = 0;
    controls.mouseButtons.wheel = 0;

    _minPolarAngle = _polarAngle = controls.polarAngle;
    _polarAngleRange = (Math.PI / 2 - _minPolarAngle) * 2;

    const renderPass = new RenderPass(scene, camera);
    const sunMaterial = new MeshBasicMaterial({
        color: 0xffddaa,
        transparent: true,
        fog: false,
    });

    const sunGeometry = new SphereBufferGeometry(0.75, 32, 32);
    const sun = new Mesh(sunGeometry, sunMaterial);
    sun.frustumCulled = false;

    const godRaysEffect = new GodRaysEffect(camera, sun, {
        height: 480,
        kernelSize: KernelSize.SMALL,
        density: 1,
        decay: 0.94,
        weight: 1,
        exposure: 1,
        samples: 60,
        clampMax: 1.0,
        blendFunction: BlendFunction.SCREEN,
    });

    slight.position.set(5, 5, 4);
    slight.position.multiplyScalar(10);
    slight.lookAt(0, 0, 0);
    sun.position.copy(slight.position).setY(0);
    sun.updateMatrix();
    sun.updateMatrixWorld();

    glitchEffect.blendMode.setOpacity(0.5);
    const glitchPass = new EffectPass(camera, glitchEffect);
    const tone = new ToneMappingEffect();

    const vignet = new VignetteEffect({
        darkness: 0.55
    })

    const postProcessingBundle = {
        passes: [
            renderPass,
            new EffectPass(
                camera,
                new BloomEffect({
                    intensity: 1.25,
                    blendFunction: BlendFunction.SCREEN,
                }),
                new SMAAEffect(),
                tone,
                godRaysEffect,
                vignet
            ),
            glitchPass,
        ],
        effects: [],
    };
    updatePostProcessingCamera(postProcessingBundle, camera, true);
    renderComposer.setBundlePasses(postProcessingBundle);

    renderComposer.getWebGLRenderer().compile(scene, camera);

    janitor.setInterval(() => {
        controls.zoomTo(Math.random() * 2 + 1.75);
    }, 20000);

    renderComposer.render(0);
    renderComposer.renderBuffer();
    renderComposer
        .getWebGLRenderer()
        .setAnimationLoop(
            INTRO_LOOP
        );
    janitor.add(() => {
        renderComposer.getWebGLRenderer().setAnimationLoop(null)
        renderComposer.dispose();
    })

    return () => janitor.mopUp()
}