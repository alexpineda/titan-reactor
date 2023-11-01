import {
    Camera,
    HalfFloatType,
    LinearSRGBColorSpace,
    Scene,
    ShaderChunk,
    SRGBColorSpace,
    Vector4,
    VSMShadowMap,
    WebGLRenderer,
} from "three";
import { EffectComposer, Pass } from "postprocessing";
import { ColorManagement } from "three/src/math/ColorManagement";
import { globalEvents } from "../core/global-events";

ColorManagement.enabled = true;

// modify global shadow intensity
ShaderChunk.shadowmap_pars_fragment = ShaderChunk.shadowmap_pars_fragment.replace(
    "return shadow;",
    "return max( 0.3, shadow );"
);

export const createWebGLRenderer = () => {
    const renderer = new WebGLRenderer({
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        antialias: false,
        stencil: false,
        depth: false,
        alpha: false,
        precision: "highp",
    });
    renderer.debug.checkShaderErrors = process.env.NODE_ENV === "development";
    renderer.xr.enabled = true;

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.sortObjects = true;
    renderer.autoClear = false;
    return renderer;
};

export const useWebGLRenderer = async (fn: (renderer: WebGLRenderer) => any) => {
    const renderer = createWebGLRenderer();
    await fn(renderer);
    renderer.dispose();
};

type BundledPasses = { passes: Pass[] };

/**
 * Manages rendering using post processing.
 */
export class TitanRenderComposer {
    #renderer!: WebGLRenderer;
    #prevBundle: any = null;
    #dstCanvas!: HTMLCanvasElement;
    #dstContext: CanvasRenderingContext2D | null = null;
    #observer?: ResizeObserver;

    composer = new EffectComposer(undefined, {
        frameBufferType: HalfFloatType,
        multisampling: 0,
        stencilBuffer: false,
        alpha: true,
        depthBuffer: true,
    });

    constructor(surface?: HTMLCanvasElement) {
        this.init();
        this.dstCanvas = surface ?? this.#renderer.domElement;
    }

    init() {
        const renderer = (this.#renderer = createWebGLRenderer());

        this.composer.setRenderer(renderer);
        this.composer.autoRenderToScreen = false;

        renderer.domElement.addEventListener("webglcontextlost", (evt) => {
            evt.preventDefault();
            globalEvents.emit("webglcontextlost");
        });

        renderer.domElement.addEventListener("webglcontextrestored", () => {
            globalEvents.emit("webglcontextrestored");
        });

        renderer.xr.addEventListener("sessionstart", () => {
            // this.composer.dispose();
        });

        renderer.xr.addEventListener("sessionend", () => {
            // this.composer = new EffectComposer(undefined, {
            //     frameBufferType: HalfFloatType,
            //     multisampling: 0,
            //     stencilBuffer: false,
            //     alpha: true,
            //     depthBuffer: true,
            // });
        });
    }

    get glRenderer() {
        return this.#renderer;
    }

    get srcCanvas() {
        return this.#renderer.domElement;
    }

    setAnimationLoop(fn: Parameters<WebGLRenderer["setAnimationLoop"]>[0]) {
        this.#renderer.setAnimationLoop(fn);
    }

    #setBundledPasses(bundle: BundledPasses) {
        if (bundle === this.#prevBundle) {
            return;
        }
        this.#prevBundle = bundle;

        this.composer.removeAllPasses();
        let lastPass: any = null;
        for (const pass of bundle.passes) {
            pass.renderToScreen = false;
            this.composer.addPass(pass);
            if (pass.enabled) {
                lastPass = pass;
            }
        }
        lastPass.renderToScreen = true;
    }

    set dstCanvas(surface: HTMLCanvasElement) {
        if (this.#observer) {
            this.#observer.disconnect();
        }
        this.#dstCanvas = surface;
        this.#renderer.setViewport(new Vector4(0, 0, surface.width, surface.height));

        this.#dstContext = null;

        if (surface !== this.#renderer.domElement) {
            this.#dstContext = surface.getContext("2d");
            if (!this.#dstContext) {
                throw new Error("Could not get canvas context");
            }
        }

        this.composer.setSize(surface.width, surface.height, false);
        this.#observer = new ResizeObserver(() => {
            this.composer.setSize(surface.width, surface.height, false);
        });
        this.#observer.observe(surface);
    }

    /**
     * Renders the scene to the screen.
     * If a viewport is provided, only that part of the screen will be rendered to.
     */
    render(
        delta: number,
        scene: Scene,
        camera: Camera,
        viewport: Vector4 | null,
        bundledPasses: BundledPasses | null
    ) {
        this.composer.setMainCamera( camera );
        this.composer.setMainScene( scene );

        this.#renderer.setViewport(
            0,
            0,
            this.#dstCanvas.width,
            this.#dstCanvas.height
        );

        // Render the scene using the post-processing pipeline.
        if (bundledPasses && this.#renderer.xr.isPresenting === false) {

            this.#setBundledPasses(bundledPasses);
            // If a viewport is provided, we need to enable the scissor test so that only that part of the screen is rendered to.
            if (viewport) {
                this.#renderer!.setScissorTest(true);
                this.#renderer!.setViewport(viewport);
                this.#renderer!.setScissor(viewport);
            }

            this.composer.render(delta);

            // If a viewport is provided, we need to disable the scissor test so that the rest of the screen is rendered to as well.
            if (viewport) {
                this.#renderer!.setScissorTest(false);
            }
        } else {
            this.#renderer.render( scene, camera );
        }

        if (this.#dstContext) {
            this.#copySrcToDst();
        }
    }

    /**
     * Copies the contents of the renderer to the target surface.
     */
    #copySrcToDst() {
        const surface = this.#dstCanvas;

        if (surface === this.#renderer!.domElement) {
            return;
        }

        if (this.#dstContext) {
            this.#dstContext.drawImage(
                this.#renderer!.domElement,
                0,
                this.#renderer!.domElement.height - surface!.height,
                surface!.width,
                surface!.height,
                0,
                0,
                surface!.width,
                surface!.height
            );
        } else {
            console.warn("context error");
        }
    }

    dispose() {
        this.#renderer.setAnimationLoop(null);
        this.#renderer.dispose();
        this.composer.dispose();
        this.#dstContext = null;
        this.#observer?.disconnect();
    }

    // for rendering atlases ahead of time like terrain textures, icons, etc.
    preprocessStart() {
        this.#renderer!.autoClear = false;
        this.#renderer!.outputColorSpace = LinearSRGBColorSpace;
    }

    preprocessEnd() {
        this.#renderer!.autoClear = false;
        this.#renderer!.outputColorSpace = SRGBColorSpace;
    }
}

export const renderComposer = new TitanRenderComposer();
