import {
    HalfFloatType,
    PCFSoftShadowMap,
    sRGBEncoding,
    Vector4,
    WebGLRenderer,
} from "three";
import {
    EffectComposer,
} from "postprocessing";
import { rendererIsDev } from "../utils/renderer-utils";
import Surface from "../image/canvas/surface";
import settingsStore from "@stores/settings-store";
import { PostProcessingBundleDTO } from "common/types";

const createWebGLRenderer = () => {
    let settings = settingsStore().data;

    const renderer = new WebGLRenderer({
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        antialias: false,
        stencil: false,
        depth: false,
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.debug.checkShaderErrors = rendererIsDev || settings.util.debugMode;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.sortObjects = true;
    renderer.autoClear = false;
    return renderer;
};

export class TitanRenderComposer {
    #renderer?: WebGLRenderer;
    #targetSurface = new Surface();
    onRestoreContext?: () => void;
    composer = new EffectComposer(undefined, {
        frameBufferType: HalfFloatType,
        multisampling: 0
    });

    constructor() {
        this.getWebGLRenderer();
    }

    getWebGLRenderer() {
        if (this.#renderer) {
            return this.#renderer;
        }
        const renderer = this.#renderer = createWebGLRenderer();

        this.composer.setRenderer(renderer);
        this.composer.autoRenderToScreen = false;

        renderer.domElement.addEventListener(
            "webglcontextlost",
            (evt) => {
                evt.preventDefault();
            }
        );

        renderer.domElement.addEventListener(
            "webglcontextrestored",
            () => this.onRestoreContext && this.onRestoreContext())

        this.setSize(this.targetSurface.bufferWidth, this.targetSurface.bufferHeight);

        return renderer;
    }

    setBundlePasses(bundle: Pick<PostProcessingBundleDTO, "passes">) {
        this.composer.removeAllPasses();
        for (const pass of bundle.passes) {
            this.composer.addPass(pass);
        }
    }

    get targetSurface() {
        return this.#targetSurface;
    }

    set targetSurface(surface: Surface) {
        if (this.#targetSurface === surface) {
            return;
        }
        this.#targetSurface = surface;
        this.#renderer?.setViewport(
            new Vector4(0, 0, surface.bufferWidth, surface.bufferHeight)
        );
        this.setSize(this.#targetSurface.bufferWidth, this.#targetSurface.bufferHeight);
    }

    render(delta: number, viewport?: Vector4) {
        const renderer = this.getWebGLRenderer();

        if (viewport) {
            renderer.setScissorTest(true);
            renderer.setViewport(viewport);
            renderer.setScissor(viewport);
        }

        this.composer.render(delta);

        if (viewport) {
            renderer.setScissorTest(false);
        }

    }

    renderBuffer() {
        const renderer = this.getWebGLRenderer();
        this.#targetSurface.ctx.drawImage(
            renderer.domElement,
            0,
            renderer.domElement.height - this.#targetSurface.bufferHeight,
            this.#targetSurface.bufferWidth,
            this.#targetSurface.bufferHeight,
            0,
            0,
            this.#targetSurface.bufferWidth,
            this.#targetSurface.bufferHeight
        );
    }

    setSize(bufferWidth: number, bufferHeight: number) {
        this.composer.setSize(bufferWidth, bufferHeight, false);
    }

    dispose() {
        if (this.#renderer) {
            this.#renderer.setAnimationLoop(null);
            this.#renderer.dispose();
            this.#renderer = undefined;
        }

        this.composer.dispose();
    }
}

export default new TitanRenderComposer();
