import {
    Camera,
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
    return renderer;
};

type PostProcessingBundle = {
    effects: any[],
    passes: any[]
}
export class TitanRenderer {
    #renderer?: WebGLRenderer;
    #targetSurface = new Surface();
    #gamma = 0.9;
    #postProcessingBundle: PostProcessingBundle = {
        effects: [],
        passes: []
    };

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
        renderer.toneMappingExposure = this.#gamma;

        this.composer.setRenderer(renderer);
        this.composer.autoRenderToScreen = false;

        renderer.domElement.addEventListener(
            "webglcontextlost",
            () => {
                this.#renderer?.setAnimationLoop(null);
                // this.getWebGLRenderer();
                // this._renderer = undefined;
            }
        );

        this.setSize(this.targetSurface.bufferWidth, this.targetSurface.bufferHeight);

        return renderer;
    }

    setPostProcessingBundle(cm: Partial<PostProcessingBundle>) {
        this.composer.removeAllPasses();

        this.#postProcessingBundle = {
            effects: (cm.effects ?? []).filter(effect => effect.camera),
            passes: cm.passes ?? []
        }

        for (const pass of this.#postProcessingBundle.passes) {
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

    updatePostProcessingCamera(camera: Camera) {
        let lastPass: any = null;

        for (const pass of this.#postProcessingBundle.passes) {
            pass.camera = camera;
            pass.renderToScreen = false;
            if (pass.enabled) {
                lastPass = pass;
            }
        }
        lastPass.renderToScreen = true;

        for (const effect of this.#postProcessingBundle.effects) {
            effect.camera = camera;
        }

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

export default new TitanRenderer();
