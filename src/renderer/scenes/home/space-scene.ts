import { renderComposer } from "@render";
import { Surface } from "@image/canvas/surface";
import { loadEnvironmentMap } from "@image/environment/env-map";
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

import {
    DirectionalLight,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    Scene,
    SphereGeometry,
    Texture,
    Vector2,
    Vector3,
} from "three";
import CameraControls from "camera-controls";
import * as THREE from "three";
import { Janitor } from "three-janitor";
import gameStore from "@stores/game-store";
import { createBattleLights, distantStars } from "./stars";
import { createBattleCruiser } from "./battlecruiser";
import { createAsteroids } from "./asteroids";
import { createWraithNoise, playRemix, WraithNoise } from "./wraith-noise";
import { createWraiths } from "./wraiths";
import { CameraState, CAMERA_ROTATE_SPEED, createCamera } from "./camera";
import path from "path";
import processStore from "@stores/process-store";

CameraControls.install( { THREE: THREE } );

const camera = createCamera();
const introSurface = new Surface();
const controls = new CameraControls( camera.get(), document.body );
controls.maxPolarAngle = Infinity;
controls.minPolarAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;
controls.minAzimuthAngle = -Infinity;

const chromaticAberrationEffect = new ChromaticAberrationEffect();
const glitchMax = new Vector2( 0.05, 0.08 );

const glitchEffect = new GlitchEffect( {
    chromaticAberrationOffset: chromaticAberrationEffect.offset,
    columns: 0,
    delay: new Vector2( 1.5, 3.5 ),
    strength: new Vector2().copy( glitchMax ),
    duration: new Vector2( 6, 10 ),
    blendFunction: BlendFunction.OVERLAY,
} );

introSurface.canvas.style.position = "absolute";

let _lastElapsed = 0;

const battleCruiser = createBattleCruiser();
const asteroids = createAsteroids();
const wraiths = createWraiths();
const battleLights = createBattleLights();

const INTRO_LOOP = ( elapsed: number ) => {
    const delta = elapsed - _lastElapsed;
    _lastElapsed = elapsed;

    controls.update( delta / 1000 );

    const azimuth = THREE.MathUtils.euclideanModulo(
        controls.azimuthAngle,
        360 * THREE.MathUtils.DEG2RAD
    );
    const rear = azimuth < Math.PI ? azimuth / Math.PI : 2 - azimuth / Math.PI;

    camera.update( delta, controls, azimuth, mouse );

    wraiths.update(
        delta,
        camera.get(),
        azimuth,
        rear,
        camera.cameraState === CameraState.RotateAroundWraiths
    );
    battleCruiser.update( delta, CAMERA_ROTATE_SPEED, camera.get() );
    battleLights.update( camera.get(), delta, azimuth );

    const g =
        camera.cameraState === CameraState.UnderWraiths
            ? MathUtils.smoothstep( Math.pow( rear, 2.5 ), 0.25, 1 )
            : 0;
    glitchEffect.minStrength = glitchMax.x * g;
    glitchEffect.maxStrength = glitchMax.y * g;

    _noiseInstance.value =
        camera.cameraState === CameraState.RotateAroundWraiths ? rear : 0;

    renderComposer.render( delta );
    renderComposer.renderBuffer();
};

const _sceneResizeHandler = () => {
    introSurface.setDimensions( window.innerWidth, window.innerHeight, devicePixelRatio );
    renderComposer.targetSurface = introSurface;
    camera.get().aspect = introSurface.width / introSurface.height;
    camera.get().updateProjectionMatrix();
};

let fireTexture: Texture;

export const preloadIntro = async () => {
    if ( fireTexture === undefined ) {
        fireTexture = new EXRLoader().load( path.join( __static, "./FireBall03_8x8.exr" ) );
    }

    const envmap = loadEnvironmentMap( path.join( __static, "./envmap.hdr" ), () =>
        processStore().increment()
    );

    await asteroids.load( envmap );
    processStore().increment();

    await wraiths.load( envmap, fireTexture );
    processStore().increment();

    await battleCruiser.load( envmap, fireTexture );
    processStore().increment();

    battleLights.load( fireTexture );
};

const mouse = new Vector3();
const _mousemove = ( ev: MouseEvent ) => {
    mouse.x = ( ev.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = ( ev.clientY / window.innerHeight ) * 2 - 1;
};

export const getSurface = () => introSurface;

// window._clap = () => {
//     console.log("position", controls.getPosition());
//     console.log("target", controls.getTarget());
//     console.log("zoom", _zoom)
// }

let _noiseInstance: WraithNoise;

let _runs = 0;

export async function createWraithScene() {
    if ( _runs++ > 0 ) {
        await preloadIntro();
    }

    const janitor = new Janitor( "intro" );

    _noiseInstance = janitor.mop( createWraithNoise() );
    _noiseInstance.start();

    janitor.addEventListener( window, "resize", "resize", _sceneResizeHandler, {
        passive: true,
    } );
    janitor.addEventListener( window, "mousemove", "mousemove", _mousemove, {
        passive: true,
    } );

    setTimeout( () => {
        _sceneResizeHandler();
    }, 0 );

    const scene = new Scene();
    scene.name = "intro-scene";
    scene.background = gameStore().assets!.skyBox;

    wraiths.init();
    scene.add( janitor.mop( wraiths.object ) );

    // janitor.mop(wraiths, "wraiths");
    janitor.mop( battleCruiser.particles.object );
    janitor.mop( wraiths.particles.object );

    scene.add( janitor.mop( distantStars() ) );

    scene.add( janitor.mop( battleCruiser.object ) );

    scene.add( janitor.mop( asteroids.object ) );

    scene.add( janitor.mop( battleLights.object ) );

    const playRemixInterval = setInterval( () => {
        playRemix();
    }, 60000 * 3 + Math.random() * 60000 * 10 );
    janitor.add( () => clearInterval( playRemixInterval ), "remix" );

    const slight = new DirectionalLight( 0xffffff, 5 );
    scene.add( slight );

    introSurface.setDimensions( window.innerWidth, window.innerHeight, devicePixelRatio );
    renderComposer.targetSurface = introSurface;

    camera.get().aspect = introSurface.width / introSurface.height;
    camera.get().updateProjectionMatrix();

    controls.setLookAt( -3.15, 1.1, -0.7, 0, 0, 0, false );
    controls.zoomTo( 1.75, false );
    controls.mouseButtons.left = 0;
    controls.mouseButtons.right = 0;
    controls.mouseButtons.middle = 0;
    controls.mouseButtons.wheel = 0;

    janitor.mop( camera.init( controls, battleCruiser.object ), "camera" );

    const renderPass = janitor.mop( new RenderPass( scene, camera.get() ) );
    const sunMaterial = new MeshBasicMaterial( {
        color: 0xffddaa,
        transparent: true,
        fog: false,
    } );

    const sunGeometry = new SphereGeometry( 0.75, 32, 32 );
    const sun = janitor.mop( new Mesh( sunGeometry, sunMaterial ) );
    sun.name = "sun";
    sun.frustumCulled = false;

    const godRaysEffect = new GodRaysEffect( camera.get(), sun, {
        height: 480,
        kernelSize: KernelSize.SMALL,
        density: 1,
        decay: 0.94,
        weight: 1,
        exposure: 1,
        samples: 60,
        clampMax: 1.0,
        blendFunction: BlendFunction.SCREEN,
    } );

    slight.position.set( 5, 5, 4 );
    slight.position.multiplyScalar( 10 );
    slight.lookAt( 0, 0, 0 );
    sun.position.copy( slight.position ).setY( 0 );
    sun.updateMatrix();
    sun.updateMatrixWorld();

    glitchEffect.blendMode.setOpacity( 0.5 );
    const glitchPass = new EffectPass( camera.get(), glitchEffect );
    const tone = new ToneMappingEffect();

    const vignet = new VignetteEffect( {
        darkness: 0.55,
    } );

    renderComposer.setBundlePasses( {
        passes: janitor.mop( [
            renderPass,
            new EffectPass(
                camera.get(),
                new BloomEffect( {
                    intensity: 1.25,
                    blendFunction: BlendFunction.SCREEN,
                    mipmapBlur: true,
                } ),
                new SMAAEffect(),
                tone,
                godRaysEffect,
                vignet
            ),
            glitchPass,
        ] ),
    } );

    renderComposer.getWebGLRenderer().compile( scene, camera.get() );

    renderComposer.render( 0 );
    renderComposer.renderBuffer();
    renderComposer.getWebGLRenderer().setAnimationLoop( INTRO_LOOP );
    janitor.mop( () => {
        renderComposer.getWebGLRenderer().setAnimationLoop( null );
    }, "renderLoop" );

    return () => {
        janitor.dispose();
    };
}
