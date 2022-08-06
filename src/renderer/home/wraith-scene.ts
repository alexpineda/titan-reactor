import fs from "fs/promises";
import path from "path";
import renderComposer from "../render/render-composer";
import { loadGlb, Surface } from "../image";
import loadEnvironmentMap from "@image/env-map";
import {
    BlendFunction,
    BloomEffect,
    ChromaticAberrationEffect,
    ColorDepthEffect,
    EffectPass,
    GlitchEffect,
    GodRaysEffect,
    KernelSize,
    PixelationEffect,
    RenderPass,
    SMAAEffect,
    ToneMappingEffect,
} from "postprocessing";
import CameraShake from "../camera/camera-shake";
import {
    updatePostProcessingCamera,
} from "@utils/renderer-utils";

import {
    AudioContext,
    Color,
    CubeTextureLoader,
    DirectionalLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    PerspectiveCamera,
    PointLight,
    Scene,
    SphereBufferGeometry,
    Vector2,
} from "three";
import CameraControls from "camera-controls";
import * as THREE from "three";
CameraControls.install({ THREE: THREE });

const audioContext = AudioContext.getContext();

export const playIntroAudio = async () => {

    const buffer = (
        await fs.readFile(path.join(__static, "drop-your-socks.mp3"))
    ).buffer;

    const result = await audioContext.decodeAudioData(buffer.slice(0));
    const sound = audioContext.createBufferSource();

    sound.connect(audioContext.destination);
    sound.buffer = result;
    sound.start();
}

const camera = new PerspectiveCamera(110, 1, 0.1, 10000);
const introSurface = new Surface();
const controls = new CameraControls(camera, introSurface.canvas);
controls.maxPolarAngle = Infinity;
controls.minPolarAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;
controls.minAzimuthAngle = -Infinity;

introSurface.canvas.style.position = "absolute";

let _lastElapsed = 0;
const shake = new CameraShake();
shake.enabled = true;

type Wraith = Object3D & { update: (delta: number, elapsed: number) => void };
const _wraiths: Wraith[] = [];

const wraithMethods = () => {
    let _swerveRate = 1000;
    let _nextSwerveRate = 1000;
    let _nextSwerveAngle = Math.PI / 3;

    return {
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
        },
    } as Wraith;
};

const introLoop = (elapsed: number) => {
    const delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    renderComposer.render(delta);
    renderComposer.renderBuffer();

    // [-1, 1] -> [-Math.PI/2, Math.PI/2]
    for (const wraith of _wraiths) {
        wraith.update(delta, elapsed);
    }

    controls.rotate(-Math.PI / 30000, Math.PI / 300000);
    controls.update(delta / 1000);

};

let _interval: NodeJS.Timeout | undefined = undefined;
let _glitchInterval: NodeJS.Timeout | undefined = undefined;

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
        console.log(o);
        if (o instanceof Mesh) {
            o.material.emissive = new Color(0);
        }
    });

    const w1 = Object.assign(wraith, wraithMethods());
    const w2 = Object.assign(wraith.clone(true), wraithMethods());
    const w3 = Object.assign(wraith.clone(true), wraithMethods());

    w2.position.set(4, 0.2, 0);
    w3.position.set(-2, -0.1, -1.2);

    {
        const plight = new PointLight(0xff0000, 5, 100, 2);
        plight.position.set(0, -10, 0);
        wraith.add(plight);
    }

    {
        const plight = new PointLight(0x999900, 5, 100, 2);
        plight.position.set(0, -10, 0);
        w2.add(plight);
    }

    _wraiths.push(w1, w2, w3);
}

export const createWraithScene = async () => {
    window.addEventListener("resize", _sceneResizeHandler, false);
    _sceneResizeHandler();

    const scene = new Scene();
    const slight = new DirectionalLight(0xffffff, 5);

    for (const wraith of _wraiths) {
        scene.add(wraith);
    }

    scene.add(slight);

    {
        const loader = new CubeTextureLoader();
        const rootPath = path.join(__static, "skybox", "sparse");
        loader.setPath(rootPath);

        scene.background = loader.load([
            "right.png",
            "left.png",
            "top.png",
            "bot.png",
            "front.png",
            "back.png",
        ]);
    }

    introSurface.setDimensions(
        window.innerWidth,
        window.innerHeight,
        devicePixelRatio
    );
    renderComposer.targetSurface = introSurface;
    renderComposer.getWebGLRenderer().shadowMap.autoUpdate = true;

    camera.aspect = introSurface.width / introSurface.height;
    camera.updateProjectionMatrix();

    controls.setLookAt(-3.15, 1.1, 0.7, 0, 0, 0, false);
    controls.zoomTo(1.75);
    controls.mouseButtons.right = 0;

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
        weight: 0.05,
        exposure: 0.8,
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

    const chromaticAberrationEffect = new ChromaticAberrationEffect();

    const glitchEffect = new GlitchEffect({
        chromaticAberrationOffset: chromaticAberrationEffect.offset,
        columns: 0,
        delay: new Vector2(1.5, 3.5),
        strength: new Vector2(0.05, 0.03),
        duration: new Vector2(6, 10),
        blendFunction: BlendFunction.OVERLAY,
    });
    glitchEffect.blendMode.setOpacity(0.5);
    const glitchPass = new EffectPass(camera, glitchEffect);
    glitchPass.enabled = false;

    const bitPass = new EffectPass(
        camera,
        new PixelationEffect(3),
        new ColorDepthEffect({ bits: 8, blendFunction: BlendFunction.SCREEN })
    );

    const postProcessingBundle = {
        passes: [
            renderPass,
            new EffectPass(
                camera,
                new BloomEffect({
                    intensity: 1.5,
                    blendFunction: BlendFunction.SCREEN,
                }),
                new SMAAEffect(),
                new ToneMappingEffect(),
                godRaysEffect
            ),
            bitPass,
            glitchPass,
        ],
        effects: [],
    };
    updatePostProcessingCamera(postProcessingBundle, camera, true);
    renderComposer.setBundlePasses(postProcessingBundle);

    return {
        surface: introSurface,
        dispose: () => {
            renderComposer.getWebGLRenderer().setAnimationLoop(null);
            clearInterval(_interval!);
            clearInterval(_glitchInterval!);
            _interval = _glitchInterval = undefined;
            window.removeEventListener("resize", _sceneResizeHandler);
        }, start: () => {
            setTimeout(() => {
                bitPass.enabled = !bitPass.enabled;
                updatePostProcessingCamera(postProcessingBundle, camera, true);

                _interval = setInterval(() => {
                    bitPass.enabled = !bitPass.enabled;
                    updatePostProcessingCamera(postProcessingBundle, camera, true);
                }, 30000);

                let _i = 0;
                _glitchInterval = setInterval(() => {
                    glitchPass.enabled = false;
                    _i++;
                    if (_i === 29) {
                        glitchPass.enabled = true;
                    } else if (_i === 30) {
                        glitchPass.enabled = false;
                        _i = 0;
                    }
                    updatePostProcessingCamera(postProcessingBundle, camera, true);
                }, 1000);
                glitchPass.enabled = true;
                updatePostProcessingCamera(postProcessingBundle, camera, true);
            }, 10000);

            renderComposer.render(0);
            renderComposer.renderBuffer();
            renderComposer
                .getWebGLRenderer()
                .setAnimationLoop(
                    introLoop
                );
        }
    }
}