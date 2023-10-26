import { FogOfWarEffect } from "@core/fogofwar";
import { log } from "@ipc/log";
import { Settings } from "common/types";
import {
    BrightnessContrastEffect,
    CopyPass,
    DepthOfFieldEffect,
    EffectPass,
    KawaseBlurPass,
    KernelSize,
    Pass,
    RenderPass,
    SelectiveBloomEffect,
    ToneMappingEffect,
    ToneMappingMode,
} from "postprocessing";
import { Camera, Object3D, PerspectiveCamera, Scene, Vector3 } from "three";
import { TitanRenderComposer } from "./render-composer";

export function isPostProcessing3D( obj: any ): obj is Settings["postprocessing3d"] {
    return obj !== undefined && "depthFocalLength" in obj;
}

class OverlayPass extends RenderPass {
    override set mainCamera( _: Camera ) {}

    override set mainScene( _: Scene ) {}
}

const _dummyScene = new Scene(),
    _dummyCamera = new PerspectiveCamera();

export class PostProcessingBundler {
    options: Settings["postprocessing"] | Settings["postprocessing3d"];

    #renderPass: RenderPass;
    #overlayPass: RenderPass;
    #passes: Pass[] = [];

    #brightnessContrast = new BrightnessContrastEffect();
    #brightnessContrastPass = new EffectPass( _dummyCamera, this.#brightnessContrast );

    #tonemapping = new ToneMappingEffect( { mode: ToneMappingMode.ACES_FILMIC } );
    #tonemappingPass = new EffectPass( _dummyCamera, this.#tonemapping );

    #bloomEffect: SelectiveBloomEffect;
    #bloomPass: EffectPass;

    #depthOfFieldEffect: DepthOfFieldEffect;
    #depthOfFieldPass: Pass;

    #fogOfWarEffect: FogOfWarEffect;
    #fogOfWarPass: EffectPass;

    #copyPass = new CopyPass();

    renderModeTransitionPass: KawaseBlurPass;

    readonly overlayScene = new Scene();
    readonly overlayCamera = new PerspectiveCamera( 45, 1, 0.1, 100 );

    constructor(
        options: Settings["postprocessing"] | Settings["postprocessing3d"],
        fogOfWar: FogOfWarEffect
    ) {
        this.options = options;

        this.#renderPass = new RenderPass( _dummyScene, _dummyCamera );
        this.#renderPass.clear = true;

        this.overlayCamera.position.set( 0, 0, 10 );
        this.overlayCamera.updateProjectionMatrix();
        this.overlayCamera.updateMatrixWorld();
        this.#overlayPass = new OverlayPass( this.overlayScene, this.overlayCamera );
        this.#overlayPass.clear = false;
        this.#overlayPass.skipShadowMapUpdate = true;
        this.#overlayPass.ignoreBackground = true;

        this.renderModeTransitionPass = new KawaseBlurPass( {
            kernelSize: KernelSize.LARGE,
        } );
        this.renderModeTransitionPass.enabled = false;

        this.#depthOfFieldEffect = new DepthOfFieldEffect( _dummyCamera );
        this.#depthOfFieldPass = new EffectPass( _dummyCamera, this.#depthOfFieldEffect );

        this.#fogOfWarEffect = fogOfWar;
        this.#fogOfWarPass = new EffectPass( _dummyCamera, this.#fogOfWarEffect );

        this.#bloomEffect = new SelectiveBloomEffect( _dummyScene, _dummyCamera, {
            luminanceThreshold: 0.1,
            luminanceSmoothing: 1,

            mipmapBlur: true,
            intensity: this.options.bloom,
        } );
        this.#bloomEffect.selection.add( new Object3D() );
        this.#bloomPass = new EffectPass( _dummyCamera, this.#bloomEffect );

        this.#passes = [
            this.#renderPass,
            // this.#depthOfFieldPass,
            this.#fogOfWarPass,
            this.#bloomPass,
            this.#brightnessContrastPass,
            this.#tonemappingPass,
            this.renderModeTransitionPass,
            this.#overlayPass,
            this.#copyPass,
        ];
    }

    enablePixelation( enabled: boolean ) {
        this.renderModeTransitionPass.enabled = enabled;
    }

    setPixelation( size: number ) {
        this.renderModeTransitionPass.blurMaterial.scale = size;
    }

    get options3d() {
        return isPostProcessing3D( this.options ) ? this.options : null;
    }

    #createDof( height: number ) {
        this.#depthOfFieldEffect = new DepthOfFieldEffect( _dummyCamera, {
            height,
        } );
        this.#depthOfFieldPass = new EffectPass( _dummyCamera, this.#depthOfFieldEffect );
    }

    #updateDoFPass() {
        const depthOfFieldEnabled =
            isPostProcessing3D( this.options ) && this.options.depthBlurQuality > 0;

        if ( depthOfFieldEnabled ) {
            // dev only
            if (
                this.#depthOfFieldEffect.resolution.preferredHeight !==
                this.options3d!.depthBlurQuality
            ) {
                console.log( "creating dof" );
                this.#createDof( this.options3d!.depthBlurQuality );
            }

            this.#depthOfFieldEffect.bokehScale = this.options3d!.depthBokehScale;
        }
        this.#depthOfFieldPass.enabled = depthOfFieldEnabled;
    }

    #updateBloomPass() {
        this.#bloomEffect.intensity = this.options.bloom;
        this.#bloomPass.enabled = this.options.bloom > 0;
    }

    update( renderComposer: TitanRenderComposer ) {
        renderComposer.composer.multisampling = Math.min(
            this.options.antialias,
            renderComposer.getWebGLRenderer().capabilities.maxSamples
        );

        this.#fogOfWarEffect.opacity = this.options.fogOfWar;
        this.#fogOfWarPass.enabled = this.options.fogOfWar > 0;

        this.#updateDoFPass();
        this.#updateBloomPass();

        this.#brightnessContrast.brightness = this.options.brightness;
        this.#brightnessContrast.contrast = this.options.contrast;

        this.#tonemappingPass.enabled = isPostProcessing3D( this.options );

        if ( isPostProcessing3D( this.options ) ) {
            renderComposer.getWebGLRenderer().toneMappingExposure =
                this.options3d!.toneMapping;
        }
    }

    get passes(): Pass[] {
        return this.#passes;
    }

    updateDofTarget( target: Vector3 ) {
        const distance = this.#depthOfFieldEffect.calculateFocusDistance( target );
        this.#depthOfFieldEffect.circleOfConfusionMaterial.focusDistance = distance;
    }

    addBloomSelection( object: Object3D ) {
        object.layers.enable( this.#bloomEffect.selection.layer );
    }

    dispose() {
        log.debug( "disposing passes" );
    }
}
