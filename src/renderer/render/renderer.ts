import {
    Camera,
    HalfFloatType,
    PCFSoftShadowMap,
    Scene,
    sRGBEncoding,
    Vector4,
    WebGLRenderer,
} from "three";
import {
    EffectComposer,
} from "postprocessing";
import { createPasses, Passes } from "./composer-passes";
import rendererIsDev from "../utils/renderer-is-dev";
import CanvasTarget from "../image/canvas/canvas-target";

const createWebGLRenderer = () => {
    const renderer = new WebGLRenderer({
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        antialias: false,
        stencil: false,
        depth: false,
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.debug.checkShaderErrors = rendererIsDev;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.sortObjects = true;
    return renderer;
};
export class TitanRenderer {
    private _renderer?: WebGLRenderer;
    private _targetSurface = new CanvasTarget();
    readonly composerPasses = createPasses();
    private _gamma = 0.9;

    composer = new EffectComposer(null, {
        frameBufferType: HalfFloatType,
        multisampling: 0
    });

    constructor() {
        this.getWebGLRenderer();
    }

    get gamma() {
        return this._gamma;
    }

    set gamma(value: number) {
        this._gamma = value;
        if (this._renderer) {
            this._renderer.toneMappingExposure = value;
        }
    }

    getWebGLRenderer() {
        if (this._renderer) {
            return this._renderer;
        }
        const renderer = this._renderer = createWebGLRenderer();
        renderer.toneMappingExposure = this._gamma;

        this.composer.setRenderer(renderer);
        this.composer.autoRenderToScreen = false;

        for (const pass of this.composerPasses.passes) {
            if (pass === undefined) continue;
            this.composer.addPass(pass);
        }
        this.composerPasses.enable(Passes.Render);

        renderer.domElement.addEventListener(
            "webglcontextlost",
            () => {
                this._renderer?.setAnimationLoop(null);
                // this.getWebGLRenderer();
                // this._renderer = undefined;
            }
        );

        if (this._targetSurface) {
            this.setSize(this._targetSurface.scaledWidth, this._targetSurface.scaledHeight);
        }

        return renderer;
    }

    set targetSurface(surface: CanvasTarget) {
        this._targetSurface = surface;
        this._renderer?.setViewport(
            new Vector4(0, 0, surface.width, surface.height)
        );
        this.setSize(this._targetSurface.scaledWidth, this._targetSurface.scaledHeight);
    }

    render(scene: Scene, camera: Camera, delta: number, viewport?: Vector4) {
        const renderer = this.getWebGLRenderer();

        if (viewport) {
            renderer.setScissorTest(true);
            renderer.setViewport(viewport);
            renderer.setScissor(viewport);
        }

        if (this.composer.passes.length) {
            this.composerPasses.update(scene, camera);
            this.composer.render(delta);
        } else {
            renderer.render(scene, camera);
        }

        if (viewport) {
            renderer.setScissorTest(false);
        }

        this._targetSurface.ctx.drawImage(
            renderer.domElement,
            0,
            renderer.domElement.height - this._targetSurface.scaledHeight,
            this._targetSurface.scaledWidth,
            this._targetSurface.scaledHeight,
            0,
            0,
            this._targetSurface.scaledWidth,
            this._targetSurface.scaledHeight
        );


    }

    setSize(width: number, height: number) {
        this.composer.setSize(width, height, false);
    }

    dispose() {
        if (this._renderer) {
            this._renderer.setAnimationLoop(null);
            this._renderer.dispose();
            this._renderer = undefined;
        }

        this.composer.dispose();
    }
}

const _r = new TitanRenderer();
// @ts-ignore
window.renderer = _r;
export default _r;