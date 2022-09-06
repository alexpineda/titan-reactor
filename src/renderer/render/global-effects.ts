import { FogOfWarEffect } from "@core/fogofwar";
import { PostProcessingBundle, Settings } from "common/types";
import { BloomEffect, BrightnessContrastEffect, DepthOfFieldEffect, Effect, EffectPass, OverrideMaterialManager, Pass, RenderPass, SelectiveBloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Scene, Vector3 } from "three";
import { renderComposer } from "./render-composer";

const createBloomEffect = (scene: Scene, camera: Camera, intensity: number, selective: boolean) => {
    return selective ? new SelectiveBloomEffect(scene, camera, {
        luminanceThreshold: 0.1,
        luminanceSmoothing: 1,

        //@ts-ignore
        mipmapBlur: true,
        intensity
    }) : new BloomEffect({
        luminanceThreshold: 0.1,
        luminanceSmoothing: 1,

        //@ts-ignore
        mipmapBlur: true,
        intensity
    })
}

const emptyPasses: Pass[] = [];

export enum EffectivePasses {
    None = 0,
    Base = 1,
    Standard = 2,
    Extended = 3,
    ExtendedWithDepth = 4,
}

export function isPostProcessing3D(obj: any): obj is Settings["postprocessing3d"] {
    return obj !== undefined && "depthFocalLength" in obj;
}

export class GlobalEffects implements PostProcessingBundle {
    #prevVersion = 0;
    #version = 0;
    #effectivePasses: EffectivePasses = EffectivePasses.None;
    camera: Camera;
    scene: Scene;
    options: Settings["postprocessing"] | Settings["postprocessing3d"];

    #renderPass: RenderPass;
    #passes: Pass[] = [];

    #tonemapping = new ToneMappingEffect({ mode: ToneMappingMode.OPTIMIZED_CINEON });
    #brightnessContrast = new BrightnessContrastEffect();
    #bloomEffect?: SelectiveBloomEffect | BloomEffect;
    #depthOfFieldEffect?: DepthOfFieldEffect;
    #fogOfWarEffect: FogOfWarEffect;

    constructor(camera: Camera, scene: Scene, options: Settings["postprocessing"] | Settings["postprocessing3d"], fogOfWar: FogOfWarEffect) {
        this.camera = camera;
        this.scene = scene;
        this.options = options;
        this.#renderPass = new RenderPass(scene, camera);
        this.#fogOfWarEffect = fogOfWar;
    }

    get options3d() {
        return isPostProcessing3D(this.options) ? this.options : null;
    }

    get effectivePasses() {
        return this.#effectivePasses;
    }

    set effectivePasses(_value: EffectivePasses) {
        let value = _value;
        if (value === EffectivePasses.ExtendedWithDepth && !isPostProcessing3D(this.options)) {
            value = EffectivePasses.Extended;
        } else if (value === EffectivePasses.Extended && isPostProcessing3D(this.options)) {
            value = EffectivePasses.ExtendedWithDepth;
        }
        if (this.#effectivePasses !== value) {
            this.#effectivePasses = value;
            OverrideMaterialManager.workaroundEnabled = value === EffectivePasses.Extended;
            this.needsUpdate = true;
        }
    }

    #updateEffects() {
        this.removeDepthOfField();
        this.removeBloom();

        const pass1: Effect[] = [];
        const pass2: Effect[] = [];

        renderComposer.getWebGLRenderer().toneMappingExposure = this.options.toneMapping;
        //@ts-ignore
        renderComposer.composer.multisampling = Math.min(this.options.antialias, renderComposer.getWebGLRenderer().capabilities.maxSamples);

        if (this.#effectivePasses === EffectivePasses.ExtendedWithDepth && isPostProcessing3D(this.options) && this.options.depthBlurQuality > 0) {

            this.#depthOfFieldEffect = new DepthOfFieldEffect(this.camera, {
                bokehScale: this.options.depthBokehScale,
                height: this.options.depthBlurQuality,
            });
            window.dof = this.#depthOfFieldEffect;

            pass1.push(this.#depthOfFieldEffect);
        }

        if (this.effectivePasses >= EffectivePasses.Extended && this.options.bloom > 0) {
            this.#bloomEffect = createBloomEffect(this.scene, this.camera, this.options.bloom, true);
            if (this.#bloomEffect instanceof SelectiveBloomEffect) {
                this.#bloomEffect.ignoreBackground = true;
                // this.#bloomEffect.depthMaskPass.epsilon = 0.001;/// and 0.00001
                if (this.#depthOfFieldEffect) {
                    pass2.push(this.#bloomEffect);
                } else {
                    pass1.push(this.#bloomEffect);
                }
            } else {
                pass1.push(this.#bloomEffect);
            }
        }

        const toneMappingPass = pass2.length ? pass2 : pass1;

        if (this.#effectivePasses > EffectivePasses.None) {
            if (this.options.fogOfWar > 0) {
                this.#fogOfWarEffect.opacity = this.options.fogOfWar;
                pass1.push(this.#fogOfWarEffect);
            }
        }

        if (this.effectivePasses > EffectivePasses.Base) {

            if (this.options.toneMapping > 0)
                toneMappingPass.push(this.#tonemapping);

            if (this.options.brightness !== 0 || this.options.contrast !== 0) {
                this.#brightnessContrast.brightness = this.options.brightness;
                this.#brightnessContrast.contrast = this.options.contrast;
                toneMappingPass.push(this.#brightnessContrast);
            }
        }

        return [pass1, pass2]
    }

    get passes(): Pass[] {
        if (this.effectivePasses === EffectivePasses.None) {
            return emptyPasses;
        }
        if (this.#version !== this.#prevVersion) {
            this.#prevVersion = this.#version;
            this.#passes.length = 0
            this.#passes.push(this.#renderPass);
            for (const passEffects of this.#updateEffects()) {
                if (passEffects.length) {
                    this.#passes.push(new EffectPass(this.camera, ...passEffects));
                }
            }
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

    updateExtended(camera: PerspectiveCamera | OrthographicCamera, target: Vector3) {
        if (this.#depthOfFieldEffect) {
            const distance = this.#depthOfFieldEffect.calculateFocusDistance(target);
            this.#depthOfFieldEffect.circleOfConfusionMaterial.focusDistance = distance;
            this.#depthOfFieldEffect.circleOfConfusionMaterial.adoptCameraSettings(camera);
        }
    }

    updateCamera(camera: PerspectiveCamera | OrthographicCamera) {
        //@ts-ignore
        this.#renderPass.camera = camera;
        this.#fogOfWarEffect.camera = camera;
    }

    addBloomSelection(object: Object3D) {
        if (this.#bloomEffect instanceof SelectiveBloomEffect) {
            this.#bloomEffect!.selection.add(object);
        }
    }

    removeBloomSelection(object: Object3D) {
        if (this.#bloomEffect instanceof SelectiveBloomEffect) {
            this.#bloomEffect!.selection.delete(object);
        }
    }

    clearBloomSelection() {
        if (this.#bloomEffect instanceof SelectiveBloomEffect) {
            this.#bloomEffect!.selection.clear();
        }
    }

    dispose() {
        this.passes.forEach((pass) => pass.dispose());
    }

    set needsUpdate(val: boolean) {
        if (val) {
            this.#version++;
        }
    }
}