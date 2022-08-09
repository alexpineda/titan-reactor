import { renderComposer } from "@render";
import { Surface } from "@image";
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
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { updatePostProcessingCamera } from "@utils/renderer-utils";

import {
    DirectionalLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    Scene,
    SphereBufferGeometry,
    Texture,
    Vector2,
    Vector3,
} from "three";
import CameraControls from "camera-controls";
import * as THREE from "three";
import Janitor from "@utils/janitor";
import gameStore from "@stores/game-store";
import processStore, { Process } from "@stores/process-store";
import { distantStars } from "./stars";
import { createBattleCruiser } from "./battlecruiser";
import { createAsteroids } from "./asteroids";
import { createWraithNoise, WraithNoise } from "./wraith-noise";
import { createWraiths } from "./wraiths";
import { CAMERA_ROTATE_SPEED, createCamera } from "./camera";

CameraControls.install({ THREE: THREE });

const camera = createCamera();
const introSurface = new Surface();
const controls = new CameraControls(camera.get(), document.body);
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
    strength: new Vector2().copy(glitchMax),
    duration: new Vector2(6, 10),
    blendFunction: BlendFunction.OVERLAY,
});

introSurface.canvas.style.position = "absolute";

let _lastElapsed = 0;

const battleCruiser = createBattleCruiser();
const asteroids = createAsteroids();
const wraiths = createWraiths();

const INTRO_LOOP = async (elapsed: number) => {
    const delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    controls.update(delta / 1000);

    const normalizedAzimuthAngle = THREE.MathUtils.euclideanModulo(
        controls.azimuthAngle,
        360 * THREE.MathUtils.DEG2RAD
    );
    const rear =
        normalizedAzimuthAngle < Math.PI
            ? normalizedAzimuthAngle / Math.PI
            : 2 - normalizedAzimuthAngle / Math.PI;

    camera.update(delta, controls, normalizedAzimuthAngle);

    // spaceships
    wraiths.update(delta, elapsed, camera.get(), normalizedAzimuthAngle, rear)

    //TODO CHANGE TO DELTA
    battleCruiser.update(delta, elapsed, CAMERA_ROTATE_SPEED, camera.get());

    const g = MathUtils.smoothstep(Math.pow(rear, 2.5), 0.25, 1);
    glitchEffect.minStrength = glitchMax.x * g;
    glitchEffect.maxStrength = glitchMax.y * g;
    _noiseInstance.value = rear;


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
    camera.get().aspect = introSurface.width / introSurface.height;
    camera.get().updateProjectionMatrix();
};

let fireTexture: Texture;

// let _zoom = 100;
// window.addEventListener("click", () => {
//     if (_zoom === 1) {
//         _zoom = 2;
//         controls.zoomTo(2);
//     } else if (_zoom === 2) {
//         _zoom = 3;
//         controls.zoomTo(3);
//     } else {
//         _zoom = 1;
//         controls.zoomTo(1);
//     }
//     window._clap();
// })

export const preloadIntro = async () => {
    const { increment, complete } = processStore().start(Process.AtlasPreload, 4);

    //TODO submit to types
    //@ts-ignore
    fireTexture = new EXRLoader().load(`${__static}/FireBall03_8x8.exr`);

    const envmap = await loadEnvironmentMap(`${__static}/envmap.hdr`);
    increment();

    await battleCruiser.load(envmap, fireTexture);
    increment();

    await asteroids.load(envmap);
    increment();

    await wraiths.load(envmap, fireTexture);

    complete();
};

let mouse = new Vector3();
const _mousemove = (ev: MouseEvent) => {
    mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (ev.clientY / window.innerHeight) * 2 - 1;
};

export const getSurface = () => introSurface;

// window._clap = () => {
//     console.log("position", controls.getPosition());
//     console.log("target", controls.getTarget());
//     console.log("zoom", _zoom)
// }

let _noiseInstance: WraithNoise;

export async function createWraithScene() {
    const janitor = new Janitor();

    _noiseInstance = janitor.add(createWraithNoise());
    _noiseInstance.start();

    janitor.addEventListener(window, "resize", _sceneResizeHandler, {
        passive: true,
    });
    janitor.addEventListener(window, "mousemove", _mousemove, { passive: true });

    _sceneResizeHandler();

    const scene = new Scene();
    scene.background = gameStore().assets!.skyBox;
    const slight = new DirectionalLight(0xffffff, 5);

    wraiths.init();
    scene.add(...wraiths.get());
    janitor.add(wraiths);

    scene.add(distantStars());
    scene.add(battleCruiser.get());
    scene.add(asteroids.get());
    scene.add(slight);

    introSurface.setDimensions(
        window.innerWidth,
        window.innerHeight,
        devicePixelRatio
    );
    renderComposer.targetSurface = introSurface;
    renderComposer.getWebGLRenderer().shadowMap.autoUpdate = true;

    camera.get().aspect = introSurface.width / introSurface.height;
    camera.get().updateProjectionMatrix();

    controls.setLookAt(-3.15, 1.1, -0.7, 0, 0, 0, false);
    controls.zoomTo(1.75, false);
    // controls.mouseButtons.left = 0;
    // controls.mouseButtons.right = 0;
    // controls.mouseButtons.middle = 0;
    // controls.mouseButtons.wheel = 0;

    camera.init(controls.polarAngle);

    const renderPass = new RenderPass(scene, camera.get());
    const sunMaterial = new MeshBasicMaterial({
        color: 0xffddaa,
        transparent: true,
        fog: false,
    });

    const sunGeometry = new SphereBufferGeometry(0.75, 32, 32);
    const sun = new Mesh(sunGeometry, sunMaterial);
    sun.frustumCulled = false;

    const godRaysEffect = new GodRaysEffect(camera.get(), sun, {
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
    const glitchPass = new EffectPass(camera.get(), glitchEffect);
    const tone = new ToneMappingEffect();

    const vignet = new VignetteEffect({
        darkness: 0.55,
    });

    const postProcessingBundle = {
        passes: [
            renderPass,
            new EffectPass(
                camera.get(),
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
    updatePostProcessingCamera(postProcessingBundle, camera.get(), true);
    renderComposer.setBundlePasses(postProcessingBundle);

    renderComposer.getWebGLRenderer().compile(scene, camera.get());

    janitor.setInterval(() => {
        controls.zoomTo(Math.random() * 2 + 1.75);
    }, 20000);

    renderComposer.render(0);
    renderComposer.renderBuffer();
    renderComposer.getWebGLRenderer().setAnimationLoop(INTRO_LOOP);
    janitor.add(() => {
        renderComposer.getWebGLRenderer().setAnimationLoop(null);
        renderComposer.dispose();
    });

    return () => janitor.mopUp();
}
