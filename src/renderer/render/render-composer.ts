import {
    HalfFloatType,
    LinearSRGBColorSpace,
    ShaderChunk,
    SRGBColorSpace,
    Vector4,
    VSMShadowMap,
    WebGLRenderer,
} from "three";
import { EffectComposer, Pass } from "postprocessing";
import Surface from "../image/canvas/surface";
import { ColorManagement } from "three/src/math/ColorManagement";
import { globalEvents } from "../core/global-events";

ColorManagement.enabled = true;

// modify global shadow intensity
ShaderChunk.shadowmap_pars_fragment = ShaderChunk.shadowmap_pars_fragment.replace(
    "return shadow;",
    "return max( 0.3, shadow );"
);

export const createWebGLRenderer = () => {
    const renderer = new WebGLRenderer( {
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        antialias: false,
        stencil: false,
        depth: false,
        alpha: false,
        precision: "highp",
    } );
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
}

/**
 * Manages rendering using post processing.
 */
export class TitanRenderComposer {
    #renderer!: WebGLRenderer;
    #surfaceRef = new WeakRef( new Surface() );
    #prevBundle: any = null;

    composer = new EffectComposer( undefined, {
        frameBufferType: HalfFloatType,
        multisampling: 0,
        stencilBuffer: false,
        alpha: true,
        depthBuffer: true,
    } );

    constructor(surface?: Surface) {
        this.init();
        if (surface) {
            this.dstSurface = surface;
        }
    }

    init() {
        const renderer = ( this.#renderer = createWebGLRenderer() );

        this.composer.setRenderer( renderer );
        this.composer.autoRenderToScreen = false;

        renderer.domElement.addEventListener( "webglcontextlost", ( evt ) => {
            evt.preventDefault();
            globalEvents.emit( "webglcontextlost" );
        } );

        renderer.domElement.addEventListener( "webglcontextrestored", () => {
            globalEvents.emit( "webglcontextrestored" );
        } );
    }

    get glRenderer() {
        return this.#renderer;
    }

    get bufferCanvas() {
        return this.#renderer.domElement;
    }

    setAnimationLoop( fn: Parameters<WebGLRenderer["setAnimationLoop"]>[0] ) {
        this.#renderer.setAnimationLoop( fn );
    }

    setBundlePasses( bundle: { passes: Pass[] } ) {
        if ( bundle === this.#prevBundle ) {
            return;
        }
        this.#prevBundle = bundle;

        this.composer.removeAllPasses();
        let lastPass: any = null;
        for ( const pass of bundle.passes ) {
            pass.renderToScreen = false;
            this.composer.addPass( pass );
            if ( pass.enabled ) {
                lastPass = pass;
            }
        }
        lastPass.renderToScreen = true;
    }

    set dstSurface( surface: Surface ) {
        this.#surfaceRef = new WeakRef( surface );
        this.#renderer?.setViewport(
            new Vector4( 0, 0, surface.bufferWidth, surface.bufferHeight )
        );
        this.setSize( surface.bufferWidth, surface.bufferHeight );
    }

    /**
     * Renders the scene to the screen. 
     * If a viewport is provided, only that part of the screen will be rendered to.
     */
    render( delta: number, viewport?: Vector4 ) {
        // If a viewport is provided, we need to enable the scissor test so that only that part of the screen is rendered to.
        if ( viewport ) {
            this.#renderer!.setScissorTest( true );
            this.#renderer!.setViewport( viewport );
            this.#renderer!.setScissor( viewport );
        }

        // Render the scene using the post-processing pipeline.
        this.composer.render( delta );

        // If a viewport is provided, we need to disable the scissor test so that the rest of the screen is rendered to as well.
        if ( viewport ) {
            this.#renderer!.setScissorTest( false );
        }
    }

    /**
     * Copies the contents of the renderer to the target surface.
     */
    drawBuffer() {
        const surface = this.#surfaceRef.deref();

        if ( surface?.canvas === this.#renderer!.domElement ) {
            return;
        }

        surface!.ctx!.drawImage(
            this.#renderer!.domElement,
            0,
            this.#renderer!.domElement.height - surface!.bufferHeight,
            surface!.bufferWidth,
            surface!.bufferHeight,
            0,
            0,
            surface!.bufferWidth,
            surface!.bufferHeight
        );
    }

    setSize( bufferWidth: number, bufferHeight: number ) {
        this.composer.setSize( bufferWidth, bufferHeight, false );
    }

    dispose() {
        this.#renderer.setAnimationLoop( null );
        this.#renderer.dispose();
        this.composer.dispose();
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
