import mixer from "../audio/main-mixer";
import renderComposer from "../render/render-composer";
import { loadGlb, Surface } from "../image";
import loadEnvironmentMap from "@image/env-map";
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
    ToneMappingMode,
} from "postprocessing";
import CameraShake from "../camera/camera-shake";
import {
    updatePostProcessingCamera,
} from "@utils/renderer-utils";

import {
    Color,
    DirectionalLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial,
    MeshStandardMaterial,
    Object3D,
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereBufferGeometry,
    Vector2,
    Vector3,
} from "three";
import CameraControls from "camera-controls";
import * as THREE from "three";
import Janitor from "@utils/janitor";
import gameStore from "@stores/game-store";
import { Filter } from "../audio/filter";
import { upgradeStandardMaterial } from "@utils/material-utils";
import settingsStore from "@stores/settings-store";


CameraControls.install({ THREE: THREE });

const camera = new PerspectiveCamera(110, 1, 0.1, 10000);
const introSurface = new Surface();
const controls = new CameraControls(camera, introSurface.canvas);
controls.maxPolarAngle = Infinity;
controls.minPolarAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;
controls.minAzimuthAngle = -Infinity;

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
const shake = new CameraShake();
shake.enabled = true;

type Wraith = Object3D & { init: () => void, update: (delta: number, elapsed: number) => void };
const _wraiths: Wraith[] = [];

const wraithMethods = (originalPosition: Vector3) => {
    let _swerveRate = 1000;
    let _nextSwerveRate = 1000;
    let _nextSwerveAngle = Math.PI / 3.5;

    let [wx, wy, wz] = [Math.random() * 3000 + 1000, Math.random() * 3000 + 1000, Math.random() * 3000 + 1000];

    return {
        init() {
            this.position.copy(originalPosition);
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
            this.position.z = originalPosition.z + Math.sin(elapsed / wz) * 0.6;
        },
    } as Wraith;
};

let _polarAngleRange = 0;
let _minPolarAngle = 0;
let _polarAngle = 0;
const introLoop = (elapsed: number) => {
    const delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    renderComposer.render(delta);
    renderComposer.renderBuffer();

    // [-1, 1] -> [-Math.PI/2, Math.PI/2]
    for (const wraith of _wraiths) {
        wraith.update(delta, elapsed);
    }

    controls.rotate(Math.PI / 15000, 0);
    _polarAngle = MathUtils.damp(_polarAngle, _minPolarAngle + Math.sin(delta / 1000) * _polarAngleRange, 0.001, delta);
    controls.rotatePolarTo(_polarAngle);
    controls.update(delta / 1000);

    const normalizedAzimuthAngle = THREE.MathUtils.euclideanModulo(controls.azimuthAngle, 360 * THREE.MathUtils.DEG2RAD);
    const rear = normalizedAzimuthAngle < Math.PI ? normalizedAzimuthAngle / Math.PI : 2 - normalizedAzimuthAngle / Math.PI;
    _noiseInstance.value = rear;

    const g = MathUtils.smoothstep(rear, 0.25, 1)
    glitchEffect.minStrength = glitchMax.x * g;
    glitchEffect.maxStrength = glitchMax.y * g;
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
    const { model: wraith } = await loadGlb(
        `${__static}/wraith.glb`,
        await loadEnvironmentMap(`${__static}/envmap.hdr`)
    );

    wraith.traverse((o: Object3D) => {
        if (o instanceof Mesh) {
            o.material = upgradeStandardMaterial(o.material as MeshStandardMaterial);
            o.material.emissive = new Color(0);
            (o.material as MeshPhysicalMaterial).transmission = 0.85;
            (o.material as MeshPhysicalMaterial).opacity = 0;
            // (o.material as MeshPhysicalMaterial).ior = 2.333;
        }
    });

    const w1 = Object.assign(wraith, wraithMethods(new Vector3(0, 0, 0)));
    const w2 = Object.assign(wraith.clone(true), wraithMethods(new Vector3(4, 0.2, 0)));
    const w3 = Object.assign(wraith.clone(true), wraithMethods(new Vector3(-2, -0.1, -1.2)));

    {
        const plight = new PointLight(0xff0000, 4, 50, 2);
        plight.position.set(0, -10, 0);
        wraith.add(plight);
    }

    {
        const plight = new PointLight(0x999900, 4, 50, 2);
        plight.position.set(0, -10, 0);
        w2.add(plight);
    }

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

    const lopassFilter = new Filter;
    lopassFilter.changeFrequency(10);
    noise.detune.value = -800;
    gain.gain.value = 0.5;

    highNoise.detune.value = -400;
    highGain.gain.value = 0;

    const masterNoiseGain = mixer.context.createGain();
    masterNoiseGain.gain.value = 0.3;

    const highpassFilter = new Filter;
    highpassFilter.changeFrequency(10);
    highpassFilter.node.type = "highpass";
    highpassFilter.changeDetune(8000);

    highGain.connect(gain);
    gain.connect(highGain.gain);
    gain.connect(lopassFilter.node);
    lopassFilter.node.connect(highpassFilter.node);
    highpassFilter.node.connect(masterNoiseGain);
    masterNoiseGain.connect(mixer.sound);

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
            highpassFilter.changeDetune(MathUtils.lerp(0, 8000, t))
        },
        dispose() {
            if (_isPlaying) {
                noise.stop();
                highNoise.stop();
            }

            noise.disconnect();
            highNoise.disconnect();
            gain.disconnect();

            lopassFilter.node.disconnect();
            masterNoiseGain.disconnect();
        }
    }
}
export type WraithNoise = ReturnType<typeof createWraithNoise>;

let _noiseInstance: WraithNoise;

export const getSurface = () => introSurface;



export const createWraithScene = async () => {
    const janitor = new Janitor;

    _noiseInstance = createWraithNoise();
    settingsStore().data.game.playIntroSounds && _noiseInstance.start();
    janitor.add(_noiseInstance);

    janitor.addEventListener(window, "resize", _sceneResizeHandler, { passive: true });
    janitor.addEventListener(window, "mousemove", _mousemove, { passive: true });

    _sceneResizeHandler();

    const scene = new Scene();
    scene.background = gameStore().assets!.skyBox;
    const slight = new DirectionalLight(0xffffff, 5);

    for (const wraith of _wraiths) {
        scene.add(wraith);
    }

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
    glitchPass.enabled = false;

    const tone = new ToneMappingEffect({
        mode: ToneMappingMode.OPTIMIZED_CINEON
    });


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
                godRaysEffect
            ),
            glitchPass,
        ],
        effects: [],
    };
    updatePostProcessingCamera(postProcessingBundle, camera, true);
    renderComposer.setBundlePasses(postProcessingBundle);

    return {
        surface: introSurface,
        dispose: () => janitor.mopUp(), start: () => {
            let _i = 0;
            janitor.setInterval(() => {
                // glitchPass.enabled = false;
                _i++;
                if (_i === 19) {
                    glitchPass.enabled = true;
                } else if (_i === 20) {
                    controls.zoomTo(Math.random() * 4 + 1);
                    // glitchPass.enabled = false;
                    _i = 0;
                }
                updatePostProcessingCamera(postProcessingBundle, camera, true);
            }, 1000);

            glitchPass.enabled = true;
            updatePostProcessingCamera(postProcessingBundle, camera, true);

            renderComposer.render(0);
            renderComposer.renderBuffer();
            renderComposer
                .getWebGLRenderer()
                .setAnimationLoop(
                    introLoop
                );
            janitor.add(() => {
                renderComposer.getWebGLRenderer().setAnimationLoop(null)
                renderComposer.dispose();
            })
        }
    }
}