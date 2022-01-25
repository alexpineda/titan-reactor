import CanvasTarget from "../../common/image/canvas/canvas-target";
import {
    CineonToneMapping,
    HalfFloatType,
    PCFSoftShadowMap,
    PerspectiveCamera,
    ReinhardToneMapping,
    Scene,
    sRGBEncoding,
    Vector4,
    WebGLRenderer,
} from "three";
import {
    //@ts-ignore
    EffectComposer,
} from "postprocessing";
import { createPasses, Passes } from "./composer-passes";
import Janitor from "../utils/janitor";

const createWebGLRenderer = () => {
    const renderer = new WebGLRenderer({
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
        antialias: false,
        stencil: false,
        depth: false,
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.debug.checkShaderErrors = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;

    renderer.toneMapping = CineonToneMapping;
    renderer.toneMappingExposure = 0.9;

    return renderer;
};
export class TitanRenderer {
    private _renderer?: WebGLRenderer;
    private _targetSurface = new CanvasTarget();
    private _rendererJanitor = new Janitor();
    readonly composerPasses = createPasses();
    composer = new EffectComposer(null, {
        frameBufferType: HalfFloatType,
        multisampling: 4
    });

    constructor() {
        this.getWebGLRenderer();
    }

    getWebGLRenderer() {
        if (this._renderer) {
            return this._renderer;
        }
        const renderer = this._renderer = createWebGLRenderer();
        this.composer.renderer = renderer;
        this.composer.renderer.autoClear = false;

        this.composer.inputBuffer = this.composer.createBuffer(
            true,
            false,
            HalfFloatType,
            4
        );

        this.composer.outputBuffer = this.composer.inputBuffer.clone();


        this.composer.autoRenderToScreen = false;
        for (const pass of this.composerPasses.passes) {
            this.composer.addPass(pass);
        }
        this.togglePasses(Passes.Render);

        renderer.domElement.addEventListener(
            "webglcontextlost",
            () => {
                this._renderer?.setAnimationLoop(null);
                this._renderer = undefined;
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

    render(scene: Scene, camera: PerspectiveCamera, delta: number, viewport?: Vector4) {
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

    togglePasses(...whichOnes: Passes[]) {
        this.composerPasses.togglePasses(...whichOnes);
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
