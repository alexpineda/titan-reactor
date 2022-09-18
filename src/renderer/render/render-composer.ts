import {
    HalfFloatType,
    LinearEncoding,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    Vector4,
    VSMShadowMap,
    WebGLRenderer,
} from "three";
import {
    EffectComposer, Pass
} from "postprocessing";
import Surface from "../image/canvas/surface";
import { ColorManagement } from "three/src/math/ColorManagement";
import { globalEvents } from "../core/global";


//@ts-ignore
ColorManagement.legacyMode = false;

const createWebGLRenderer = () => {
    const renderer = new WebGLRenderer({
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        antialias: false,
        stencil: false,
        depth: false,
        alpha: false,
        precision: "highp",
    });
    renderer.outputEncoding = sRGBEncoding;
    renderer.debug.checkShaderErrors = process.env.NODE_ENV === "development";

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = VSMShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.sortObjects = true;
    renderer.autoClear = false;
    return renderer;
};

export class TitanRenderComposer {
    #renderer?: WebGLRenderer;
    #surfaceRef = new WeakRef(new Surface());
    onRestoreContext?: () => void;
    composer = new EffectComposer(undefined, {
        frameBufferType: HalfFloatType,
        multisampling: 0,
        stencilBuffer: false,
        alpha: true,
        depthBuffer: true,
    });

    constructor() {
        this.getWebGLRenderer();
    }

    // TODO don't get another renderer if context is lost
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
                globalEvents.emit("webglcontextlost");
            }
        );

        renderer.domElement.addEventListener(
            "webglcontextrestored",
            () => {
                globalEvents.emit("webglcontextrestored");
            });

        return renderer;
    }

    setBundlePasses(...args: { passes: Pass[] }[]) {
        this.composer.removeAllPasses();
        let lastPass: any = null;
        for (const bundle of args) {
            for (const pass of bundle.passes) {
                pass.renderToScreen = false;
                if (pass.enabled) {
                    lastPass = pass;
                    this.composer.addPass(pass);
                }
            }
        }
        lastPass.renderToScreen = true;
    }

    set targetSurface(surface: Surface) {
        this.#surfaceRef = new WeakRef(surface);
        this.#renderer?.setViewport(
            new Vector4(0, 0, surface.bufferWidth, surface.bufferHeight)
        );
        this.setSize(surface.bufferWidth, surface.bufferHeight);
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
        const surface = this.#surfaceRef.deref();

        surface!.ctx.drawImage(
            renderer.domElement,
            0,
            renderer.domElement.height - surface!.bufferHeight,
            surface!.bufferWidth,
            surface!.bufferHeight,
            0,
            0,
            surface!.bufferWidth,
            surface!.bufferHeight
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

    compileScene(scene: Scene) {
        const precompileCamera = new PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0, 10000);
        precompileCamera.updateProjectionMatrix();
        precompileCamera.position.setY(1000)
        precompileCamera.lookAt(0, 0, 0);
        this.getWebGLRenderer().render(scene, precompileCamera);
    }

    // for rendering atlases ahead of time like terrain textures, icons, etc.
    preprocessStart() {
        this.getWebGLRenderer().autoClear = false;
        this.getWebGLRenderer().outputEncoding = LinearEncoding;
    }

    preprocessEnd() {
        this.getWebGLRenderer().autoClear = false;
        this.getWebGLRenderer().outputEncoding = sRGBEncoding;
    }
}

export const renderComposer = new TitanRenderComposer();
