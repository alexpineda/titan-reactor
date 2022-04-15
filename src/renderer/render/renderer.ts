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

type CameraModeEffectsAndPasses = {
    effects: any[],
    passes: any[]
}
export class TitanRenderer {
    #renderer?: WebGLRenderer;
    #targetSurface = new CanvasTarget();
    #gamma = 0.9;
    #cameraMode: CameraModeEffectsAndPasses = {
        effects: [],
        passes: []
    };

    composer = new EffectComposer(null, {
        frameBufferType: HalfFloatType,
        multisampling: 0
    });

    constructor() {
        this.getWebGLRenderer();
    }

    get gamma() {
        return this.#gamma;
    }

    set gamma(value: number) {
        this.#gamma = value;
        if (this.#renderer) {
            this.#renderer.toneMappingExposure = value;
        }
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

        if (this.#targetSurface) {
            this.setSize(this.#targetSurface.scaledWidth, this.#targetSurface.scaledHeight);
        }

        return renderer;
    }

    setCameraModeEffectsAndPasses(cm: Partial<CameraModeEffectsAndPasses>) {
        this.composer.removeAllPasses();

        this.#cameraMode = {
            effects: (cm.effects ?? []).filter(effect => effect.camera),
            passes: cm.passes ?? []
        }

        for (const pass of this.#cameraMode.passes) {
            this.composer.addPass(pass);
        }
    }

    set targetSurface(surface: CanvasTarget) {
        this.#targetSurface = surface;
        this.#renderer?.setViewport(
            new Vector4(0, 0, surface.width, surface.height)
        );
        this.setSize(this.#targetSurface.scaledWidth, this.#targetSurface.scaledHeight);
    }

    changeCamera(camera: Camera) {
        let lastPass: any = null;

        for (const pass of this.#cameraMode.passes) {
            pass.camera = camera;
            pass.renderToScreen = false;
            if (pass.enabled) {
                lastPass = pass;
            }
        }
        lastPass.renderToScreen = true;

        for (const effect of this.#cameraMode.effects) {
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
            renderer.domElement.height - this.#targetSurface.scaledHeight,
            this.#targetSurface.scaledWidth,
            this.#targetSurface.scaledHeight,
            0,
            0,
            this.#targetSurface.scaledWidth,
            this.#targetSurface.scaledHeight
        );


    }

    setSize(width: number, height: number) {
        this.composer.setSize(width, height, false);
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
