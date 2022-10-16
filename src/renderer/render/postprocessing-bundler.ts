import { FogOfWarEffect } from "@core/fogofwar";
import { log } from "@ipc/log";
import { Settings } from "common/types";
import {
    BlendFunction,
    BloomEffect,
    BrightnessContrastEffect,
    CopyPass,
    DepthOfFieldEffect,
    Effect,
    EffectPass,
    OutlineEffect,
    OverrideMaterialManager,
    Pass,
    RenderPass,
    SelectiveBloomEffect,
    ToneMappingEffect,
    ToneMappingMode,
} from "postprocessing";
import {
    Camera,
    Object3D,
    OrthographicCamera,
    PerspectiveCamera,
    Scene,
    Vector3,
} from "three";
import { renderComposer } from "./render-composer";

const createBloomEffect = (
    scene: Scene,
    camera: Camera,
    intensity: number,
    selective: boolean
) => {
    return selective
        ? new SelectiveBloomEffect( scene, camera, {
              luminanceThreshold: 0.1,
              luminanceSmoothing: 1,

              mipmapBlur: true,
              intensity,
          } )
        : new BloomEffect( {
              luminanceThreshold: 0.1,
              luminanceSmoothing: 1,

              mipmapBlur: true,
              intensity,
          } );
};

const emptyPasses: Pass[] = [];

export enum EffectivePasses {
    None = 0,
    Base = 1,
    Standard = 2,
    Extended = 3,
    ExtendedWithDepth = 4,
}

export function isPostProcessing3D( obj: any ): obj is Settings["postprocessing3d"] {
    return obj !== undefined && "depthFocalLength" in obj;
}

export class PostProcessingBundler {
    #prevVersion = 0;
    #version = 0;
    #effectivePasses: EffectivePasses = EffectivePasses.None;
    camera: Camera;
    scene: Scene;
    options: Settings["postprocessing"] | Settings["postprocessing3d"];

    #renderPass: RenderPass;
    #overlayPass: RenderPass;
    #passes: Pass[] = [];

    #tonemapping = new ToneMappingEffect( { mode: ToneMappingMode.OPTIMIZED_CINEON } );
    #brightnessContrast = new BrightnessContrastEffect();
    #bloomEffect?: SelectiveBloomEffect | BloomEffect;
    #depthOfFieldEffect?: DepthOfFieldEffect;
    #fogOfWarEffect: FogOfWarEffect;

    debug = false;
    get debugSelection() {
        return this.#outlineEffect?.selection;
    }

    #outlineEffect?: OutlineEffect;

    readonly overlayScene = new Scene();
    readonly overlayCamera = new PerspectiveCamera( 45, 1, 0.1, 100 );

    constructor(
        camera: Camera,
        scene: Scene,
        options: Settings["postprocessing"] | Settings["postprocessing3d"],
        fogOfWar: FogOfWarEffect
    ) {
        this.camera = camera;
        this.scene = scene;
        this.options = options;

        this.#renderPass = new RenderPass( scene, camera );
        this.#renderPass.clear = true;

        this.overlayCamera.position.set( 0, 0, 10 );
        this.overlayCamera.updateProjectionMatrix();
        this.overlayCamera.updateMatrixWorld();
        this.#overlayPass = new RenderPass( this.overlayScene, this.overlayCamera );
        this.#overlayPass.clear = false;
        this.#overlayPass.skipShadowMapUpdate = true;
        this.#overlayPass.ignoreBackground = true;

        this.#fogOfWarEffect = fogOfWar;
    }

    get options3d() {
        return isPostProcessing3D( this.options ) ? this.options : null;
    }

    get effectivePasses() {
        return this.#effectivePasses;
    }

    set effectivePasses( _value: EffectivePasses ) {
        let value = _value;

        if (
            value === EffectivePasses.ExtendedWithDepth &&
            !isPostProcessing3D( this.options )
        ) {
            value = EffectivePasses.Extended;
        } else if (
            value === EffectivePasses.Extended &&
            isPostProcessing3D( this.options )
        ) {
            value = EffectivePasses.ExtendedWithDepth;
        }

        if ( this.#effectivePasses !== value ) {
            this.#effectivePasses = value;
            OverrideMaterialManager.workaroundEnabled =
                value === EffectivePasses.Extended;
            this.needsUpdate = true;
        }
    }

    #updateEffects() {
        this.removeDepthOfField();
        this.removeBloom();

        const pass1: Effect[] = [];
        const pass2: Effect[] = [];

        renderComposer.getWebGLRenderer().toneMappingExposure =
            this.options.toneMapping;
        renderComposer.composer.multisampling = Math.min(
            this.options.antialias,
            // @ts-expect-error
            renderComposer.getWebGLRenderer().capabilities.maxSamples as number
        );

        if (
            this.#effectivePasses === EffectivePasses.ExtendedWithDepth &&
            isPostProcessing3D( this.options ) &&
            this.options.depthBlurQuality > 0
        ) {
            this.#depthOfFieldEffect = new DepthOfFieldEffect( this.camera, {
                bokehScale: this.options.depthBokehScale,
                height: this.options.depthBlurQuality,
            } );

            pass1.push( this.#depthOfFieldEffect );
        }

        if (
            this.effectivePasses >= EffectivePasses.Extended &&
            this.options.bloom > 0
        ) {
            this.#bloomEffect = createBloomEffect(
                this.scene,
                this.camera,
                this.options.bloom,
                true
            );
            if ( this.#bloomEffect instanceof SelectiveBloomEffect ) {
                this.#bloomEffect.ignoreBackground = true;
                // dummy object
                this.#bloomEffect.selection.add( new Object3D() );
                if ( this.#depthOfFieldEffect ) {
                    pass2.push( this.#bloomEffect );
                } else {
                    pass1.push( this.#bloomEffect );
                }
            } else {
                pass1.push( this.#bloomEffect );
            }
        }

        const toneMappingPass = pass2.length ? pass2 : pass1;

        if ( this.#effectivePasses > EffectivePasses.None ) {
            if ( this.options.fogOfWar > 0 ) {
                this.#fogOfWarEffect.opacity = this.options.fogOfWar;
                pass1.push( this.#fogOfWarEffect );
            }
        }

        if ( this.effectivePasses > EffectivePasses.Base ) {
            if ( this.options.toneMapping > 0 ) toneMappingPass.push( this.#tonemapping );

            if ( this.options.brightness !== 0 || this.options.contrast !== 0 ) {
                this.#brightnessContrast.brightness = this.options.brightness;
                this.#brightnessContrast.contrast = this.options.contrast;
                toneMappingPass.push( this.#brightnessContrast );
            }
        }

        if ( this.debug ) {
            this.#outlineEffect = new OutlineEffect( this.scene, this.camera, {
                blendFunction: BlendFunction.SCREEN,
                multisampling: 0,
                patternScale: 1,
                visibleEdgeColor: 0xffffff,
                hiddenEdgeColor: 0x22090a,
                resolutionScale: 0.5,
                blur: false,
                xRay: true,
            } );
            return [[this.#outlineEffect]];
        }
        return [pass1, pass2];
    }

    get passes(): Pass[] {
        if ( this.effectivePasses === EffectivePasses.None ) {
            return emptyPasses;
        }
        if ( this.#version !== this.#prevVersion ) {
            this.dispose();
            this.#prevVersion = this.#version;
            this.#passes.length = 0;
            this.#passes.push( this.#renderPass );
            for ( const passEffects of this.#updateEffects() ) {
                if ( passEffects.length ) {
                    const pass = new EffectPass( this.camera, ...passEffects );
                    this.#passes.push( pass );
                }
            }
            this.#passes.push( this.#overlayPass );
            this.#passes.push( new CopyPass() );
        }
        return this.#passes;
    }

    removeBloom() {
        this.#bloomEffect?.dispose();
        this.#bloomEffect = undefined;
    }

    removeDepthOfField() {
        this.#depthOfFieldEffect?.dispose();
        this.#depthOfFieldEffect = undefined;
    }

    updateExtended( camera: PerspectiveCamera | OrthographicCamera, target: Vector3 ) {
        if ( this.#depthOfFieldEffect ) {
            const distance = this.#depthOfFieldEffect.calculateFocusDistance( target );
            this.#depthOfFieldEffect.circleOfConfusionMaterial.focusDistance = distance;
            this.#depthOfFieldEffect.circleOfConfusionMaterial.adoptCameraSettings(
                camera
            );
        }
    }

    updateCamera( camera: PerspectiveCamera | OrthographicCamera ) {
        //@ts-expect-error
        this.#renderPass.camera = camera;
        this.#fogOfWarEffect.camera = camera;
    }

    addBloomSelection( object: Object3D ) {
        if ( this.#bloomEffect instanceof SelectiveBloomEffect ) {
            object.layers.enable( this.#bloomEffect.selection.layer );
        }
    }

    dispose() {
        log.debug( "disposing passes" );
        this.#passes.forEach( ( pass ) => pass.dispose() );
    }

    set needsUpdate( val: boolean ) {
        if ( val ) {
            this.#version++;
        }
    }
}
